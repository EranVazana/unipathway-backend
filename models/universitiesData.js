const universities = [
  {
    universityId: 1,
    name: 'Ben-Gurion University',
    location: 'Beer-Sheva',
    logoUrl: 'https://example.com/logos/bgu.png',
    websiteUrl: 'https://www.bgu.ac.il'
  },
  {
    universityId: 2,
    name: 'Tel Aviv University',
    location: 'Tel Aviv',
    logoUrl: 'https://example.com/logos/tau.png',
    websiteUrl: 'https://www.tau.ac.il'
  },
  {
    universityId: 3,
    name: 'Hebrew University',
    location: 'Jerusalem',
    logoUrl: 'https://example.com/logos/huji.png',
    websiteUrl: 'https://www.huji.ac.il'
  },
  {
    universityId: 4,
    name: 'Technion',
    location: 'Haifa',
    logoUrl: 'https://example.com/logos/technion.png',
    websiteUrl: 'https://www.technion.ac.il'
  },
  {
    universityId: 5,
    name: 'University of Haifa',
    location: 'Haifa',
    logoUrl: 'https://example.com/logos/haifa.png',
    websiteUrl: 'https://www.haifa.ac.il'
  },
  {
    universityId: 6,
    name: 'Bar-Ilan University',
    location: 'Ramat Gan',
    logoUrl: 'https://example.com/logos/biu.png',
    websiteUrl: 'https://www.biu.ac.il'
  }
];

let nextId = 7;

function getNextId() {
  return nextId++;
}

module.exports = { universities, getNextId };
