const universities = [
  {
    universityId: 1,
    name: 'Ben-Gurion University',
    location: 'Beer-Sheva',
    logoUrl: 'https://example.com/logos/bgu.png',
    websiteUrl: 'https://www.bgu.ac.il',
    description: 'A major research university known for its pioneering spirit, strong community vibes, and leading advancements in desert research, engineering, and cyber-security.'
  },
  {
    universityId: 2,
    name: 'Tel Aviv University',
    location: 'Tel Aviv',
    logoUrl: 'https://example.com/logos/tau.png',
    websiteUrl: 'https://www.tau.ac.il',
    description: 'Israel’s largest institution of higher learning, globally recognized for its vibrant campus culture, multidisciplinary research, and strong ties to the thriving tech ecosystem.'
  },
  {
    universityId: 3,
    name: 'Hebrew University',
    location: 'Jerusalem',
    logoUrl: 'https://example.com/logos/huji.png',
    websiteUrl: 'https://www.huji.ac.il',
    description: 'A prestigious, world-renowned institution co-founded by Albert Einstein, deep-rooted in rich history and celebrated for its academic excellence across humanities and sciences.'
  },
  {
    universityId: 4,
    name: 'Technion',
    location: 'Haifa',
    logoUrl: 'https://example.com/logos/technion.png',
    websiteUrl: 'https://www.technion.ac.il',
    description: 'A premier global science and technology research university, widely credited as the powerhouse driving the innovation behind Israel’s "Startup Nation" status.'
  },
  {
    universityId: 5,
    name: 'University of Haifa',
    location: 'Haifa',
    logoUrl: 'https://example.com/logos/haifa.png',
    websiteUrl: 'https://www.haifa.ac.il',
    description: 'Perched atop Mount Carmel, this university is highly regarded for its diverse student body and exceptional programs in marine sciences, humanities, and social work.'
  },
  {
    universityId: 6,
    name: 'Bar-Ilan University',
    location: 'Ramat Gan',
    logoUrl: 'https://example.com/logos/biu.png',
    websiteUrl: 'https://www.biu.ac.il',
    description: 'An expansive research university uniquely blending high-level academic training in exact sciences, law, and medicine with the study of Jewish heritage.'
  }
];

let nextId = 7;

function getNextId() {
  return nextId++;
}

module.exports = { universities, getNextId };