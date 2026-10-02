export type TourScope = "domestic" | "international"

export interface TourDeal {
  title: string
  originalPriceVnd: number
  priceVnd: number
  departureDate: string
}

export interface Tour {
  code: string
  name: string
  highlight: string
  region: string
  scope: TourScope
  departureCity: string
  departureDates: string[]
  days: number
  nights: number
  priceVnd: number
  tourLine: string
  transport: string
  rating: number | null
  imageUrl: string
  url: string
  deal?: TourDeal
}

export interface TourCatalog {
  scrapedAt: string
  tours: Tour[]
}
