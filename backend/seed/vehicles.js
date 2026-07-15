const vehiclesToSeed = [
  // Royal Ride Rentals
  {
    type: "car",
    brand: "Maruti Suzuki",
    modelName: "Swift",
    seatingCapacity: 5,
    pricingPerDay: 1800,
    securityDeposit: 5000,
    withDriver: false,
    companyName: "Royal Ride Rentals",
    totalQuantity: 3,
    availableQuantity: 3,
  },
  {
    type: "car",
    brand: "Hyundai",
    modelName: "Creta",
    seatingCapacity: 5,
    pricingPerDay: 2600,
    securityDeposit: 8000,
    withDriver: false,
    companyName: "Royal Ride Rentals",
    totalQuantity: 2,
    availableQuantity: 2,
  },
  {
    type: "car",
    brand: "Mahindra",
    modelName: "Scorpio N",
    seatingCapacity: 7,
    pricingPerDay: 4000,
    securityDeposit: 2000,
    withDriver: true,
    companyName: "Royal Ride Rentals",
    totalQuantity: 2,
    availableQuantity: 1,
  },
  {
    type: "car",
    brand: "Tata",
    modelName: "Nexon EV",
    seatingCapacity: 5,
    pricingPerDay: 3500,
    securityDeposit: 1500,
    withDriver: true,
    companyName: "Royal Ride Rentals",
    totalQuantity: 2,
    availableQuantity: 2,
  },

  // City Wheels
  {
    type: "scooty",
    brand: "Honda",
    modelName: "Activa 6G",
    seatingCapacity: 2,
    pricingPerDay: 400,
    securityDeposit: 1000,
    withDriver: false,
    companyName: "City Wheels",
    totalQuantity: 8,
    availableQuantity: 8,
  },
  {
    type: "bike",
    brand: "Hero",
    modelName: "Splendor Plus",
    seatingCapacity: 2,
    pricingPerDay: 350,
    securityDeposit: 1000,
    withDriver: false,
    companyName: "City Wheels",
    totalQuantity: 6,
    availableQuantity: 5,
  },
  {
    type: "bike",
    brand: "Bajaj",
    modelName: "Pulsar 150",
    seatingCapacity: 2,
    pricingPerDay: 600,
    securityDeposit: 2000,
    withDriver: false,
    companyName: "City Wheels",
    totalQuantity: 4,
    availableQuantity: 4,
  },

  // Urban Ride Hub
  {
    type: "scooty",
    brand: "Honda",
    modelName: "Activa 6G",
    seatingCapacity: 2,
    pricingPerDay: 400,
    securityDeposit: 1000,
    withDriver: false,
    companyName: "Urban Ride Hub",
    totalQuantity: 5,
    availableQuantity: 5,
  },
  {
    type: "scooty",
    brand: "Suzuki",
    modelName: "Access 125",
    seatingCapacity: 2,
    pricingPerDay: 450,
    securityDeposit: 1200,
    withDriver: false,
    companyName: "Urban Ride Hub",
    totalQuantity: 4,
    availableQuantity: 4,
  },
  {
    type: "car",
    brand: "Maruti Suzuki",
    modelName: "Swift",
    seatingCapacity: 5,
    pricingPerDay: 1800,
    securityDeposit: 5000,
    withDriver: false,
    companyName: "Urban Ride Hub",
    totalQuantity: 2,
    availableQuantity: 2,
  },

  // TravelX Rentals
  {
    type: "bike",
    brand: "Royal Enfield",
    modelName: "Classic 350",
    seatingCapacity: 2,
    pricingPerDay: 1000,
    securityDeposit: 3000,
    withDriver: false,
    companyName: "TravelX Rentals",
    totalQuantity: 4,
    availableQuantity: 4,
  },
  {
    type: "bike",
    brand: "KTM",
    modelName: "Duke 200",
    seatingCapacity: 2,
    pricingPerDay: 1300,
    securityDeposit: 5000,
    withDriver: false,
    companyName: "TravelX Rentals",
    totalQuantity: 3,
    availableQuantity: 3,
  },
  {
    type: "car",
    brand: "Mahindra",
    modelName: "Scorpio N",
    seatingCapacity: 7,
    pricingPerDay: 4000,
    securityDeposit: 2000,
    withDriver: true,
    companyName: "TravelX Rentals",
    totalQuantity: 2,
    availableQuantity: 2,
  },

  // BlueWheel Tours
  {
    type: "scooty",
    brand: "Honda",
    modelName: "Activa 6G",
    seatingCapacity: 2,
    pricingPerDay: 400,
    securityDeposit: 1000,
    withDriver: false,
    companyName: "BlueWheel Tours",
    totalQuantity: 10,
    availableQuantity: 10,
  },
  {
    type: "scooty",
    brand: "TVS",
    modelName: "Ntorq 125",
    seatingCapacity: 2,
    pricingPerDay: 500,
    securityDeposit: 1500,
    withDriver: false,
    companyName: "BlueWheel Tours",
    totalQuantity: 6,
    availableQuantity: 6,
  },
  {
    type: "auto",
    brand: "Bajaj",
    modelName: "RE Auto Rickshaw",
    seatingCapacity: 4,
    pricingPerDay: 1000,
    securityDeposit: 500,
    withDriver: true,
    companyName: "BlueWheel Tours",
    totalQuantity: 4,
    availableQuantity: 3,
  },

  // Marwar Heritage Rentals
  {
    type: "bike",
    brand: "Royal Enfield",
    modelName: "Classic 350",
    seatingCapacity: 2,
    pricingPerDay: 1600,
    securityDeposit: 2000,
    withDriver: true,
    companyName: "Marwar Heritage Rentals",
    totalQuantity: 5,
    availableQuantity: 5,
  },
  {
    type: "bike",
    brand: "Hero",
    modelName: "Splendor Plus",
    seatingCapacity: 2,
    pricingPerDay: 350,
    securityDeposit: 1000,
    withDriver: false,
    companyName: "Marwar Heritage Rentals",
    totalQuantity: 6,
    availableQuantity: 6,
  },
  {
    type: "car",
    brand: "Tata",
    modelName: "Nexon",
    seatingCapacity: 5,
    pricingPerDay: 2400,
    securityDeposit: 7000,
    withDriver: false,
    companyName: "Marwar Heritage Rentals",
    totalQuantity: 2,
    availableQuantity: 2,
  },

  // Rajasthan Royal Travels
  {
    type: "car",
    brand: "Hyundai",
    modelName: "Creta",
    seatingCapacity: 5,
    pricingPerDay: 2600,
    securityDeposit: 8000,
    withDriver: false,
    companyName: "Rajasthan Royal Travels",
    totalQuantity: 3,
    availableQuantity: 3,
  },
  {
    type: "car",
    brand: "Tata",
    modelName: "Nexon",
    seatingCapacity: 5,
    pricingPerDay: 2400,
    securityDeposit: 7000,
    withDriver: false,
    companyName: "Rajasthan Royal Travels",
    totalQuantity: 2,
    availableQuantity: 2,
  },
  {
    type: "car",
    brand: "Mahindra",
    modelName: "Scorpio N",
    seatingCapacity: 7,
    pricingPerDay: 4000,
    securityDeposit: 2000,
    withDriver: true,
    companyName: "Rajasthan Royal Travels",
    totalQuantity: 2,
    availableQuantity: 1,
  },

  // Jodhpur Desert Wheels
  {
    type: "bike",
    brand: "Royal Enfield",
    modelName: "Classic 350",
    seatingCapacity: 2,
    pricingPerDay: 1000,
    securityDeposit: 3000,
    withDriver: false,
    companyName: "Jodhpur Desert Wheels",
    totalQuantity: 8,
    availableQuantity: 8,
  },
  {
    type: "bike",
    brand: "KTM",
    modelName: "Duke 200",
    seatingCapacity: 2,
    pricingPerDay: 1300,
    securityDeposit: 5000,
    withDriver: false,
    companyName: "Jodhpur Desert Wheels",
    totalQuantity: 4,
    availableQuantity: 4,
  },
  {
    type: "bike",
    brand: "Bajaj",
    modelName: "Pulsar 150",
    seatingCapacity: 2,
    pricingPerDay: 600,
    securityDeposit: 2000,
    withDriver: false,
    companyName: "Jodhpur Desert Wheels",
    totalQuantity: 5,
    availableQuantity: 5,
  },

  // Udaipur Lakeview Rentals
  {
    type: "scooty",
    brand: "Honda",
    modelName: "Activa 6G",
    seatingCapacity: 2,
    pricingPerDay: 400,
    securityDeposit: 1000,
    withDriver: false,
    companyName: "Udaipur Lakeview Rentals",
    totalQuantity: 6,
    availableQuantity: 6,
  },
  {
    type: "scooty",
    brand: "Suzuki",
    modelName: "Access 125",
    seatingCapacity: 2,
    pricingPerDay: 450,
    securityDeposit: 1200,
    withDriver: false,
    companyName: "Udaipur Lakeview Rentals",
    totalQuantity: 4,
    availableQuantity: 4,
  },
  {
    type: "auto",
    brand: "Bajaj",
    modelName: "RE Auto Rickshaw",
    seatingCapacity: 4,
    pricingPerDay: 1000,
    securityDeposit: 500,
    withDriver: true,
    companyName: "Udaipur Lakeview Rentals",
    totalQuantity: 3,
    availableQuantity: 3,
  },

  // Jaipur Pink City Fleet
  {
    type: "car",
    brand: "Maruti Suzuki",
    modelName: "Swift",
    seatingCapacity: 5,
    pricingPerDay: 1800,
    securityDeposit: 5000,
    withDriver: false,
    companyName: "Jaipur Pink City Fleet",
    totalQuantity: 3,
    availableQuantity: 3,
  },
  {
    type: "car",
    brand: "Tata",
    modelName: "Nexon EV",
    seatingCapacity: 5,
    pricingPerDay: 3500,
    securityDeposit: 1500,
    withDriver: true,
    companyName: "Jaipur Pink City Fleet",
    totalQuantity: 2,
    availableQuantity: 2,
  },
  {
    type: "auto",
    brand: "Bajaj",
    modelName: "RE Auto Rickshaw",
    seatingCapacity: 4,
    pricingPerDay: 1000,
    securityDeposit: 500,
    withDriver: true,
    companyName: "Jaipur Pink City Fleet",
    totalQuantity: 3,
    availableQuantity: 3,
  }
];

const vehicleImages = {
  // Scooty
  "Honda Activa 6G":
    "https://res.cloudinary.com/of3mnmu3/image/upload/v1783971670/images_obmwra.jpg",

  "TVS Ntorq 125":
    "https://res.cloudinary.com/of3mnmu3/image/upload/v1783884001/images_jewfu5.jpg",

  "Suzuki Access 125":
    "https://res.cloudinary.com/of3mnmu3/image/upload/v1783884042/images_vkrfx1.jpg",

  // Bikes
  "Royal Enfield Classic 350":
    "https://res.cloudinary.com/of3mnmu3/image/upload/v1783884058/images_kxku5s.jpg",

  "Hero Splendor Plus":
    "https://res.cloudinary.com/of3mnmu3/image/upload/v1783926017/images_wctfrk.jpg",

  "Bajaj Pulsar 150":
    "https://res.cloudinary.com/of3mnmu3/image/upload/v1783884100/images_iokyvx.jpg",

  "KTM Duke 200":
    "https://res.cloudinary.com/of3mnmu3/image/upload/v1783971572/photo-1591378603223-e15b45a81640_a17ome.avif",

  // Cars
  "Maruti Suzuki Swift":
    "https://res.cloudinary.com/of3mnmu3/image/upload/v1783884152/images_zocv7p.jpg",

  "Hyundai Creta":
    "https://res.cloudinary.com/of3mnmu3/image/upload/v1783884168/images_etepcv.jpg",

  "Tata Nexon":
    "https://res.cloudinary.com/of3mnmu3/image/upload/v1783884184/images_s85hkz.jpg",

  "Tata Nexon EV":
    "https://res.cloudinary.com/of3mnmu3/image/upload/v1783971709/download_ao1ozn.jpg",

  "Mahindra Scorpio N":
    "https://res.cloudinary.com/of3mnmu3/image/upload/v1783884207/images_xntatb.jpg",

  // Auto
  "Bajaj RE Auto Rickshaw":
    "https://res.cloudinary.com/of3mnmu3/image/upload/v1783884233/images_hsqji2.jpg",
};

module.exports = {
  vehiclesToSeed,
  vehicleImages,
};