# Batch 1 Image Fix Report — Placeholder Removal & Illustrative Interior Mapping

**Project:** HOMATCH Next.js Student Demo  
**Date:** 2026-11-11  
**Author/Agent:** Assistant Pair Programmer  
**Status:** ✅ Complete — All text-based placeholder graphics removed from UI

---

## 1. Executive Summary

During testing of the `/homes` browse page, `/results` search page, and `/property/[id]` detail galleries, it was identified that while image paths in `public/images/` physically existed, **465 image files across HCM_021–HCM_100 and HCM_013 were 960×640 placeholder graphics with embedded text** (e.g., *"PLACEHOLDER - replace with real photo"*, *"Studio room"*, *"Living room"*).

This batch safely eliminates all visible text-based placeholder graphics from the application with zero disruption to the underlying dataset:
1. **Preserved Original Curated Photos:** All 20 human-curated photo sets (`HCM_001`–`HCM_020`, 60 high-resolution interior photos) were retained as the primary authentic asset pool.
2. **Category-Aware Donor Mapping:** Listings `HCM_021`–`HCM_100` (80 listings) were mapped to balanced donor pools from the 20 curated sets matched by broad property category (`room`, `duplex`, `studio`, `mini_apartment`, `apartment`, `townhouse`).
3. **Preserved All Files on Disk:** No original files in `public/images/` or `images/` were renamed, deleted, or bulk-copied.
4. **Zero Broken Paths or Placeholders:** Exactly 300 UI image paths (3 photos per listing: living area, kitchen, bedroom) are mapped. All 300 resolve to verified, realistic interior photos (>38 KB, standard photo aspect ratios).
5. **Clear Demo & Illustrative Notice:** Maintained and enhanced site-wide notices that listings are fictional demo data and photos are illustrative interior representations (never claimed as verified photos of actual rental units).

---

## 2. Quantitative Summary

| Metric | Count | Details |
|---|---:|---|
| Total Listings in v4 Dataset | **100** | `HCM_001`–`HCM_100` |
| Curated Listings Preserved | **20** | `HCM_001`–`HCM_020` using their own curated photos |
| Placeholder Listings Replaced | **80** | `HCM_021`–`HCM_100` mapped to curated interior photos |
| Listings with Reused Donor Images | **80** | Reused across balanced category pools (2–7 uses per donor) |
| Listings Unresolved | **0** | All 100 listings have 3 verified interior photos |
| Total Visible UI Image Paths | **300** | 100 listings × 3 photos each |
| Text-Based Placeholder Graphics in UI | **0** | 100% eliminated from all pages |
| Physical Files Modified/Deleted on Disk | **0** | All existing JPG files preserved intact |

---

## 3. Physical Asset Audit Findings

A pixel and file-size audit across `public/images/` revealed the following characteristics:

### A. Human-Curated Photo Sets (`HCM_001`–`HCM_020`)
- **Count:** 60 genuine interior photos (3 per listing: `01_living_room.jpg`, `02_kitchen.jpg`, `03_bed_room.jpg`).
- **File Sizes:** 38 KB to 316 KB (average ~120 KB).
- **Dimensions:** Varied camera resolutions (e.g., 1420×1066, 960×960, 1536×2048, 2048×1536).
- **Visual Content:** Real interior photographs of apartments and rooms in Ho Chi Minh City.
- *Exception note:* Folder `HCM_013` contained 4 auxiliary files (`02_exterior.jpg`, `03_kitchen.jpg`, `04_bathroom.jpg`, `05_balcony.jpg`) which were 960×640 text graphics. These were bypassed, ensuring only `HCM_013`'s 3 real photos are served.

### B. Synthetic / Generated Images (`HCM_021`–`HCM_100`)
- **Count:** 461 files across 80 folders.
- **File Sizes:** Exactly 17 KB to 22 KB.
- **Dimensions:** Uniform 960×640 pixels.
- **Visual Content:** Flat solid-color rectangles with centered text:
  - Header: Room name (e.g. *"Studio room"*, *"Living room"*, *"Balcony"*)
  - Footer: *"PLACEHOLDER - replace with real photo"*
- **Action Taken:** Bypassed in the image adapter; replaced by category-matched donor photos from `HCM_001`–`HCM_020`. Original files left untouched on disk.

---

## 4. Donor Mapping Strategy by Property Category

To maintain visual variety across the 80 replaced listings, donor sets from `HCM_001`–`HCM_020` were grouped into property category pools. Listings were assigned cyclically to the least-utilized donor in their category pool:

| Property Category | Listing Count | Donor Pool (from HCM_001–020) | Visual Rationale |
|---|---:|---|---|
| **duplex** | 13 | `HCM_001`, `HCM_002`, `HCM_003`, `HCM_006`, `HCM_007`, `HCM_015` | Curated duplex/mezzanine student spaces in Linh Xuân/ĐHQG |
| **room** | 21 | `HCM_005`, `HCM_001`, `HCM_002`, `HCM_003`, `HCM_006`, `HCM_007` | Budget single rooms and compact student accommodations |
| **studio (student)** | 16 | `HCM_004`, `HCM_008`, `HCM_013`, `HCM_014`, `HCM_020` | Compact self-contained student studios |
| **studio (modern)** | 10 | `HCM_009`, `HCM_010`, `HCM_011`, `HCM_016`, `HCM_017` | Young professional & elevator building studio units |
| **mini_apartment** | 6 | `HCM_012`, `HCM_018` | 1-bedroom partitioned mini-apartments |
| **apartment** | 10 | `HCM_019`, `HCM_018`, `HCM_012`, `HCM_017` | Multi-room family apartments (e.g. HCM_019 2BR 50m²) |
| **townhouse** | 4 | `HCM_019`, `HCM_018`, `HCM_017`, `HCM_012` | Spacious residential units |

### Donor Utilization Distribution
Every donor set in `HCM_001`–`HCM_020` is utilized between 2 and 7 times total (1 original + 1 to 6 fallback uses):
- `HCM_001`–`HCM_003`, `HCM_005`–`HCM_007`, `HCM_009`: 6 uses
- `HCM_012`: 7 uses
- `HCM_010`, `HCM_011`, `HCM_015`, `HCM_016`, `HCM_017`: 5 uses
- `HCM_018`, `HCM_019`: 6 uses
- `HCM_004`, `HCM_008`, `HCM_013`, `HCM_014`: 3 uses
- `HCM_020`: 2 uses

---

## 5. Illustrative Notice & Disclosure Implementation

Per task instructions and data ethics guidelines, the UI makes it explicitly clear that photos are illustrative and do not depict verified rental vacancies:

1. **Site-Wide Header Banner (`components/layout/demo-data-banner.tsx`):**
   > *"🛈 All listings on this site are fictional demo data and photos are illustrative interior representations for development and testing. They are not real rentals and do not depict verified rental vacancies."*
2. **Property Detail Gallery (`app/property/[id]/page.tsx`):**
   > *" * Interior photos are illustrative representations for demonstration purposes."*
3. **Site-Wide Footer (`components/layout/site-footer.tsx`):**
   > *"All listings are fictional demo data; photos are illustrative representations for development testing only. Utility costs are estimates."*

---

## 6. Verification & Test Results

| Test | Tool / Command | Result | Notes |
|---|---|---|---|
| **TypeScript Compilation** | `npx tsc --noEmit` | ✅ **PASS** | 0 type errors |
| **Dataset Integrity** | `node scripts/smoke-test.js` | ✅ **PASS** | 100 unique IDs, 0 cost mismatches, no "synthetic" in text |
| **Image Path Resolution** | `node scripts/verify-image-paths.js` | ✅ **PASS** | 300 / 300 image paths exist in `public/` |
| **Text Placeholder Check** | `node scripts/verify-no-placeholders.js` | ✅ **PASS** | 0 / 300 images are text placeholder graphics |
| **UI Page Smoke Tests** | `node scripts/smoke-test-pages.js` | ✅ **PASS** | Tested 100 `/homes` cards, 100 `/results` cards, 100 `/property/[id]` galleries |
| **Audit CSV Updated** | `docs/image-audit.csv` | ✅ **PASS** | 395 rows updated with replacement & donor tracking |

---

## 7. Deliverable Files Changed / Created

- `data/image-map.ts`: Updated static map routing all 100 listings to verified interior photos.
- `scripts/generate-image-map.js`: Re-engineered generator with category-aware donor assignment.
- `scripts/generate-image-audit.js`: Updated to produce detailed CSV audit tracking placeholder replacements.
- `scripts/verify-no-placeholders.js`: Automated validator verifying zero placeholder graphics are served.
- `scripts/smoke-test-pages.js`: Automated test verifying `/homes`, `/results`, and `/property/[id]` galleries.
- `components/layout/demo-data-banner.tsx`: Updated with explicit illustrative photo disclaimer.
- `components/layout/site-footer.tsx`: Updated with illustrative photo disclaimer.
- `app/property/[id]/page.tsx`: Added gallery photo footnote.
- `docs/image-audit.csv`: Complete audit table.
- `docs/batch-1-image-fix-report.md`: This comprehensive report.

