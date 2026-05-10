import type { Metadata } from 'next';
import { getAllProjects } from '@/lib/mdx';
import { SectionIndex } from '@/components/ui/SectionIndex';
import { WorkIndex } from '@/components/work/WorkIndex';

export const metadata: Metadata = {
  title: 'Work',
  description:
    'Selected interpretation centers, dioramas, sculptures, and exhibits delivered for zoos, sanctuaries, science cities, and public spaces across India.',
};

export default async function WorkIndexPage() {
  const projects = await getAllProjects();
  return (
    <>
      <SectionIndex count={4} total={7} />
      <section className="container-prose pt-[calc(var(--nav-height)+6rem)]">
        <header className="mb-16 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-brand-muted">
              ({String(projects.length).padStart(3, '0')}) projects
            </p>
            <h1 className="mt-6 max-w-3xl font-display text-display-xl font-black leading-[0.92] tracking-[-0.02em] text-brand-gold">
              Work.
            </h1>
          </div>
          <p className="max-w-md text-balance font-sub text-xl italic text-brand-muted">
            Two decades of interpretation centers, dioramas, sculptures, and exhibits — designed
            and fabricated end to end.
          </p>
        </header>

        <WorkIndex projects={projects} />
      </section>
    </>
  );
}
