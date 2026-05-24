// Academic scores belong only to users with userRole === 'user'.
// Admins and editors do not have scores (they are platform operators, not students).

const academicScores = [
  {
    academicScoresId: 1,
    userId: 5, // Dana Cohen (verbal profile)
    psychometricScores: {
      verbal: 142,
      quantitative: 118,
      english: 136
    },
    bagrutScores: {
      bibleStudies:     { grade: 92, units: 2 },
      literature:       { grade: 95, units: 3 },
      hebrewExpression: { grade: 90, units: 2 },
      history:          { grade: 88, units: 3 },
      civics:           { grade: 91, units: 2 },
      mathematics:      { grade: 74, units: 3 },
      english:          { grade: 93, units: 5 },
      psychology:       { grade: 96, units: 5 },
      arabic:           { grade: 85, units: 3 }
    },
    createDate: '2024-03-05T14:20:00.000Z',
    updateDate: '2024-03-05T14:20:00.000Z'
  },
  {
    academicScoresId: 2,
    userId: 6, // Tal Shapira (quantitative profile)
    psychometricScores: {
      verbal: 120,
      quantitative: 148,
      english: 132
    },
    bagrutScores: {
      bibleStudies:     { grade: 80, units: 2 },
      literature:       { grade: 78, units: 2 },
      hebrewExpression: { grade: 84, units: 2 },
      history:          { grade: 79, units: 2 },
      civics:           { grade: 81, units: 2 },
      mathematics:      { grade: 95, units: 5 },
      english:          { grade: 88, units: 5 },
      computerScience:  { grade: 94, units: 5 },
      physics:          { grade: 90, units: 5 }
    },
    createDate: '2024-03-10T16:45:00.000Z',
    updateDate: '2024-03-10T16:45:00.000Z'
  }
];

let nextId = 3;
function getNextId() { return nextId++; }

module.exports = { academicScores, getNextId };
