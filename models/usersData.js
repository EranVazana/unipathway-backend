const users = [
  {
    userId: 1,
    firstName: 'Eran',
    lastName: 'Vazana',
    createDate: '2024-01-10T10:00:00.000Z',
    updateDate: '2024-01-10T10:00:00.000Z',
    userRole: 'admin',
    psychometricScores: {
      verbal: 134,
      quantitative: 148,
      english: 140
    },
    bagrutScores: {
      bibleStudies:          { grade: 85, units: 2 },
      literature:            { grade: 78, units: 2 },
      hebrewExpression:      { grade: 90, units: 2 },
      history:               { grade: 82, units: 2 },
      civics:                { grade: 88, units: 2 },
      mathematics:           { grade: 95, units: 5 },
      english:               { grade: 91, units: 5 },
      // electives
      computerScience:       { grade: 97, units: 5 },
      physics:               { grade: 89, units: 5 }
    }
  },
  {
    userId: 2,
    firstName: 'Omri',
    lastName: 'Hershkovich',
    createDate: '2024-01-11T09:30:00.000Z',
    updateDate: '2024-01-11T09:30:00.000Z',
    userRole: 'user',
    psychometricScores: {
      verbal: 120,
      quantitative: 138,
      english: 125
    },
    bagrutScores: {
      bibleStudies:          { grade: 75, units: 2 },
      literature:            { grade: 80, units: 2 },
      hebrewExpression:      { grade: 78, units: 2 },
      history:               { grade: 72, units: 2 },
      civics:                { grade: 76, units: 2 },
      mathematics:           { grade: 88, units: 4 },
      english:               { grade: 82, units: 4 },
      // electives
      computerScience:       { grade: 91, units: 5 }
    }
  },
  {
    userId: 3,
    firstName: 'Dana',
    lastName: 'Cohen',
    createDate: '2024-02-05T14:20:00.000Z',
    updateDate: '2024-02-05T14:20:00.000Z',
    userRole: 'user',
    psychometricScores: {
      verbal: 142,
      quantitative: 118,
      english: 136
    },
    bagrutScores: {
      bibleStudies:          { grade: 92, units: 2 },
      literature:            { grade: 95, units: 3 },
      hebrewExpression:      { grade: 90, units: 2 },
      history:               { grade: 88, units: 3 },
      civics:                { grade: 91, units: 2 },
      mathematics:           { grade: 74, units: 3 },
      english:               { grade: 93, units: 5 },
      // electives
      psychology:            { grade: 96, units: 5 },
      arabic:                { grade: 85, units: 3 }
    }
  },
  {
    userId: 4,
    firstName: 'Yael',
    lastName: 'Levi',
    createDate: '2024-03-01T08:00:00.000Z',
    updateDate: '2024-03-01T08:00:00.000Z',
    userRole: 'manager',
    psychometricScores: {
      verbal: 130,
      quantitative: 127,
      english: 143
    },
    bagrutScores: {
      bibleStudies:          { grade: 80, units: 2 },
      literature:            { grade: 83, units: 2 },
      hebrewExpression:      { grade: 85, units: 2 },
      history:               { grade: 79, units: 2 },
      civics:                { grade: 82, units: 2 },
      mathematics:           { grade: 81, units: 4 },
      english:               { grade: 94, units: 5 },
      // electives
      biology:               { grade: 88, units: 5 },
      chemistry:             { grade: 84, units: 4 }
    }
  }
];

let nextId = 5;

function getNextId() {
  return nextId++;
}

module.exports = { users, getNextId };