const comments = [
  'Excellent service! The vehicle was extremely clean and the pickup was prompt.',
  'Decent rentals. Pricing is affordable compared to other local operators.',
  'Highly recommended. The driver was super polite and explained the history of Jodhpur very well.',
  'Good scooters. A bit old but worked perfectly fine for traversing the narrow streets.',
  'Satisfied with the booking experience. Direct direct connection with company owner is great.',
  'Smooth ride! Had no issues during our 3-day trip to Jaipur.',
  'The vehicle deposit was refunded immediately without any hassles.',
  'Awesome experience renting a Royal Enfield. Cruising through Rajasthan was breathtaking.',
  'Good local agency. Highly responsive on calls.',
  'Safe driving and very comfortable. Will definitely rent again.'
];

const generateReviews = (touristUsers, companyList) => {
  const reviews = [];
  for (let i = 0; i < 30; i++) {
    const cIdx = i % companyList.length;
    // Shift user index per company pass to avoid duplicate company/user pairs
    const uIdx = (cIdx + Math.floor(i / companyList.length)) % touristUsers.length;
    
    const user = touristUsers[uIdx];
    const company = companyList[cIdx];
    
    reviews.push({
      user: user._id,
      company: company._id,
      rating: Math.floor(Math.random() * 2) + 4, // 4 or 5 star ratings to look professional
      comment: comments[i % comments.length]
    });
  }
  return reviews;
};

module.exports = generateReviews;
