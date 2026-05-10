import { Marquee } from '@/components/ui/Marquee';

const ROW_A = [
  'GEER Foundation',
  'Gujarat Council of Science City',
  'Rajkot Zoological Park',
  'Indroda Nature Park',
  'Sakkarbaug Zoo',
  'Adani Port',
  'Gir National Park',
  'Maharashtra Forest Department',
  'Jharkhand Forest Department',
];

const ROW_B = [
  'Nainital Zoo',
  'Indian Army',
  'Ahmedabad Municipal Corporation',
  'Rajkot Municipal Corporation',
  'Dudhsagar Dairy',
  'Agriculture University Junagadh',
  'Forest Division Dang',
  'GEER Foundation',
  'Gujarat Forest Department',
  'Madhya Pradesh Forest Department',
];

export function ClientsMarquee() {
  return (
    <section className="py-12" aria-label="Clients and partners">
      <Marquee items={ROW_A} direction="left" duration={60} separator="plus" />
      <Marquee items={ROW_B} direction="right" duration={75} separator="plus" />
    </section>
  );
}
