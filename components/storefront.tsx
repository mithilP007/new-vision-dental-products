'use client'

import { Suspense } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Scissors,
  Scan,
  Layers,
  Radio,
  Smile,
  Cpu,
} from 'lucide-react'
import dynamic from 'next/dynamic'

const DentalUnitScene = dynamic(() => import('./dental-unit-scene'), {
  ssr: false,
  loading: () => (
    <div className="dental-canvas flex items-center justify-center bg-stone-950/40 rounded-2xl border border-stone-800/60" style={{ minHeight: '400px' }}>
      <div className="text-stone-400 text-sm tracking-wide">Loading 3D Experience...</div>
    </div>
  ),
})
import { BrandPartnersSection } from './brand-partners-section'
import { TrustStatisticsSection } from './trust-statistics-section'
import { SiteHeader } from './site-header'
import { SiteFooter } from './site-footer'

const categories = [
  {
    slug: 'surgical',
    number: '01',
    title: 'Surgical',
    desc: 'Handpieces, microsurgery & operative instruments.',
    tag: 'Operative Suite',
    image: '/categories/surgical.jpg',
    alt: 'Dental surgical instruments, stainless-steel forceps and operative tools',
    icon: Scissors,
  },
  {
    slug: 'diagnostics',
    number: '02',
    title: 'Diagnostics',
    desc: 'Intraoral scanning & digital imaging suites.',
    tag: 'Digital Scanning',
    image: '/categories/diagnostics.jpg',
    alt: 'Professional dental intraoral 3D scanner wand and diagnostic workstation',
    icon: Scan,
  },
  {
    slug: 'consumables',
    number: '03',
    title: 'Consumables',
    desc: 'Sterilization, disposables & daily essentials.',
    tag: 'Daily Essentials',
    image: '/categories/consumables.jpg',
    alt: 'Dental examination gloves, surgical masks and sterilized consumables',
    icon: Layers,
  },
  {
    slug: 'imaging',
    number: '04',
    title: 'Imaging',
    desc: 'Radiography & 3D volumetric capture.',
    tag: 'CBCT & Panoramic',
    image: '/categories/imaging.jpg',
    alt: 'Modern dental panoramic radiography and 3D volumetric CBCT imaging machine',
    icon: Radio,
  },
  {
    slug: 'orthodontics',
    number: '05',
    title: 'Orthodontics',
    desc: 'Alignment systems & lab-grade appliances.',
    tag: 'Clear Aligners',
    image: '/categories/orthodontics.jpg',
    alt: 'Clear orthodontic aligners and transparent precision retainers',
    icon: Smile,
  },
  {
    slug: 'cad-cam',
    number: '06',
    title: 'CAD / CAM',
    desc: 'Milling, printing & practice design studio.',
    tag: 'Milling & Studio',
    image: '/categories/cad-cam.jpg',
    alt: 'Dental CAD/CAM milling unit and practice design studio workstation',
    icon: Cpu,
  },
]

const reveal = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }

export function Storefront() {
  return (
    <main>
      {/* Site Header */}
      <SiteHeader isDarkHero={true} />

      {/* Hero Section */}
      <section className="hero" id="top">
        <div className="hero-glow" />
        <div className="hero-copy">
          <motion.p
            className="eyebrow"
            initial="hidden"
            animate="visible"
            variants={reveal}
            transition={{ duration: 0.7 }}
          >
            <span /> REDEFINING DENTAL EXCELLENCE
          </motion.p>
          <motion.h1
            initial="hidden"
            animate="visible"
            variants={reveal}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            The Future of B2B<br />
            <em>Dental Equipment.</em>
          </motion.h1>
          <motion.p
            className="hero-description"
            initial="hidden"
            animate="visible"
            variants={reveal}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Considered equipment. Trusted partnerships.<br className="desktop-break" /> Everything your
            practice needs to move forward.
          </motion.p>
          <motion.div
            className="hero-buttons"
            initial="hidden"
            animate="visible"
            variants={reveal}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <a className="button-light" href="#brands">
              Explore brands <ArrowRight size={16} />
            </a>
            <a className="button-outline" href="#categories">
              Discover our world <ArrowUpRight size={15} />
            </a>
          </motion.div>
        </div>

        <div
          className="hero-stage"
          id="canvas-container"
          aria-label="Spotlit premium dental treatment chair"
        >
          <Suspense fallback={null}>
            <DentalUnitScene />
          </Suspense>
          <div className="stage-caption">
            <span>01 / 03</span>
            <span>THE ASTRA COLLECTION</span>
          </div>
        </div>

        <a className="scroll-cue" href="#categories">
          <span className="scroll-line" />
          <span>SCROLL TO EXPLORE</span>
          <ArrowDown size={14} />
        </a>
        <span className="hero-index">NV / 2025</span>
      </section>

      {/* Category Catalogue */}
      <section className="categories section-pad" id="categories">
        <motion.div
          className="section-heading catalogue-heading"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={reveal}
          transition={{ duration: 0.6 }}
        >
          <div>
            <p className="eyebrow light-eyebrow">01 — THE CATALOGUE</p>
            <h2>
              Browse by <em>category</em>
            </h2>
          </div>
          <p className="catalogue-header-note">
            Six categories, one obsession: equipment that disappears into the hands of a great clinician.
          </p>
        </motion.div>

        <div className="catalogue-grid">
          {categories.map((category, index) => {
            const Icon = category.icon
            return (
              <motion.div
                key={category.number}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.15 }}
                variants={reveal}
                transition={{ duration: 0.5, delay: index * 0.06 }}
              >
                <Link
                  href={`/categories/${category.slug}`}
                  className="catalogue-card"
                  aria-label={`Browse ${category.title} equipment category`}
                >
                  <div className="catalogue-card-content">
                    <div className="catalogue-card-top">
                      <span className="catalogue-card-num">{category.number}</span>
                      <span className="catalogue-card-icon" aria-hidden="true">
                        <Icon size={16} strokeWidth={1.6} />
                      </span>
                    </div>
                    <div className="catalogue-card-body">
                      <span className="catalogue-card-tag">{category.tag}</span>
                      <h3 className="catalogue-card-title">{category.title}</h3>
                      <p className="catalogue-card-desc">{category.desc}</p>
                    </div>
                    <div className="catalogue-card-footer">
                      <span className="catalogue-card-action">
                        <span>Explore</span>
                        <ArrowUpRight size={13} className="catalogue-card-arrow" />
                      </span>
                    </div>
                  </div>
                  <div className="catalogue-card-visual">
                    <div className="catalogue-card-glow" />
                    <img
                      src={category.image}
                      alt={category.alt}
                      width={360}
                      height={360}
                      loading="lazy"
                      className="catalogue-card-img"
                    />
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* SECTION 1 & 2 — OUR BRAND PARTNERS & CONTINUOUS MARQUEE */}
      <BrandPartnersSection />

      {/* SECTION 3 & 4 — OUR TRUST & STATISTICS */}
      <TrustStatisticsSection />

      {/* Closing Banner */}
      <section className="closing-banner">
        <div>
          <p className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</p>
          <h2>
            Better dentistry<br />
            <em>begins with better choices.</em>
          </h2>
        </div>
        <a className="button-light" href="/contact">
          Talk to a specialist <ArrowRight size={16} />
        </a>
      </section>

      {/* Site Footer */}
      <SiteFooter />
    </main>
  )
}
