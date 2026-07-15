const subjects = [
  'Minor lag in map rendering',
  'Add UPI payments method',
  'Driver not showing in list',
  'Typo in vehicle specs page',
  'Need help with refund info',
  'Awesome dark mode theme!',
  'Auto-rickshaw pricing query',
  'Unable to delete vehicle',
  'Verify business document query',
  'App working perfectly'
];

const categories = ['feedback', 'suggestion', 'bug_report', 'support_request'];

const descriptions = [
  'Sometimes the Google Maps map loads slow on mobile networks. Please optimize the maps script.',
  'It would be great to connect UPI payment gateways directly for booking advance security deposits.',
  'I registered my pilot and approved him, but he does not show as available in Jodhpur search results.',
  'Under scooter specifications, TVS Ntorq is listed as 125cc but shows 110cc in description. Please fix.',
  'How do I request my security deposit refund if the trip gets cancelled early? Please add support section.',
  'The yellow glassmorphism theme on dark mode looks absolutely spectacular. Incredible job!',
  'Can you clarify if Bajaj RE Auto rates are fixed or vary based on peak tourist season in Udaipur?',
  'I am trying to delete a vehicle that is currently on an active tour. The button is disabled. Is that normal?',
  'What documents are acceptable as proof of business registration for rental verification?',
  'Very smooth coordination between tourists and local rental agencies. Super useful application!'
];

const generateFeedbacks = (touristUser) => {
  const feedbacks = [];
  const statuses = ['pending', 'resolved'];
  
  for (let i = 0; i < 20; i++) {
    feedbacks.push({
      user: touristUser._id,
      subject: subjects[i % subjects.length],
      category: categories[i % categories.length],
      description: descriptions[i % descriptions.length],
      status: statuses[i % statuses.length]
    });
  }
  
  return feedbacks;
};

module.exports = generateFeedbacks;
