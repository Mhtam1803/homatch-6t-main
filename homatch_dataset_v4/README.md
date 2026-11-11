# HOMATCH Synthetic Dataset v4 – Market-Anchored Draft

## Purpose and status

100 **fictional** HCMC rental listings, preserving IDs `HCM_001`–`HCM_100`, prepared for development and functional testing of HOMATCH. This is a reviewable draft, **not a set of available real rentals**. The 100 records inherit real-area anchors from the supplied v3 dataset; their precise coordinates, housing details, policies, availability, and prices remain synthetic.

The supplied `upload/listings.json`, `upload/schemas.py` and `upload/generate_listings.py` are left unchanged. GitHub and the deployed site are also unchanged.

## Files

- `listings_v4.json`: 100 data records with v3-compatible core fields and five new family-oriented flags.
- `market_references.json`: dated market examples, each with source URL and limited observed attributes.
- `schema_v4.py`: Pydantic schema extension for the new fields.
- `generate_market_anchored.py`: deterministic generator from supplied v3 records, seed 20261111.

## Target segments for test-case coverage

| Design segment | Count |
|---|---:|
| Student | 50 |
| Young professional | 20 |
| Couple/family | 20 |
| Premium renter | 10 |

`target_segment` is a **test-design quota**, not an exclusive eligibility class. `suitable_for` remains multi-label. A high-budget student can still be matched with a premium listing, for example.

## Data provenance and limitations

- Publicly visible examples from Nhà Tốt and Batdongsan.com.vn were consulted for indicative rental prices and typical attributes. The references are **not a statistically representative sample** and are not evidence that each synthetic record is realistically priced.
- `reference_ids` are area-level examples, not proof that a listing was copied or that all of its fields were verified. Blank reference lists identify areas needing more market research, notably central HCMC and Thảo Điền.
- All new family-related amenity flags are **synthetic assumptions**; they are not verified facts about buildings or nearby schools. Do not present `security_24h` or `child_friendly` as a safety certification.
- The visible `title` and `raw_description` are natural rental-style copy without the word *synthetic*. The app must instead show an **overall demo-data disclosure** in a persistent, obvious place so users are not misled into believing that these are real vacancies.
- Image paths in the source data are placeholders and are **not guaranteed to match** the images checked into the current GitHub frontend. A later integration needs a mapping and rights review.
- The all-in monthly cost is an estimate for **one person**, based on the existing cost model. Actual query results must recalculate water expense by occupant count. Deposits are one-off and not included in all-in monthly cost.
- This generator does not scrape sites, reproduce ad copy, retain contact information or import third-party listing images.

## Validation

From the same workspace root containing the uploaded v3 files, run:

```bash
python homatch_dataset_v4/generate_market_anchored.py
python homatch_dataset_v4/validate.py
```

Further work before deployment: source more matched examples in premium areas; have team members manually review 15–20 records across segments; update web data adapter and image paths; design family-specific cases without implying real-world safety or current rental availability.

