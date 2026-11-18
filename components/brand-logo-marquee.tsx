'use client'

import Image from 'next/image'

export interface BrandPartner {
  id: string
  name: string
  src: string
  alt: string
  width: number
  height: number
  maxWidthDesktop: number
  maxHeightDesktop: number
}

// Exactly the 7 supplied brand partner logos preserving original identities
export const BRAND_PARTNERS: BrandPartner[] = [
  {
    id: 'dhakshaj',
    name: 'Dhakshaj',
    src: '/brands/dhakshaj.png',
    alt: 'Dhakshaj Dental Equipments Solution Logo',
    width: 332,
    height: 95,
    maxWidthDesktop: 220,
    maxHeightDesktop: 58,
  },
  {
    id: 'garmy',
    name: 'Garmy',
    src: '/brands/garmy.png',
    alt: 'Garmy Global Care Dental Perfection Logo',
    width: 188,
    height: 85,
    maxWidthDesktop: 160,
    maxHeightDesktop: 54,
  },
  {
    id: 'eighteeth',
    name: 'Eighteeth',
    src: '/brands/eighteeth.png',
    alt: 'Eighteeth Dental Innovation Logo',
    width: 238,
    height: 76,
    maxWidthDesktop: 190,
    maxHeightDesktop: 52,
  },
  {
    id: 'orikam',
    name: 'Orikam',
    src: '/brands/orikam.png',
    alt: 'Orikam Healthcare Logo',
    width: 134,
    height: 44,
    maxWidthDesktop: 140,
    maxHeightDesktop: 42,
  },
  {
    id: 'zhermack',
    name: 'Zhermack Dental',
    src: '/brands/zhermack.png',
    alt: 'Zhermack Dental Impression & Materials Logo',
    width: 259,
    height: 67,
    maxWidthDesktop: 200,
    maxHeightDesktop: 52,
  },
  {
    id: 'woodpecker',
    name: 'Woodpecker',
    src: '/brands/woodpecker.png',
    alt: 'Woodpecker Dental Medical Equipment Logo',
    width: 194,
    height: 85,
    maxWidthDesktop: 175,
    maxHeightDesktop: 58,
  },
  {
    id: 'gdc',
    name: 'GDC',
    src: '/brands/gdc.png',
    alt: 'GDC The Global Dental Precision Instruments Logo',
    width: 212,
    height: 87,
    maxWidthDesktop: 175,
    maxHeightDesktop: 58,
  },
]

export function BrandLogoMarquee() {
  // Seamless loop with 2 identical sequences in a single horizontal track
  const loopList = [...BRAND_PARTNERS, ...BRAND_PARTNERS]

  return (
    <div className="brand-marquee-showcase" aria-label="Brand Partners Marquee">
      {/* Exactly ONE continuous horizontal row moving from Right to Left */}
      <div
        className="marquee-row-wrapper"
        tabIndex={0}
        aria-label="Brand Partners Marquee Track"
      >
        <div className="marquee-track marquee-track-rtl">
          {loopList.map((brand, idx) => (
            <div
              key={`${brand.id}-${idx}`}
              className="brand-logo-slide"
              title={brand.name}
            >
              <div className="brand-logo-inner">
                <Image
                  src={brand.src}
                  alt={brand.alt}
                  width={brand.width}
                  height={brand.height}
                  priority={idx < 7}
                  className="brand-partner-logo-img"
                  style={{
                    height: 'auto',
                    maxHeight: `${brand.maxHeightDesktop}px`,
                    width: 'auto',
                    maxWidth: `${brand.maxWidthDesktop}px`,
                    objectFit: 'contain',
                    objectPosition: 'center',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
