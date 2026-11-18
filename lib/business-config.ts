/**
 * Central Business & Location Configuration for New Vision Dental Products
 * 
 * All location data, coordinates, Google Maps Place IDs, and directions URLs
 * MUST be imported from this file to ensure 100% consistency across the application.
 */

export interface BusinessConfig {
  name: string
  legalName: string
  address: {
    building: string
    street: string
    area: string
    city: string
    state: string
    pincode: string
    country: string
    lines: string[]
    singleLine: string
    popupLines: string[]
  }
  placeId: string
  coordinates: {
    lat: number
    lng: number
    defaultZoom: number
    minZoom: number
    maxZoom: number
  }
  directionsUrl: string
  mapTileProvider: {
    name: string
    url: string
    attribution: string
    maxZoom: number
  }
  contact: {
    email: string
    secondaryEmail: string
    emails: string[]
    ordersEmail: string
    supportEmail: string
    phoneDisplay: string
    phoneHref: string
    phoneNumbers: {
      label: string
      display: string
      href: string
    }[]
    landlineDisplay: string
    landlineHref: string
    businessHours: string
  }
}

export const BUSINESS_CONFIG: BusinessConfig = {
  name: 'New Vision Dental Products',
  legalName: 'New Vision Dental Products',
  address: {
    building: 'Sai Sruthi Building',
    street: 'Ramar Koil Street',
    area: 'Ram Nagar',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    pincode: '641009',
    country: 'India',
    lines: [
      'Sai Sruthi Building,',
      'Ramar Koil Street,',
      'Ram Nagar,',
      'Coimbatore,',
      'Tamil Nadu 641009,',
      'India.',
    ],
    singleLine:
      'Sai Sruthi Building, Ramar Koil Street, Ram Nagar, Coimbatore, Tamil Nadu 641009, India',
    popupLines: [
      'Sai Sruthi Building,',
      'Ramar Koil Street,',
      'Ram Nagar,',
      'Coimbatore,',
      'Tamil Nadu 641009.',
    ],
  },
  // Google Maps Place ID for New Vision Dental Products
  placeId: 'ChIJRStD4n9ZqDsR0KcKXT23XhM',

  // Mathematically verified coordinates resolved from Place ID ChIJRStD4n9ZqDsR0KcKXT23XhM
  coordinates: {
    lat: 11.0132605,
    lng: 76.9654087,
    defaultZoom: 17,
    minZoom: 12,
    maxZoom: 19,
  },

  // Official Google Maps Directions Destination URL with Place ID
  directionsUrl:
    'https://www.google.com/maps/dir/?api=1&destination=New%20Vision%20Dental%20Products%2C%20Sai%20Sruthi%20Building%2C%20Ramar%20Koil%20Street%2C%20Ram%20Nagar%2C%20Coimbatore%2C%20Tamil%20Nadu%20641009&destination_place_id=ChIJRStD4n9ZqDsR0KcKXT23XhM',

  // Configurable Map Tile Provider (OpenStreetMap by default, fully compliant)
  mapTileProvider: {
    name: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
    maxZoom: 19,
  },

  contact: {
    email: 'newvisiondent@gmail.com',
    secondaryEmail: 'newvisiondeals15@gmail.com',
    emails: ['newvisiondent@gmail.com', 'newvisiondeals15@gmail.com'],
    ordersEmail: 'newvisiondent@gmail.com',
    supportEmail: 'newvisiondent@gmail.com',
    phoneDisplay: '+91 96777 77694',
    phoneHref: 'tel:+919677777694',
    phoneNumbers: [
      { label: 'Mobile', display: '+91 96777 77694', href: 'tel:+919677777694' },
      { label: 'Mobile', display: '+91 97901 12261', href: 'tel:+919790112261' },
      { label: 'Landline', display: '0422-4212274', href: 'tel:04224212274' },
    ],
    landlineDisplay: '0422-4212274',
    landlineHref: 'tel:04224212274',
    businessHours: 'Monday – Saturday: 9:30 AM – 7:30 PM IST',
  },
}
