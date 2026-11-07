import listingData from "../listings.json"
import type { Listing } from "@/types/listing"

export const listings: Listing[] = listingData.map((item) => ({
  id: item.id,
  title: item.title,
  district: item.district,
  address: `${item.district}, ${item.city}`,
  bedrooms: item.attributes.bedrooms,
  bedroomLabel: /studio/i.test(item.title)
    ? "Studio"
    : `${item.attributes.bedrooms} Bedroom${item.attributes.bedrooms === 1 ? "" : "s"}`,
  areaM2: item.attributes.area_m2,
  images: item.images.map(({ url }) => {
    const filename = url.split("/").pop() ?? "home"
    const room = filename.replace(/^\d+_/, "").replace(/\.jpg$/i, "").replace(/_/g, " ")
    return {
      src: `/${url}`,
      alt: `${room} at ${item.title}`,
    }
  }),
  cost: {
    rent: item.base_price,
    managementFee: item.management_fee,
    parkingFee: item.parking_fee,
    utilities: item.estimated_utilities,
  },
  totalMonthly: item.total_all_in_cost,
  features: {
    petFriendly: item.attributes.pet_friendly,
    balcony: item.attributes.balcony,
    elevator: item.attributes.elevator,
    quiet: item.attributes.quiet_environment,
  },
  description: item.raw_description,
  coordinates: item.coordinates,
}))

export function getListings(): Listing[] {
  return listings
}

export function getListingById(id: string): Listing | undefined {
  return listings.find((listing) => listing.id === id)
}
