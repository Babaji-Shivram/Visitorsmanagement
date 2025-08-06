// Script to check localStorage content for the visitor management app
console.log('=== Current localStorage content ===');

// Check all localStorage keys
console.log('All localStorage keys:', Object.keys(localStorage));

// Check specific items
const locations = localStorage.getItem('locations');
const user = localStorage.getItem('user');
const visitors = localStorage.getItem('visitors');
const staff = localStorage.getItem('staff');

console.log('Locations:', locations ? JSON.parse(locations) : 'Not found');
console.log('User:', user ? JSON.parse(user) : 'Not found');
console.log('Visitors:', visitors ? JSON.parse(visitors) : 'Not found');
console.log('Staff:', staff ? JSON.parse(staff) : 'Not found');

// Check if Corporate office exists in locations
if (locations) {
  const parsedLocations = JSON.parse(locations);
  const corporateOffice = parsedLocations.find(loc => loc.name.toLowerCase().includes('corporate'));
  console.log('Corporate office found:', corporateOffice);
}
