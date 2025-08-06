// Test script to manually create a Corporate Office location
console.log('🧪 Testing Location Creation...');

// Create a test location data
const testLocationData = {
  name: 'Corporate Office',
  address: '123 Business Ave, Corporate City, CC 12345',
  description: 'Main corporate headquarters',
  isActive: true
};

console.log('Test location data:', testLocationData);

// Simulate the location creation process
const urlSlug = testLocationData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const fullUrl = `${window.location.origin}/register/${urlSlug}`;
const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(fullUrl)}`;

const newLocation = {
  ...testLocationData,
  id: Date.now().toString(),
  registrationUrl: urlSlug,
  qrCodeUrl: qrCodeUrl,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

console.log('Generated location object:', newLocation);

// Check current localStorage content
const currentLocations = localStorage.getItem('locations');
console.log('Current locations in localStorage:', currentLocations);

// Try to add the location to localStorage
const existingLocations = currentLocations ? JSON.parse(currentLocations) : [];
const updatedLocations = [...existingLocations, newLocation];

localStorage.setItem('locations', JSON.stringify(updatedLocations));
console.log('✅ Location added to localStorage');

// Verify the save
const verifyLocations = localStorage.getItem('locations');
console.log('Verification - locations after save:', verifyLocations);

// Check if Corporate Office exists
if (verifyLocations) {
  const parsed = JSON.parse(verifyLocations);
  const corporateOffice = parsed.find(loc => loc.name.toLowerCase().includes('corporate'));
  console.log('✅ Corporate office found:', corporateOffice);
} else {
  console.log('❌ No locations found after save');
}
