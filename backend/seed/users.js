// Realistic Indian Users data generator
const users = [
  // 1 Admin
  {
    name: 'System Administrator',
    email: 'admin@ridevista.com',
    password: 'password123',
    role: 'admin',
    phone: '+91 9999999999',
  },
  // 10 Tourists

  {
    name: 'Sidharth Malhotra',
    email: 'sid@gmail.com',
    password: 'password123',
    role: 'user',
    phone: '+91 9001122340',
  },
  {
    name: 'Neha Sen',
    email: 'neha@gmail.com',
    password: 'password123',
    role: 'user',
    phone: '+91 9001122341',
  },
  {
    name: 'Rahul Roy',
    email: 'rahul@gmail.com',
    password: 'password123',
    role: 'user',
    phone: '+91 9001122342',
  },
  {
    name: 'Divya Singh',
    email: 'divya@gmail.com',
    password: 'password123',
    role: 'user',
    phone: '+91 9001122343',
  }
];

// Helper to generate 10 company owner users
const generateOwners = () => {
  const owners = [];
  const names = [
    'Rajesh Chenani', 'Vikram Rathore', 'Anil Singh', 'Devendra Gehlot', 'Sanjay Dutt',
    'Mohit Ranawat', 'Prakash Vyas', 'Harish Joshi', 'Gaurav Purohit', 'Karan Mehra'
  ];
  for (let i = 0; i < 10; i++) {
    owners.push({
      name: names[i],
      email: `owner${i + 1}@ridevista.com`,
      password: 'password123',
      role: 'rental_company',
      phone: `+91 987654321${i}`,
    });
  }
  return owners;
};

// Helper to generate 40 driver users
const generateDriverUsers = () => {
  const drivers = [];
  const names = [
    'Ramesh Kumar', 'Suresh Sharma', 'Dinesh Singh', 'Mahendra Yadav', 'Mukesh Choudhary',
    'Naresh Gupta', 'Kamlesh Verma', 'Sanjay Soni', 'Rajesh Mali', 'Shyam Lal'
  ];
  for (let i = 0; i < 40; i++) {
    drivers.push({
      name: `${names[i % names.length]} ${Math.floor(i / 10) + 1}`,
      email: `driver${i + 1}@ridevista.com`,
      password: 'password123',
      role: 'driver',
      phone: `+91 99887766${String(i).padStart(2, '0')}`,
    });
  }
  return drivers;
};

module.exports = {
  baseUsers: users,
  owners: generateOwners(),
  drivers: generateDriverUsers()
};
