const fs = require('fs');
const path = require('path');

const content = fs.readFileSync('data/image-map.ts', 'utf8');
const srcRegex = /"src":\s*"([^"]+)"/g;
const paths = [];
let m;
while ((m = srcRegex.exec(content)) !== null) {
  paths.push(m[1]);
}

console.log('Total paths in image-map.ts:', paths.length);

let placeholderCount = 0;
let realCount = 0;
const placeholders = [];

paths.forEach(p => {
  const diskPath = path.join('public', p);
  if (!fs.existsSync(diskPath)) {
    console.error('MISSING FILE:', diskPath);
    return;
  }
  const stat = fs.statSync(diskPath);
  // Text placeholders in this repo are 960x640 JPEG and size is between 17KB and 22KB (17,000 - 23,000 bytes).
  // Real photos in HCM_001-020 are all > 38,000 bytes.
  if (stat.size < 35000) {
    placeholderCount++;
    placeholders.push({ path: p, size: stat.size });
  } else {
    realCount++;
  }
});

console.log(`Verified real photos (>38KB): ${realCount} / ${paths.length}`);
console.log(`Text placeholder graphics (<35KB): ${placeholderCount} / ${paths.length}`);

if (placeholderCount === 0) {
  console.log('✅ PASS: ZERO text-based placeholder images in image-map.ts!');
} else {
  console.error('❌ FAIL: Found placeholders:', placeholders);
  process.exit(1);
}

