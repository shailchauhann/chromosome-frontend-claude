#!/usr/bin/env node
/**
 * One-shot bootstrap: writes one .mdx stub per project from the brochure
 * (§1 of the brief) and creates the matching empty image folder. Idempotent —
 * existing files are preserved unless --force is passed.
 *
 * Usage:  node scripts/seed-projects.mjs [--force]
 *
 * Source of truth lives in this file's PROJECTS array. After bootstrap,
 * authors edit MDX files directly and use `npm run new-project` for
 * additions. The brief flagship-five are marked featured.
 */

import process from 'node:process';
import { writeProject, slugify } from './_lib.mjs';

const FORCE = process.argv.includes('--force');

/** @type {Array<{title:string;client?:string;location:string;year?:number;category:'zoos'|'sanctuaries'|'science'|'sculpture'|'ongoing';status?:'completed'|'ongoing'|'dpr';featured?:boolean;slug?:string}>} */
const PROJECTS = [
  // A. Theme Parks & Zoo Interpretation
  {
    title: 'Zoo Interpretation Center',
    client: 'Rajkot Zoological Park',
    location: 'Rajkot, Gujarat',
    category: 'zoos',
  },
  {
    title: 'Reptile Section Exhibits',
    client: 'Rajkot Zoological Park',
    location: 'Rajkot, Gujarat',
    category: 'zoos',
  },
  {
    title: 'Nocturnal Zoo Interpretation Center',
    client: 'Nocturnal Zoo',
    location: 'Ahmedabad, Gujarat',
    category: 'zoos',
    featured: true,
    slug: 'nocturnal-zoo-ahmedabad',
  },
  {
    title: 'Butterfly Park',
    client: 'Ahmedabad Zoo',
    location: 'Kankaria Lake, Ahmedabad',
    category: 'zoos',
    slug: 'butterfly-park-kankaria',
  },
  {
    title: 'Panchtantra Vatika',
    client: 'Balvatika at Ahmedabad Zoo',
    location: 'Kankaria Lake, Ahmedabad',
    category: 'zoos',
  },
  {
    title: 'Zoo Masterplan & Interpretations',
    client: 'Sakkarbaug Zoological Park',
    location: 'Junagadh, Gujarat',
    category: 'zoos',
    slug: 'sakkarbaug-zoo-masterplan-junagadh',
  },
  {
    title: 'Zoo Interpretations and Publications',
    client: 'Nainital Zoo',
    location: 'Nainital, Uttarakhand',
    category: 'zoos',
  },
  {
    title: 'Entrance Gate and Exhibits',
    client: 'Dhauladhar Nature Park',
    location: 'Gopalpur, Himachal Pradesh',
    category: 'zoos',
    slug: 'dhauladhar-entrance-gopalpur',
  },
  {
    title: 'Exhibits and Interpretation Models',
    client: 'The Jambu Zoo',
    location: 'Jammu and Kashmir',
    category: 'zoos',
    slug: 'jambu-zoo-exhibits',
  },
  {
    title: 'Exhibits and Interpretation Models',
    client: 'Indroda Nature Park',
    location: 'Gandhinagar, Gujarat',
    category: 'zoos',
    slug: 'indroda-zoo-exhibits',
  },
  {
    title: 'Entrance Exhibits and Interpretation Models',
    client: 'Forest Department, Maharashtra',
    location: 'Nagpur, Maharashtra',
    category: 'zoos',
    slug: 'nagpur-entrance-exhibits',
  },
  {
    title: 'Interpretation and Wildlife Exhibits',
    client: 'Forest Department',
    location: 'Gir National Park West, Gujarat',
    category: 'zoos',
    slug: 'gir-west-wildlife-exhibits',
  },

  // B. National Parks & Sanctuaries Interpretation
  {
    title: 'Geological Interpretation Park',
    client: 'GEER Foundation',
    location: 'Indroda Nature Park, Gandhinagar',
    category: 'sanctuaries',
    slug: 'geological-interpretation-park-indroda',
  },
  {
    title: 'Dinosaur & Fossil Park',
    client: 'GEER Foundation',
    location: 'Indroda Nature Park, Gandhinagar',
    category: 'sanctuaries',
    featured: true,
    slug: 'dinosaur-fossil-park-indroda',
  },
  {
    title: 'Fossil Interpretations',
    client: 'GEER Foundation',
    location: 'Dinosaur & Fossil Park, Gandhinagar',
    category: 'sanctuaries',
    slug: 'fossil-interpretations-geer',
  },
  {
    title: 'Dinosaur & Fossil Park',
    location: 'Raiyoli, Balasinor, Gujarat',
    category: 'sanctuaries',
    slug: 'dinosaur-fossil-park-raiyoli',
  },
  {
    title: 'Dinosaur Fossil Park DPR Presentation',
    location: 'Wadadham Fossils Park, Sironcha, Maharashtra',
    category: 'sanctuaries',
    status: 'dpr',
    slug: 'wadadham-dpr-sironcha',
  },
  {
    title: 'Wildlife Interpretation Center',
    client: 'Ahmedabad Forest Division',
    location: 'Ahmedabad, Gujarat',
    category: 'sanctuaries',
    slug: 'wildlife-center-ahmedabad-forest',
  },
  {
    title: 'Interpretation Center',
    client: 'Baria Forest Division',
    location: 'Ratanmahal Bear Sanctuary, Gujarat',
    category: 'sanctuaries',
    slug: 'ratanmahal-bear-sanctuary',
  },
  {
    title: 'Exhibits and Interpretation Models',
    client: 'Rajkot Wildlife Division',
    location: 'Rampara Wildlife Sanctuary, Gujarat',
    category: 'sanctuaries',
    slug: 'rampara-wildlife-exhibits',
  },
  {
    title: 'Butterfly Park',
    client: 'Forest Department, Madhya Pradesh',
    location: 'Khandwa, Madhya Pradesh',
    category: 'sanctuaries',
    slug: 'butterfly-park-khandwa',
  },
  {
    title: 'Nature Trail & Exhibits',
    client: 'Forest Department, Madhya Pradesh',
    location: 'Khandwa, Madhya Pradesh',
    category: 'sanctuaries',
    slug: 'nature-trail-khandwa',
  },
  {
    title: 'Wildlife Models & Exhibits',
    client: 'Forest Division Dang',
    location: 'Waghai Botanical Garden, Gujarat',
    category: 'sanctuaries',
    slug: 'waghai-wildlife-models',
  },
  {
    title: 'Tribal Museum',
    client: 'Forest Division Dang',
    location: 'Waghai Botanical Garden, Gujarat',
    category: 'sanctuaries',
    slug: 'tribal-museum-waghai',
  },
  {
    title: 'Wildlife Interpretation Center & Entrance Gate',
    client: 'Jharkhand Forest Department',
    location: 'Dumka, Jharkhand',
    category: 'sanctuaries',
    slug: 'dumka-wildlife-center',
  },
  {
    title: 'Van Devi & Elephant Exhibits at Entrance Gate of Van Bhawan',
    client: 'Jharkhand Forest Department',
    location: 'Ranchi, Jharkhand',
    category: 'sanctuaries',
    slug: 'ranchi-van-bhawan-exhibits',
  },

  // C. Science Cities & Educational Institutes
  {
    title: 'High-tech Museum on Seeds',
    client: 'Agriculture University',
    location: 'Junagadh, Gujarat',
    category: 'science',
    slug: 'seeds-museum-junagadh',
  },
  {
    title: 'Hall of Science',
    client: 'Gujarat Council of Science City',
    location: 'Ahmedabad, Gujarat',
    category: 'science',
    featured: true,
    slug: 'hall-of-science-gujarat',
  },
  {
    title: 'Hon. PM and Nobel Laureate Hand Print Exhibits',
    client: 'Gujarat Council of Science City',
    location: 'Ahmedabad, Gujarat',
    category: 'science',
    slug: 'hand-print-exhibits-science-city',
  },
  {
    title: 'Dynamic Dinosaurs Models',
    client: 'Life Science Park, Gujarat Council of Science City',
    location: 'Ahmedabad, Gujarat',
    category: 'science',
    slug: 'dynamic-dinosaurs-life-science-park',
  },
  {
    title: 'Interactive Exhibits and Designing Works',
    client: 'Gujarat Council of Science City',
    location: 'Ahmedabad, Gujarat',
    category: 'science',
    slug: 'interactive-exhibits-science-city',
  },
  {
    title: 'Exhibits and Solar System Murals',
    location: 'Science Center Bhuj, Gujarat',
    category: 'science',
    slug: 'solar-system-murals-bhuj',
  },
  {
    title: 'Nature Interpretation Park',
    location: 'Thangadh, Surendranagar',
    category: 'science',
  },
  {
    title: 'Energy and Climate Change Park',
    client: 'GEER Foundation',
    location: 'Gandhinagar, Gujarat',
    category: 'science',
  },
  {
    title: 'Arogya Van',
    location: 'Idar, Himmatnagar, Gujarat',
    category: 'science',
  },

  // D. Sculpture at Public Attractions
  {
    title: 'Army Memorial Park',
    client: 'Indian Army',
    location: 'Indian Army Campus, Gandhinagar',
    category: 'sculpture',
    slug: 'army-memorial-park-gandhinagar',
  },
  {
    title: 'Sculpture on Mehsana Delhi Highway Circle',
    client: 'Dudhsagar Dairy',
    location: 'Mehsana, Gujarat',
    category: 'sculpture',
    slug: 'mehsana-highway-sculpture',
  },
  {
    title: 'Nalsarovar Birds Sanctuary',
    client: 'Forest Department',
    location: 'Nalsarovar, Gujarat',
    category: 'sculpture',
  },
  {
    title: 'Flamingo Circle at Rajkot City',
    client: 'Rajkot Municipal Corporation',
    location: 'Rajkot, Gujarat',
    category: 'sculpture',
    featured: true,
    slug: 'flamingo-circle-rajkot',
  },
  {
    title: 'Best Out of the Waste',
    client: 'Adani Port',
    location: 'Mundra, Gujarat',
    category: 'sculpture',
    slug: 'best-out-of-waste-mundra',
  },
  {
    title: 'FRP Sculpture',
    client: 'Adani Port',
    location: 'Mundra, Gujarat',
    category: 'sculpture',
    slug: 'frp-sculpture-mundra',
  },
  {
    title: 'Metal Dynamic Wind Sculpture',
    client: 'Ahmedabad Municipal Corporation',
    location: 'Ahmedabad, Gujarat',
    category: 'sculpture',
    slug: 'wind-sculpture-amc',
  },

  // E. Ongoing & DPR Projects
  {
    title: 'Dinosaur & Fossils Park',
    client: 'Maharashtra Forest Department',
    location: 'Wardham, Maharashtra',
    category: 'ongoing',
    status: 'ongoing',
    slug: 'dinosaur-fossils-wardham',
  },
  {
    title: 'Vishpur Eco-Park',
    client: 'Maharashtra Forest Department',
    location: 'Vishpur, Maharashtra',
    category: 'ongoing',
    status: 'ongoing',
  },
  {
    title: 'Dalma Wildlife Sanctuary',
    client: 'Jharkhand Forest Department',
    location: 'Dalma, Jharkhand',
    category: 'ongoing',
    status: 'ongoing',
  },
  {
    title: 'Sakkarbaug Zoological Park',
    client: 'Gujarat Forest Department',
    location: 'Junagadh, Gujarat',
    category: 'ongoing',
    status: 'ongoing',
    slug: 'sakkarbaug-ongoing',
  },
  {
    title: 'Wildlife Interpretation Center on Desert Ecosystem',
    client: 'Gujarat Forest Department',
    location: 'Nadabet, Gujarat',
    category: 'ongoing',
    status: 'ongoing',
    featured: true,
    slug: 'desert-ecosystem-nadabet',
  },
  {
    title: 'AR & VR Center on Desert Ecosystem',
    client: 'Gujarat Forest Department',
    location: 'Nadabet, Gujarat',
    category: 'ongoing',
    status: 'ongoing',
    slug: 'ar-vr-desert-nadabet',
  },
  {
    title: 'Entrance Gate and Various Theme Parks',
    client: 'Rajbhawan, Lucknow',
    location: 'Lucknow, Uttar Pradesh',
    category: 'ongoing',
    status: 'ongoing',
    slug: 'rajbhawan-lucknow-theme-parks',
  },
  {
    title: 'Wildlife Interpretation Center',
    client: 'Jharkhand Forest Department',
    location: 'Chaibasa, Jharkhand',
    category: 'ongoing',
    status: 'ongoing',
    slug: 'wildlife-center-chaibasa',
  },
];

async function main() {
  let written = 0;
  let skipped = 0;
  for (const p of PROJECTS) {
    const slug = p.slug ?? slugify(`${p.title}-${p.location}`);
    const result = await writeProject({ ...p, slug }, { force: FORCE });
    if (result.skipped) {
      skipped++;
      console.log(`  skip   ${slug}.mdx`);
    } else {
      written++;
      console.log(`  write  ${slug}.mdx`);
    }
  }
  console.log(`\nDone. ${written} written, ${skipped} skipped (already existed).`);
  console.log(
    `Total projects: ${PROJECTS.length}. Use --force to overwrite existing MDX files.`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
