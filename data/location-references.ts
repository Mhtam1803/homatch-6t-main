export interface LocationReference {
  id: string
  label: string
  coordinates: { lat: number; lng: number }
  aliases: string[]
  source: string
}

export const locationReferences: LocationReference[] = [
  {
    id: "uel",
    label: "University of Economics and Law (UEL)",
    coordinates: { lat: 10.8712, lng: 106.77846 },
    aliases: ["uel", "university of economics and law", "đại học kinh tế luật", "đh kinh tế luật"],
    source: "https://mapcarta.com/W1024454546",
  },
  {
    id: "vnuhcm",
    label: "Vietnam National University Ho Chi Minh City",
    coordinates: { lat: 10.868562, lng: 106.796312 },
    aliases: [
      "vnu",
      "vnuhcm",
      "vnu hcm",
      "vietnam national university",
      "đại học quốc gia tp.hcm",
      "đại học quốc gia thành phố hồ chí minh",
      "đhqg",
    ],
    source: "https://en.wikipedia.org/wiki/Vietnam_National_University,_Ho_Chi_Minh_City",
  },
]

function normalizeLocation(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/gi, "d")
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
}

export function resolveLocationReference(destination: string): LocationReference | null {
  const normalized = normalizeLocation(destination)
  if (!normalized) return null
  return locationReferences.find((reference) =>
    reference.aliases.some((alias) => normalized.includes(normalizeLocation(alias))),
  ) ?? null
}
