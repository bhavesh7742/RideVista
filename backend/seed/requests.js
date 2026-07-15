const generateRequests = (touristUsers, driverList, vehicleList) => {
  const requests = [];
  const statuses = ['pending', 'accepted', 'completed', 'rejected'];
  const locations = [
    'City Palace Entrance, Jaipur',
    'Clock Tower Market, Jodhpur',
    'Lake Pichola Jetty, Udaipur',
    'Sam Sand Dunes, Jaisalmer',
    'Ajmer Sharif Dargah Gate, Ajmer',
    'Brahma Temple, Pushkar',
    'Junagarh Fort, Bikaner',
    'Chambal Garden, Kota',
    'Nakki Lake, Mount Abu',
    'Mahakaleshwar Temple, Ujjain'
  ];

  for (let i = 0; i < 30; i++) {
    // Pick a driver and a vehicle
    const driver = driverList[i % driverList.length];
    
    // Pick a vehicle that belongs to the same company AND supports withDriver = true
    const possibleVehicles = vehicleList.filter(
      (v) => (v.company.toString() === driver.company.toString()) && v.withDriver
    );
    const vehicle = possibleVehicles.length > 0 
      ? possibleVehicles[Math.floor(Math.random() * possibleVehicles.length)]
      : vehicleList[Math.floor(Math.random() * vehicleList.length)];

    requests.push({
      user: touristUsers[i % touristUsers.length]._id,
      driver: driver._id,
      company: driver.company,
      vehicle: vehicle._id,
      pickupLocation: locations[i % locations.length],
      message: 'Looking forward to the city tour!',
      status: statuses[i % statuses.length],
      createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000) // spread out over 30 days
    });
  }

  return requests;
};

module.exports = generateRequests;
