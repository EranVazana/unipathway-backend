/**
 * sekemType:
 *   'quantitative' - 27% verbal, 53% quantitative, 20% English (CS, Engineering)
 *   'verbal'       - 53% verbal, 27% quantitative, 20% English (Law, Psychology)
 *   'general'      - 40% verbal, 40% quantitative, 20% English (Business, Social Sciences)
 *
 * sekemWeights: bagrutWeight + psychometricWeight must sum to 1.
 * minSekem: minimum Sekem score required for admission that year.
 */
const admissionThresholds = [
  // --- Computer Science, Ben-Gurion (dept 1) ---
  {
    thresholdId: 1,
    departmentId: 1,
    year: 2023,
    sekemType: 'quantitative',
    sekemWeights: { bagrutWeight: 0.40, psychometricWeight: 0.60 },
    sekemBonuses: [
      { condition: '5-unit Math', points: 7 },
      { condition: 'Periphery resident', points: 5 }
    ],
    minSekem: 152
  },
  {
    thresholdId: 2,
    departmentId: 1,
    year: 2024,
    sekemType: 'quantitative',
    sekemWeights: { bagrutWeight: 0.40, psychometricWeight: 0.60 },
    sekemBonuses: [
      { condition: '5-unit Math', points: 7 },
      { condition: 'Periphery resident', points: 5 }
    ],
    minSekem: 155
  },

  // --- Computer Science, Tel Aviv (dept 2) ---
  {
    thresholdId: 3,
    departmentId: 2,
    year: 2023,
    sekemType: 'quantitative',
    sekemWeights: { bagrutWeight: 0.40, psychometricWeight: 0.60 },
    sekemBonuses: [
      { condition: '5-unit Math', points: 7 },
      { condition: '5-unit English', points: 5 }
    ],
    minSekem: 169
  },
  {
    thresholdId: 4,
    departmentId: 2,
    year: 2024,
    sekemType: 'quantitative',
    sekemWeights: { bagrutWeight: 0.40, psychometricWeight: 0.60 },
    sekemBonuses: [
      { condition: '5-unit Math', points: 7 },
      { condition: '5-unit English', points: 5 }
    ],
    minSekem: 172
  },

  // --- Information Systems, Hebrew University (dept 3) ---
  {
    thresholdId: 5,
    departmentId: 3,
    year: 2024,
    sekemType: 'quantitative',
    sekemWeights: { bagrutWeight: 0.40, psychometricWeight: 0.60 },
    sekemBonuses: [
      { condition: '5-unit Math', points: 7 }
    ],
    minSekem: 160
  },

  // --- Software Engineering, Technion (dept 4) ---
  {
    thresholdId: 6,
    departmentId: 4,
    year: 2023,
    sekemType: 'quantitative',
    sekemWeights: { bagrutWeight: 0.33, psychometricWeight: 0.67 },
    sekemBonuses: [
      { condition: '5-unit Math', points: 10 },
      { condition: '5-unit Physics', points: 7 }
    ],
    minSekem: 177
  },
  {
    thresholdId: 7,
    departmentId: 4,
    year: 2024,
    sekemType: 'quantitative',
    sekemWeights: { bagrutWeight: 0.33, psychometricWeight: 0.67 },
    sekemBonuses: [
      { condition: '5-unit Math', points: 10 },
      { condition: '5-unit Physics', points: 7 }
    ],
    minSekem: 180
  },

  // --- Industrial Engineering, Ben-Gurion (dept 5) ---
  {
    thresholdId: 8,
    departmentId: 5,
    year: 2024,
    sekemType: 'quantitative',
    sekemWeights: { bagrutWeight: 0.40, psychometricWeight: 0.60 },
    sekemBonuses: [
      { condition: '5-unit Math', points: 7 },
      { condition: 'Periphery resident', points: 5 }
    ],
    minSekem: 142
  },

  // --- Law, Tel Aviv (dept 6) ---
  {
    thresholdId: 9,
    departmentId: 6,
    year: 2024,
    sekemType: 'verbal',
    sekemWeights: { bagrutWeight: 0.40, psychometricWeight: 0.60 },
    sekemBonuses: [
      { condition: '5-unit English', points: 5 }
    ],
    minSekem: 178
  },

  // --- Psychology, Hebrew University (dept 7) ---
  {
    thresholdId: 10,
    departmentId: 7,
    year: 2024,
    sekemType: 'verbal',
    sekemWeights: { bagrutWeight: 0.40, psychometricWeight: 0.60 },
    sekemBonuses: [
      { condition: '5-unit English', points: 5 },
      { condition: 'Honors bagrut (100+ avg)', points: 5 }
    ],
    minSekem: 175
  },

  // --- Business Administration, Haifa (dept 8) ---
  {
    thresholdId: 11,
    departmentId: 8,
    year: 2024,
    sekemType: 'general',
    sekemWeights: { bagrutWeight: 0.40, psychometricWeight: 0.60 },
    sekemBonuses: [
      { condition: '5-unit Math', points: 5 },
      { condition: '5-unit English', points: 5 }
    ],
    minSekem: 148
  },

  // --- Communication Studies, Bar-Ilan (dept 9) ---
  {
    thresholdId: 12,
    departmentId: 9,
    year: 2024,
    sekemType: 'general',
    sekemWeights: { bagrutWeight: 0.40, psychometricWeight: 0.60 },
    sekemBonuses: [
      { condition: '5-unit English', points: 5 },
      { condition: 'Jewish studies bonus', points: 3 }
    ],
    minSekem: 135
  }
];

let nextId = 13;
function getNextId() { return nextId++; }

module.exports = { admissionThresholds, getNextId };
