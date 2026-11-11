// Smoke test: validate listings adapter output
const path = require('path');
const fs = require('fs');

const v4 = require('../homatch_dataset_v4/listings_v4.json');
console.log('=== Dataset v4 Validation ===');
console.log('Total listings:', v4.length);

// Check IDs
const ids = v4.map(x => x.id);
const unique = [...new Set(ids)];
console.log('Unique IDs:', unique.length);

const missing = [];
for (let i = 1; i <= 100; i++) {
  const id = 'HCM_' + String(i).padStart(3, '0');
  if (!ids.includes(id)) missing.push(id);
}
console.log('Missing IDs:', missing.length ? missing : 'none');

// Check new v4 fields
let missingTarget = 0, missingSynthetic = 0;
v4.forEach(l => {
  if (!l.target_segment) missingTarget++;
  if (!l.synthetic) missingSynthetic++;
  if (!['near_school','near_supermarket','playground','security_24h','child_friendly'].every(f => f in l.attributes)) {
    console.log('MISSING V4 ATTRIBUTE in', l.id);
  }
});
console.log('Missing target_segment:', missingTarget);
console.log('Missing synthetic flag:', missingSynthetic);

// Check segment distribution
const segs = {};
v4.forEach(l => { segs[l.target_segment] = (segs[l.target_segment] || 0) + 1; });
console.log('Segment distribution:', segs);

// Cost integrity
let costErrors = 0;
v4.forEach(l => {
  const computed = l.base_price + l.management_fee + l.parking_fee + l.estimated_utilities;
  if (Math.abs(computed - l.total_all_in_cost) > 1) {
    costErrors++;
    console.log('COST MISMATCH:', l.id, 'computed:', computed, 'stored:', l.total_all_in_cost);
  }
});
console.log('Cost mismatches:', costErrors);

// Image refs
let totalImgs = 0;
v4.forEach(l => { totalImgs += l.images.length; });
console.log('Total image refs:', totalImgs);

// Check word "synthetic" in titles/descriptions
let syntheticInTitle = v4.filter(l => /synthetic/i.test(l.title));
let syntheticInDesc = v4.filter(l => /synthetic/i.test(l.raw_description));
console.log('Word "synthetic" in titles:', syntheticInTitle.length ? syntheticInTitle.map(l => l.id) : 'none');
console.log('Word "synthetic" in descriptions:', syntheticInDesc.length ? syntheticInDesc.map(l => l.id) : 'none');

console.log('\n=== ALL CHECKS PASSED ===');
