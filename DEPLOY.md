# Deploying to AWS — S3 + CloudFront + Lambda Function URL

This is **Option A** from the architecture discussion: cheapest deploy
(~$1–2/month at studio traffic), pages on S3 + CloudFront, the contact
form handler as a standalone AWS Lambda. CloudFront fronts both so the
visitor's browser sees a single origin.

```
                 ┌──────────────────────────────────────┐
                 │       CloudFront distribution        │
                 │  chromosome-designs.com (or alias)   │
                 └────┬───────────────────────────┬─────┘
                      │                           │
              default behaviour            /api/* behaviour
                      ▼                           ▼
        ┌────────────────────────┐   ┌──────────────────────────┐
        │  S3 bucket             │   │  Lambda Function URL     │
        │  chromosome-designs-…  │   │  chromosome-contact      │
        │  (out/ from `next      │   │  (lambda/contact/)        │
        │   build` static export)│   │   uses SES + Turnstile   │
        └────────────────────────┘   └──────────────────────────┘
                                                │
                                                ▼
                                       ┌──────────────────┐
                                       │  Amazon SES v2   │
                                       │  → Avinish inbox │
                                       └──────────────────┘
```

## Prerequisites

- **AWS account** with billing alerts set (recommended threshold: $5/month).
- **AWS CLI v2** installed and `aws configure` run. The IAM user/role you
  configure needs permissions for: S3, CloudFront, Lambda, IAM, SES.
- **A domain.** This guide uses `chromosome-designs.com`. If you don't own
  it yet, register via Route 53 (~$12/year) or use any other registrar.
- **Cloudflare account** for Turnstile (free).

## One-time AWS setup

Do these steps in order. They're each clickable in the AWS Console; the
CLI commands shown are the equivalent for repeatability.

### 1. SES — verify your sender domain

In the SES console (region: **`ap-south-1`** Mumbai for the studio, or
`us-east-1` for highest sending quota — pick one and stick with it):

1. **Verified identities → Create identity → Domain → `chromosome-designs.com`**
2. SES gives you 3 CNAME records (DKIM). Add them to your DNS provider.
   Verification typically completes in minutes.
3. **Account dashboard → Request production access.** Fill the form
   honestly: legitimate use case (transactional contact form), expected
   volume (low, < 100/month). Approval is usually within 1 business day.
4. While waiting for production access, also verify your test recipients
   (e.g. `cavinish@gmail.com`) under **Verified identities** so the form
   works for in-house testing.

### 2. IAM — create the Lambda execution role

The Lambda needs permission to call SES and write CloudWatch logs.

```bash
# Trust policy (allows Lambda to assume the role)
cat > trust.json <<'EOF'
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": { "Service": "lambda.amazonaws.com" },
    "Action": "sts:AssumeRole"
  }]
}
EOF

aws iam create-role --role-name chromosome-contact-role \
  --assume-role-policy-document file://trust.json

# Attach the basic Lambda log-write permission
aws iam attach-role-policy --role-name chromosome-contact-role \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

# Inline policy: send email via your verified identity only
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REGION=ap-south-1   # change if you used a different region
DOMAIN=chromosome-designs.com

cat > ses-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": ["ses:SendEmail"],
    "Resource": [
      "arn:aws:ses:${REGION}:${ACCOUNT_ID}:identity/${DOMAIN}"
    ]
  }]
}
EOF

aws iam put-role-policy --role-name chromosome-contact-role \
  --policy-name SesSendEmail \
  --policy-document file://ses-policy.json
```

### 3. Lambda — create the function

First package the code locally:

```bash
cd lambda/contact
npm install
node package.mjs        # writes dist/contact.zip
cd ../..
```

Then create the function:

```bash
ROLE_ARN=$(aws iam get-role --role-name chromosome-contact-role \
  --query 'Role.Arn' --output text)

aws lambda create-function \
  --function-name chromosome-contact \
  --runtime nodejs20.x \
  --architectures arm64 \
  --handler index.handler \
  --role "$ROLE_ARN" \
  --zip-file fileb://lambda/contact/dist/contact.zip \
  --timeout 15 \
  --memory-size 256 \
  --region ap-south-1 \
  --environment "Variables={NODE_ENV=production,CONTACT_FROM_EMAIL=studio@chromosome-designs.com,CONTACT_TO_EMAIL=cavinish@gmail.com,TURNSTILE_SECRET_KEY=YOUR_SECRET,ALLOWED_ORIGIN=https://chromosome-designs.com}"
```

Notes:
- `arm64` (Graviton) is ~20% cheaper than x86_64 for the same workload.
- `256 MB` memory is generous for this handler; you can drop to 128 MB
  later if cold-starts are acceptable.
- Replace `YOUR_SECRET` with the real Turnstile secret. Set up Turnstile
  at https://dash.cloudflare.com → Turnstile → Add site.

### 4. Lambda — enable Function URL

The Function URL is a public HTTPS endpoint with no API Gateway in front
(simpler + cheaper).

```bash
aws lambda create-function-url-config \
  --function-name chromosome-contact \
  --auth-type NONE \
  --cors '{"AllowOrigins":["https://chromosome-designs.com"],"AllowMethods":["POST","OPTIONS"],"AllowHeaders":["content-type"],"MaxAge":86400}' \
  --region ap-south-1
```

The command prints a URL like `https://abc123.lambda-url.ap-south-1.on.aws/` —
**save this**, you'll need it for CloudFront.

You also need to grant public invoke permission:

```bash
aws lambda add-permission \
  --function-name chromosome-contact \
  --statement-id FunctionURLAllowPublicAccess \
  --action lambda:InvokeFunctionUrl \
  --principal "*" \
  --function-url-auth-type NONE \
  --region ap-south-1
```

### 5. S3 — create the static-hosting bucket

```bash
BUCKET=chromosome-designs-site

# Bucket name must be globally unique; suffix with random if taken.
aws s3api create-bucket \
  --bucket "$BUCKET" \
  --region us-east-1 \
  --create-bucket-configuration LocationConstraint=us-east-1
# Note: us-east-1 is recommended for the bucket because CloudFront
# distributes globally. Bucket region != Lambda region is fine.

# Block public access — CloudFront will read via Origin Access Control
aws s3api put-public-access-block --bucket "$BUCKET" \
  --public-access-block-configuration \
  "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
```

### 6. CloudFront — create the distribution

This is the only fiddly step. The Console UI is easier than the CLI here;
I recommend going through it once in the browser.

**Console: CloudFront → Create distribution**

**Origin 1 (S3):**
- Origin domain: pick the bucket from the dropdown (NOT the website endpoint)
- Origin access: **Origin access control (recommended)** → Create new OAC
- After creating the distribution, CloudFront will give you a bucket
  policy snippet. Copy it into the bucket's permissions.

**Origin 2 (Lambda Function URL):**
- Origin domain: paste the Function URL hostname **without** `https://`
  (e.g. `abc123.lambda-url.ap-south-1.on.aws`)
- Protocol: HTTPS only
- Custom origin → keep defaults

**Default cache behaviour (S3):**
- Viewer protocol policy: Redirect HTTP to HTTPS
- Allowed HTTP methods: GET, HEAD
- Cache policy: **CachingOptimized**
- Origin request policy: **CORS-S3Origin**
- Response headers policy: **SecurityHeadersPolicy** (or none)

**Add behaviour → path pattern `/api/*`:**
- Origin: the Lambda one
- Viewer protocol policy: HTTPS only
- Allowed HTTP methods: GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE
- Cache policy: **CachingDisabled** (form posts must not be cached)
- Origin request policy: **AllViewerExceptHostHeader**

**Settings:**
- Alternate domain name (CNAME): `chromosome-designs.com` (and `www.…`)
- SSL certificate: **Request certificate** in ACM, **us-east-1** region
  (CloudFront only supports certs from us-east-1). Validate via DNS.
- Default root object: `index.html`

After creating, note the **Distribution domain name**
(e.g. `d111111abcdef8.cloudfront.net`).

### 7. Route 53 — point the domain

If you used Route 53 for the domain:

```bash
HOSTED_ZONE_ID=$(aws route53 list-hosted-zones-by-name \
  --dns-name chromosome-designs.com --query 'HostedZones[0].Id' --output text)

cat > dns-change.json <<'EOF'
{
  "Changes": [{
    "Action": "UPSERT",
    "ResourceRecordSet": {
      "Name": "chromosome-designs.com",
      "Type": "A",
      "AliasTarget": {
        "HostedZoneId": "Z2FDTNDATAQYW2",
        "DNSName": "d111111abcdef8.cloudfront.net.",
        "EvaluateTargetHealth": false
      }
    }
  }]
}
EOF

# Z2FDTNDATAQYW2 is CloudFront's fixed hosted-zone-ID for ALIAS records globally.
# DNSName = your CloudFront distribution's domain name + trailing dot.

aws route53 change-resource-record-sets \
  --hosted-zone-id "$HOSTED_ZONE_ID" \
  --change-batch file://dns-change.json
```

Otherwise, at your DNS provider, create a CNAME from
`chromosome-designs.com` to the CloudFront domain name. Propagation: a
few minutes to an hour.

### 8. Configure deploy credentials locally

Create `.env.deploy` in the repo root (it's git-ignored):

```bash
S3_BUCKET=chromosome-designs-site
CLOUDFRONT_DISTRIBUTION_ID=E1ABCDEFGHIJKL    # from CloudFront console
LAMBDA_FUNCTION_NAME=chromosome-contact
AWS_REGION=ap-south-1
AWS_PROFILE=chromosome                        # optional, named profile
```

## Day-to-day deployment

### Static site

```bash
npm run deploy:static
```

This runs `next build` with the S3 target, syncs `out/` to your bucket
with appropriate cache headers (immutable for `/_next/static/*`, short
for everything else), and invalidates CloudFront so visitors see the new
content immediately.

### Lambda

```bash
npm run deploy:lambda
```

Re-zips the Lambda and pushes the new code. Env-var changes are not
covered by this — those are managed in the Lambda console (or rerun the
`update-function-configuration` CLI command).

### Both at once

```bash
npm run deploy
```

## Troubleshooting

**`AccessDenied` on first S3 sync**
The IAM user running `aws s3 sync` needs `s3:PutObject` and `s3:DeleteObject`
on the bucket. Quickest fix: attach `AmazonS3FullAccess` to your deploy
user (or write a tighter inline policy scoped to the bucket).

**CloudFront returns the old HTML after deploy**
You skipped the invalidation. Either run `deploy:static` again (it'll
invalidate) or manually:
```bash
aws cloudfront create-invalidation --distribution-id E1… --paths "/*"
```

**Form returns `captcha_failed` after deploy**
The Lambda env var `TURNSTILE_SECRET_KEY` is wrong or missing. Update via:
```bash
aws lambda update-function-configuration \
  --function-name chromosome-contact \
  --environment "Variables={...full set...}"
```
(All env vars must be re-supplied — this command replaces, not merges.)

**Form returns `send_failed` (502)**
- Check CloudWatch Logs for the Lambda — the SES error name will be there.
- Most common: SES is still in sandbox and the recipient isn't verified.
  Either request production access or verify the recipient address.
- Second most common: `CONTACT_FROM_EMAIL` is not a verified SES identity.

**`ses:SendEmail` denied**
The Lambda's IAM role isn't attached to the right SES identity ARN, or
you're sending from the wrong region. Re-check step 2.

**Local dev: form posts to nowhere**
Add to `.env.local`:
```
NEXT_PUBLIC_CONTACT_API_URL=http://localhost:8787
```
and run `cd lambda/contact && npm run dev` in another terminal.

## Estimated monthly cost

At ~10 K page views / month and the rate-limited contact form:

| Service | Charge | Notes |
| --- | --- | --- |
| S3 storage | $0.05 | A few hundred MB |
| S3 requests | < $0.01 | Cached by CloudFront |
| CloudFront egress | $0.10–$0.50 | First 1 TB at $0.085/GB |
| CloudFront requests | < $0.10 | $0.0075 / 10 K HTTPS |
| Lambda invocations | **$0** | 1M free / month |
| Lambda compute | **$0** | Bundled with free tier |
| SES outbound | < $0.01 | $0.10 / 1000 emails |
| Route 53 hosted zone | $0.50 | Fixed |
| ACM certificate | **$0** | Free |
| **Total** | **~$1–2** | |

Add ~$12/year if you also use Route 53 for the domain itself.

## Future scaling moves

- **Per-instance rate limiting is leaky** under load. When traffic grows,
  swap `lib/rate-limit.mjs` to use DynamoDB (atomic conditional updates)
  or Upstash Redis. Keep the same `rateLimit()` function signature so
  the handler doesn't change.
- **Cold starts** are ~200ms with the current zip. If they become an
  issue, enable Lambda **provisioned concurrency = 1** ($5/month for one
  warm instance).
- **Multiple environments** (staging, prod): duplicate the bucket /
  distribution / Lambda with a `-staging` suffix. Use a deploy-script
  flag or different `.env.deploy.staging` file.
