// Passwords (plaintext, for testing only — never stored): 
//   Eran: eran1234 | Omri: omri1234 | Yael: yael1234
//   Roni: roni1234 | Dana: dana1234 | Tal: tal1234

const users = [
  // Admins
  {
    userId: 1,
    firstName: 'Eran',
    lastName: 'Vazana',
    email: 'eran@unipathway.com',
    passwordSalt: '90a66f9fdf95e187d56397b189467e40',
    passwordHash: 'b763c1722c5df1c5badaee779fb85efc9cd6201e04366267796e3838917b51a9273ec9717bbc22bf8e8b5747fcb4409bbff95be3f2580e2c74ca36d45cf7062c',
    createDate: '2024-01-10T10:00:00.000Z',
    updateDate: '2024-01-10T10:00:00.000Z',
    userRole: 'admin'
  },
  {
    userId: 2,
    firstName: 'Omri',
    lastName: 'Hershkovich',
    email: 'omri@unipathway.com',
    passwordSalt: 'a71b78b08c9781da3d70695f29c24f1d',
    passwordHash: 'fc145ba12cf7900c9e235a16c1907d93a723eab1e37fee1dfb34666d5d1994189366c746cd8b69247c35735c496f3590d9dd526d076464de700477068310dfb1',
    createDate: '2024-01-11T09:30:00.000Z',
    updateDate: '2024-01-11T09:30:00.000Z',
    userRole: 'admin'
  },

  // Editors
  {
    userId: 3,
    firstName: 'Yael',
    lastName: 'Levi',
    email: 'yael@unipathway.com',
    passwordSalt: '8f5c63e4c362992c41f871105b7499ee',
    passwordHash: '42a51e6a523107db40dd4992b4ac569e8c17a91f13b5f12ec03798bde2b3208e4e9e90b4ce7c273366f25ba53fa49a15ee8db67f4bffa0cea89ab5d157452926',
    createDate: '2024-02-01T08:00:00.000Z',
    updateDate: '2024-02-01T08:00:00.000Z',
    userRole: 'editor'
  },
  {
    userId: 4,
    firstName: 'Roni',
    lastName: 'Bar',
    email: 'roni@unipathway.com',
    passwordSalt: '20fd0720e805a0591612d72e3668462f',
    passwordHash: '624cce433d1fbd48cd7eac72f06176905f1cda9c73d7803febd2c890ea63ef15fe5606154dc62134618a70656b0bad00f3ba97294bc9f9951322104cc800bd59',
    createDate: '2024-02-15T11:00:00.000Z',
    updateDate: '2024-02-15T11:00:00.000Z',
    userRole: 'editor'
  },

  // Regular users
  {
    userId: 5,
    firstName: 'Dana',
    lastName: 'Cohen',
    email: 'dana@unipathway.com',
    passwordSalt: '9b31f6e15a10ad251e063385a912ba7e',
    passwordHash: '1ec74aabaf5dae0f62763949f5a1543967c827d6096b9c09729c08f9650d4b6eead2a98adf7e018fed377a8edbbf2c4bda0118e3b227db72604474e22228fa06',
    createDate: '2024-03-05T14:20:00.000Z',
    updateDate: '2024-03-05T14:20:00.000Z',
    userRole: 'user'
  },
  {
    userId: 6,
    firstName: 'Tal',
    lastName: 'Shapira',
    email: 'tal@unipathway.com',
    passwordSalt: 'a448cec0a9613438fbd1b1a94dadbcce',
    passwordHash: '7337d180972c710bbaf3c69dcb4e7fc8c210cf7acd6bf246374a61300fba8d6db4a4382c79c33e5f18bb90e74277e2dab25396695b943ba537551c7bee24d8b3',
    createDate: '2024-03-10T16:45:00.000Z',
    updateDate: '2024-03-10T16:45:00.000Z',
    userRole: 'user'
  }
];

let nextId = 7;
function getNextId() { return nextId++; }

module.exports = { users, getNextId };
