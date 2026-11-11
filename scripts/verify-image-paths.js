// Validate that every resolved path in image-map.ts exists in public/
const fs = require('fs');
const path = require('path');

const content = fs.readFileSync('data/image-map.ts', 'utf8');

// Extract all src values: "/images/HCM_XXX/filename.jpg"
const srcPattern = /"src":\s*"([^"]+)"/g;
const paths = [];
let match;
while ((match = srcPattern.exec(content)) !== null) {
  paths.push(match[1]);
}

console.log('Total image paths in map:', paths.length);

let missing = 0, found = 0;
const missingPaths = [];
paths.forEach(p => {
  // Convert /images/... -> public/images/...
  const fspath = 'public' + p;
  if (fs.existsSync(fspath)) {
    found++;
  } else {
    missing++;
    missingPaths.push(p);
  }
});

console.log('Found in public/:', found);
console.log('Missing from public/:', missing);
if (missingPaths.length > 0) {
  console.log('Missing paths (first 20):', missingPaths.slice(0, 20));
}
console.log(missing === 0 ? '\n✅ All image paths verified in public/' : '\n❌ Some image paths are missing!');

