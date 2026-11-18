import { CategoryInfo, CategorySlug } from '@/lib/types/ecommerce'

export const CATEGORIES: Record<CategorySlug, CategoryInfo> = {
  surgical: {
    slug: 'surgical',
    number: '01',
    title: 'Surgical',
    tag: 'Operative Suite',
    desc: 'Handpieces, microsurgery & operative instruments.',
    heroHeading: 'Surgical Equipment',
    heroDescription:
      'Precision instruments and essential operative equipment designed for modern oral surgery, implantology, and delicate microsurgical procedures.',
    image: '/categories/surgical.jpg',
    alt: 'Dental surgical instruments, stainless-steel forceps and operative tools',
    subcategories: [
      'Oral Surgery',
      'Implantology',
      'Surgical Handpieces',
      'Extraction Forceps',
      'Microsurgery',
      'Electrosurgery',
      'Periotomes & Elevators',
    ],
  },
  diagnostics: {
    slug: 'diagnostics',
    number: '02',
    title: 'Diagnostics',
    tag: 'Digital Scanning',
    desc: 'Intraoral scanning & digital imaging suites.',
    heroHeading: 'Diagnostic Systems',
    heroDescription:
      'High-speed intraoral 3D scanners, digital caries detection systems, and chairside diagnostic workstations providing crystal-clear clinical visibility.',
    image: '/categories/diagnostics.jpg',
    alt: 'Professional dental intraoral 3D scanner wand and diagnostic workstation',
    subcategories: [
      'Intraoral Scanners',
      'Caries Detection',
      'Intraoral Cameras',
      'Pulp Vitality Testers',
      'Diagnostic Workstations',
      'Patient Education Models',
    ],
  },
  consumables: {
    slug: 'consumables',
    number: '03',
    title: 'Consumables',
    tag: 'Daily Essentials',
    desc: 'Sterilization, disposables & daily essentials.',
    heroHeading: 'Clinical Consumables',
    heroDescription:
      'Autoclave pouches, barrier films, medical-grade nitrile gloves, impression silicones, and high-turnover operatory essentials keeping your clinic fully stocked.',
    image: '/categories/consumables.jpg',
    alt: 'Dental examination gloves, surgical masks and sterilized consumables',
    subcategories: [
      'Sterilization & Autoclave',
      'Disposables & PPE',
      'Restorative Materials',
      'Endodontics',
      'Impression Materials',
      'Pharmacy & Topical',
      'Burs & Abrasives',
    ],
  },
  imaging: {
    slug: 'imaging',
    number: '04',
    title: 'Imaging',
    tag: 'CBCT & Panoramic',
    desc: 'Radiography & 3D volumetric capture.',
    heroHeading: 'Radiology & 3D Imaging',
    heroDescription:
      'Sub-millimetre CBCT volumetric capture, panoramic digital orthopantomograms, and low-dose intraoral radiograph sensors engineered for diagnostic confidence.',
    image: '/categories/imaging.jpg',
    alt: 'Modern dental panoramic radiography and 3D volumetric CBCT imaging machine',
    subcategories: [
      'CBCT 3D Systems',
      'Panoramic 2D Imaging',
      'Intraoral X-Ray Units',
      'Digital RVG Sensors',
      'Phosphor Plate Scanners',
      'Cephalometric Arms',
    ],
  },
  orthodontics: {
    slug: 'orthodontics',
    number: '05',
    title: 'Orthodontics',
    tag: 'Clear Aligners',
    desc: 'Alignment systems & lab-grade appliances.',
    heroHeading: 'Orthodontic Systems',
    heroDescription:
      'Precision clear aligner materials, aesthetic ceramic brackets, heat-activated nickel-titanium archwires, and ergonomic pliers for controlled biomechanics.',
    image: '/categories/orthodontics.jpg',
    alt: 'Clear orthodontic aligners and transparent precision retainers',
    subcategories: [
      'Clear Aligners',
      'Brackets & Buccal Tubes',
      'Archwires & Springs',
      'Orthodontic Pliers',
      'Elastics & Chains',
      'Bonding Adhesives',
    ],
  },
  'cad-cam': {
    slug: 'cad-cam',
    number: '06',
    title: 'CAD / CAM',
    tag: 'Milling & Studio',
    desc: 'Milling, printing & practice design studio.',
    heroHeading: 'CAD / CAM & Digital Lab',
    heroDescription:
      'Dry & wet chairside milling units, high-resolution dental 3D printers, rapid sintering furnaces, and restorative design suites for same-day dentistry.',
    image: '/categories/cad-cam.jpg',
    alt: 'Dental CAD/CAM milling and 3D design workstation',
    subcategories: [
      'Chairside Milling Units',
      'Dental 3D Printers',
      'Sintering Furnaces',
      'Zirconia & PMMA Discs',
      '3D Printing Resins',
      'CAD Design Workstations',
    ],
  },
}

export const CATEGORIES_LIST: CategoryInfo[] = [
  CATEGORIES['surgical'],
  CATEGORIES['diagnostics'],
  CATEGORIES['consumables'],
  CATEGORIES['imaging'],
  CATEGORIES['orthodontics'],
  CATEGORIES['cad-cam'],
]

export function getCategoryBySlug(slug: string): CategoryInfo | null {
  const normalized = slug.toLowerCase() as CategorySlug
  return CATEGORIES[normalized] || null
}
