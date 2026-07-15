const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Models
const User = require('../models/User');
const Company = require('../models/Company');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const TourRequest = require('../models/TourRequest');
const Feedback = require('../models/Feedback');
const Review = require('../models/Review');

// Data sources
const { baseUsers, owners, drivers: driverUsers } = require('./users');
const { companyTemplates, generateCompany } = require('./companies');
const { vehiclesToSeed, vehicleImages } = require('./vehicles');
const generateDrivers = require('./drivers');
const generateRequests = require('./requests');
const generateReviews = require('./reviews');
const generateFeedbacks = require('./feedbacks');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const dbUrl = process.env.MONGO_URI || 'mongodb://localhost:27017/ridevista';

const destroyData = async () => {
  try {
    console.log('🗑️  Wiping database clean...');
    await User.deleteMany();
    await Company.deleteMany();
    await Vehicle.deleteMany();
    await Driver.deleteMany();
    await TourRequest.deleteMany();
    await Feedback.deleteMany();
    await Review.deleteMany();
    console.log('✅ Wiped all database collections successfully');
  } catch (err) {
    console.error('Error wiping database:', err);
    throw err;
  }
};

const runSeeder = async () => {
  try {
    console.log('🔄 Connecting to MongoDB at:', dbUrl);
    await mongoose.connect(dbUrl);
    console.log('🔌 DB Connection established');

    // Wipe database
    await destroyData();

    if (process.argv.includes('--destroy')) {
      console.log('🧹 Seeding destruction complete. Exiting.');
      process.exit(0);
    }

    console.log('🌱 Starting database seeding...');

    // 1. Seed base users (Admin, Tourists)
    console.log('👤 Seeding base users...');
    const seededBaseUsers = await User.create(baseUsers);
    const touristUsers = seededBaseUsers.filter(u => u.role === 'user');
    const primaryTourist = touristUsers[0];
    console.log('✅ Seeded base users');

    // 2. Extract unique company names from vehiclesToSeed
    const uniqueCompanyNames = [...new Set(vehiclesToSeed.map(v => v.companyName))];
    console.log(`🏢 Found ${uniqueCompanyNames.length} unique companies from vehicle data`);

    // 3. Create company owner users
    console.log('💼 Seeding company owners...');
    const ownersToCreate = uniqueCompanyNames.map((compName, idx) => {
      const ownerTemplate = owners[idx % owners.length];
      return {
        ...ownerTemplate,
        email: `owner${idx + 1}@ridevista.com`, // Ensure unique emails
        phone: `+91 987654321${idx % 10}`
      };
    });
    const seededOwners = await User.create(ownersToCreate);
    console.log('✅ Seeded company owners');

    // 4. Create companies
    console.log('🏢 Seeding rental companies...');
    const companiesToSeed = uniqueCompanyNames.map((compName, idx) => {
      const compObj = generateCompany(compName, idx);
      return {
        ...compObj,
        owner: seededOwners[idx]._id
      };
    });
    const seededCompanies = await Company.create(companiesToSeed);

    // Update owner users with company references
    for (let i = 0; i < seededOwners.length; i++) {
      await User.findByIdAndUpdate(seededOwners[i]._id, { company: seededCompanies[i]._id });
    }
    console.log('✅ Seeded companies');

    // 5. Create vehicles, mapping to the created companies and finding Cloudinary image URLs
    console.log('🚗 Seeding vehicle fleet...');
    const processedVehicles = vehiclesToSeed.map(v => {
      const company = seededCompanies.find(c => c.name === v.companyName);
      const imageLookupKey = `${v.brand} ${v.modelName}`;
      const imgUrl = vehicleImages[imageLookupKey] || '';
      
      // Remove companyName from DB payload
      const { companyName, ...dbPayload } = v;

      return {
        ...dbPayload,
        company: company._id,
        image: imgUrl
      };
    });
    const seededVehicles = await Vehicle.create(processedVehicles);
    console.log(`✅ Seeded ${seededVehicles.length} vehicles`);

    // 6. Create driver users
    console.log('🚘 Seeding driver users...');
    const seededDriverUsers = await User.create(driverUsers);
    console.log('✅ Seeded driver users');

    // 7. Seed driver profiles (linked to dynamic companies)
    console.log('👥 Seeding driver profiles...');
    const rawDrivers = generateDrivers(seededDriverUsers, seededCompanies);
    const seededDrivers = await Driver.create(rawDrivers);

    // Update driver users with company references
    for (let i = 0; i < seededDrivers.length; i++) {
      const drv = seededDrivers[i];
      await User.findByIdAndUpdate(drv.user, { company: drv.company });
    }
    console.log('✅ Seeded driver profiles');

    // 8. Seed requests
    console.log('📋 Seeding driver booking requests...');
    const rawRequests = generateRequests(touristUsers, seededDrivers, seededVehicles);
    await TourRequest.create(rawRequests);
    console.log('✅ Seeded driver booking requests');

    // 9. Seed reviews
    console.log('⭐ Seeding customer reviews...');
    const rawReviews = generateReviews(touristUsers, seededCompanies);
    const seededReviews = await Review.create(rawReviews);

    // Calculate ratings for all companies based on reviews
    console.log('📊 Calculating company ratings averages...');
    for (const company of seededCompanies) {
      const compReviews = seededReviews.filter(r => r.company.toString() === company._id.toString());
      const numRatings = compReviews.length;
      const rating = numRatings > 0
        ? Number((compReviews.reduce((sum, r) => sum + r.rating, 0) / numRatings).toFixed(1))
        : 0;
      await Company.findByIdAndUpdate(company._id, { rating, numRatings });
    }
    console.log('✅ Calculated company ratings averages');

    // 10. Seed feedbacks
    console.log('📝 Seeding user feedback...');
    const rawFeedbacks = generateFeedbacks(primaryTourist);
    await Feedback.create(rawFeedbacks);
    console.log('✅ Seeded user feedback');

    console.log('\n✨ Database seeding completed successfully! ✨\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed with error:', error);
    process.exit(1);
  }
};

// Check Command Line Arguments
if (process.argv.includes('--destroy')) {
  mongoose.connect(dbUrl).then(async () => {
    await destroyData();
    process.exit(0);
  }).catch(err => {
    console.error(err);
    process.exit(1);
  });
} else {
  runSeeder();
}
