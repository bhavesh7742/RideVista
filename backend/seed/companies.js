const companyTemplates = {
  'Royal Ride Rentals': { city: 'Jaipur', desc: 'Premium luxury fleet operator. Royal sedans, SUVs, and high-end coordination services.' },
  'City Wheels': { city: 'Jodhpur', desc: 'Affordable self-drive vehicle rental agency for daily commuting and local explorations.' },
  'Urban Ride Hub': { city: 'Udaipur', desc: 'Wide range of clean vehicles and motorbikes to travel seamlessly through the smart city streets.' },
  'TravelX Rentals': { city: 'Jaisalmer', desc: 'Trusted tourist transport partner with verified multi-lingual driver guides.' },
  'BlueWheel Tours': { city: 'Ajmer', desc: 'Specialized heritage tours and travel guide operators providing two-wheeler fleets.' },
  'Marwar Heritage Rentals': { city: 'Pushkar', desc: 'Leading travel fleet operator specialized in heritage tours around the city palace.' },
  'Rajasthan Royal Travels': { city: 'Bikaner', desc: 'Premium self-drive vehicle renting agency. High quality fleet checks & verified licenses.' },
  'Jodhpur Desert Wheels': { city: 'Kota', desc: 'Explore the local markets and desert dunes with our custom tuned cruisers and bikes.' },
  'Udaipur Lakeview Rentals': { city: 'Mount Abu', desc: 'Affordable cars and scooty rental service operating directly near popular lake sights.' },
  'Jaipur Pink City Fleet': { city: 'Ujjain', desc: 'Explore historic landmarks, Amber Fort, and bazaars with our expert pilot drivers.' }
};

const generateCompany = (name, index) => {
  const template = companyTemplates[name];
  if (!template) return null;
  const city = template.city;
  return {
    name: name,
    city: city,
    address: `10${index + 1}, Main Market Road, Near City Center, ${city}`,
    phone: `+91 987654321${index}`,
    googleMapsLink: `https://maps.google.com/?q=${name.replace(/\s+/g, '+')}+${city}`,
    gpsTrackingAvailable: index % 2 === 0,
    isVerified: true,
    description: template.desc,
    ownerName: `Owner ${index + 1}`,
    ownerPhone: `+91 987654321${index}`,
    managerName: `Manager ${index + 1}`,
    managerPhone: `+91 977654321${index}`,
    email: `owner${index + 1}@ridevista.com`,
    verificationDocs: ['https://res.cloudinary.com/of3mnmu3/image/upload/v1720516000/doc.pdf'],
    logo: 'https://res.cloudinary.com/of3mnmu3/image/upload/v1720516000/logo.png',
    rating: 5,
    numRatings: 3
  };
};

module.exports = {
  companyTemplates,
  generateCompany
};
