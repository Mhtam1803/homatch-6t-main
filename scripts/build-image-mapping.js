// Script to build image path mapping from v4 dataset image refs -> actual public/ files
// This generates a lookup table used by the data adapter
const fs = require('fs');
const path = require('path');

const v4 = JSON.parse(fs.readFileSync('homatch_dataset_v4/listings_v4.json', 'utf8'));
const publicBase = 'public/images';

const publicFiles = {};
fs.readdirSync(publicBase)
  .filter(d => d.startsWith('HCM_'))
  .forEach(id => {
    publicFiles[id] = fs.readdirSync(path.join(publicBase, id)).sort();
  });

const typeAliases = {
  'room': ['living_room', 'bed_room', 'room'],
  'bathroom': ['bathroom'],
  'exterior': ['exterior'],
  'kitchen': ['kitchen'],
  'balcony': ['balcony'],
  'living_room': ['living_room'],
  'bedroom': ['bed_room', 'bedroom'],
};

function resolveImageUrl(listingId, img, idx) {
  const pid = listingId;
  const pubFiles = publicFiles[pid] || [];
  const fname = img.url.split('/').pop();

  // 1. Exact match
  if (pubFiles.includes(fname)) return `images/${pid}/${fname}`;

  // 2. Type-based match
  const aliases = typeAliases[img.type] || [img.type];
  const matched = pubFiles.find(f => aliases.some(a => f.includes(a)));
  if (matched) return `images/${pid}/${matched}`;

  // 3. Positional fallback
  const positional = pubFiles[idx] || pubFiles[0];
  if (positional) return `images/${pid}/${positional}`;

  // 4. No image - use placeholder
  return 'images/placeholder.svg';
}

// Output the mapping as a JSON file for inspection
const mapping = {};
v4.forEach(listing => {
  mapping[listing.id] = listing.images.map((img, idx) => ({
    resolved: resolveImageUrl(listing.id, img, idx),
    type: img.type,
    caption: img.caption,
  }));
});

fs.writeFileSync('scripts/image-mapping.json', JSON.stringify(mapping, null, 2));
console.log('Image mapping written to scripts/image-mapping.json');

