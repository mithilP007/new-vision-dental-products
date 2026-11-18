'use client'

import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { BUSINESS_CONFIG } from '@/lib/business-config'

export default function InteractiveMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const [mapReady, setMapReady] = useState(false)

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return

    const { lat, lng, defaultZoom, minZoom, maxZoom } = BUSINESS_CONFIG.coordinates
    const { url, attribution } = BUSINESS_CONFIG.mapTileProvider

    // Initialize Leaflet Map
    const map = L.map(mapContainerRef.current, {
      center: [lat, lng],
      zoom: defaultZoom,
      minZoom,
      maxZoom,
      scrollWheelZoom: false, // Prevents scroll-wheel capture while scrolling page
      zoomControl: false, // Customized placement
      attributionControl: true,
    })

    // Custom Zoom control with clean positioning
    L.control.zoom({ position: 'bottomright' }).addTo(map)

    // Add compliant OpenStreetMap tile layer
    L.tileLayer(url, {
      attribution,
      maxZoom,
      crossOrigin: true,
    }).addTo(map)

    // Custom Gold New Vision Dental Location Marker Icon
    const goldMarkerIcon = L.divIcon({
      className: 'custom-gold-marker-container',
      html: `
        <div class="gold-marker-pulse"></div>
        <div class="gold-marker-pin" aria-label="${BUSINESS_CONFIG.name} Location Marker">
          <svg width="40" height="48" viewBox="0 0 40 48" fill="none" xmlns="http://www.w3.org/2000/svg" class="gold-marker-svg">
            <defs>
              <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#edd9b0" />
                <stop offset="45%" stop-color="#c49e63" />
                <stop offset="100%" stop-color="#897656" />
              </linearGradient>
              <filter id="markerShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="rgba(28,27,24,0.35)" />
              </filter>
            </defs>
            <path d="M20 0C8.954 0 0 8.954 0 20C0 32.5 17.5 46.2 19.1 47.4C19.65 47.8 20.35 47.8 20.9 47.4C22.5 46.2 40 32.5 40 20C40 8.954 31.046 0 20 0Z" fill="url(#goldGradient)" filter="url(#markerShadow)" />
            <circle cx="20" cy="19" r="13" fill="#1c1b18" />
            <circle cx="20" cy="19" r="11" fill="#2a2722" />
            <!-- Stylized Dental Precision Emblem -->
            <path d="M20 12.5C18.2 12.5 16.5 13.5 16 15.2C15.2 18 16.5 21.5 17.2 24.5C17.5 25.5 18.2 25.8 18.8 25.5C19.4 25.2 19.8 24.2 20 23.5C20.2 24.2 20.6 25.2 21.2 25.5C21.8 25.8 22.5 25.5 22.8 24.5C23.5 21.5 24.8 18 24 15.2C23.5 13.5 21.8 12.5 20 12.5Z" fill="#edd9b0" />
            <circle cx="20" cy="17" r="1.5" fill="#1c1b18" />
          </svg>
        </div>
      `,
      iconSize: [40, 48],
      iconAnchor: [20, 48],
      popupAnchor: [0, -46],
    })

    // Elegant Information Popup Content
    const popupContent = `
      <div class="nv-map-popup">
        <div class="nv-map-popup-eyebrow">OFFICIAL BUSINESS LOCATION</div>
        <h4 class="nv-map-popup-title">${BUSINESS_CONFIG.name.toUpperCase()}</h4>
        <div class="nv-map-popup-address">
          ${BUSINESS_CONFIG.address.popupLines.map((line) => `<span>${line}</span>`).join('')}
        </div>
        <a 
          href="${BUSINESS_CONFIG.directionsUrl}" 
          target="_blank" 
          rel="noopener noreferrer" 
          class="nv-map-popup-btn"
          id="marker-get-directions-btn"
        >
          <span>GET DIRECTIONS</span>
          <span class="nv-btn-arrow">→</span>
        </a>
      </div>
    `

    const marker = L.marker([lat, lng], {
      icon: goldMarkerIcon,
      title: `${BUSINESS_CONFIG.name} — Sai Sruthi Building, Ramar Koil Street`,
      riseOnHover: true,
    }).addTo(map)

    const popup = L.popup({
      closeButton: true,
      autoClose: false,
      closeOnClick: false,
      className: 'nv-leaflet-popup-custom',
      maxWidth: 320,
      offset: [0, -10],
    }).setContent(popupContent)

    marker.bindPopup(popup)

    // Open popup after map stabilizes
    const timer = setTimeout(() => {
      marker.openPopup()
      setMapReady(true)
    }, 400)

    // Enable scrollWheelZoom once user clicks or interacts with map
    map.on('click', () => {
      map.scrollWheelZoom.enable()
    })

    mapInstanceRef.current = map

    return () => {
      clearTimeout(timer)
      map.remove()
      mapInstanceRef.current = null
    }
  }, [])

  return (
    <div className="interactive-map-wrapper">
      <div
        ref={mapContainerRef}
        id="new-vision-live-map"
        className="interactive-map-canvas"
        aria-label={`Interactive map showing ${BUSINESS_CONFIG.name} at ${BUSINESS_CONFIG.address.singleLine}`}
      />
      {!mapReady && (
        <div className="map-loading-overlay">
          <div className="map-loading-spinner" />
          <span>Loading verified map coordinates...</span>
        </div>
      )}
    </div>
  )
}
