const languages = [
  ['English', 'Hindi'],
  ['Hindi', 'Rajasthani'],
  ['Hindi', 'Gujarati'],
  ['English', 'Hindi', 'Punjabi'],
  ['Hindi']
];

const tourDescriptions = [
  'Expert in historic forts and local cultural sites. Over 5 years guiding foreign tourists.',
  'Born and raised locally, knows all the hidden street food spots and best scenic sunset points.',
  'Very calm and professional pilot. Specialized in outstation multi-day tours.',
  'Well-versed in traditional history. Fluent in multiple languages for customer comfort.',
  'Safe driver, guarantees a comfortable tour experience. Highly recommended for families.'
];

const generateDrivers = (userList, companyList) => {
  const drivers = [];
  // Distribute the driver users across whatever companies were seeded
  for (let i = 0; i < userList.length; i++) {
    const user = userList[i];
    const company = companyList[i % companyList.length];
    
    drivers.push({
      user: user._id,
      company: company._id,
      experience: Math.floor(Math.random() * 8) + 2, // 2-10 years
      licenseNumber: `DL-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      languages: languages[i % languages.length],
      tourDescription: tourDescriptions[i % tourDescriptions.length],
      status: i % 10 === 0 ? 'on-tour' : 'available',
    });
  }
  return drivers;
};

module.exports = generateDrivers;
