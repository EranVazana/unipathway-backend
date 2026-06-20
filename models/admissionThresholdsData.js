// minSekem values are on the Sekem scale produced by sekemCalculator:
//   sekem = bagrutAvg(0-100) × bagrutWeight + psychometric(200-800) × psychometricWeight
// With weights summing to 1, scores typically land in the ~380-520 range.
//
// Reference (latest-year) sekems for the mock students:
//   Dana (userId 5): dept1=431, dept2=459, dept3=431, dept4=471, dept5=431,
//                    dept6=434, dept7=434, dept8=389, dept9=389
//   Tal  (userId 6): dept1=476, dept2=509, dept3=476, dept4=522, dept5=476,
//                    dept6=407, dept7=407, dept8=395, dept9=395
//
// Only bagrut-related bonuses (5-unit Math / English / Physics) are used.

const admissionThresholds = [
  // CS @ BGU (dept 1) — quantitative
  { thresholdId: 1,  departmentId: 1, year: 2023, sekemType: 'quantitative', sekemWeights: { bagrutWeight: 0.40, psychometricWeight: 0.60 }, sekemBonuses: [{ condition: '5-unit Math', points: 10 }], minSekem: 450 },
  { thresholdId: 2,  departmentId: 1, year: 2024, sekemType: 'quantitative', sekemWeights: { bagrutWeight: 0.40, psychometricWeight: 0.60 }, sekemBonuses: [{ condition: '5-unit Math', points: 10 }], minSekem: 460 },

  // CS @ TAU (dept 2) — quantitative, competitive
  { thresholdId: 3,  departmentId: 2, year: 2023, sekemType: 'quantitative', sekemWeights: { bagrutWeight: 0.35, psychometricWeight: 0.65 }, sekemBonuses: [{ condition: '5-unit Math', points: 10 }], minSekem: 490 },
  { thresholdId: 4,  departmentId: 2, year: 2024, sekemType: 'quantitative', sekemWeights: { bagrutWeight: 0.35, psychometricWeight: 0.65 }, sekemBonuses: [{ condition: '5-unit Math', points: 10 }], minSekem: 500 },

  // Info Systems @ Hebrew U (dept 3) — quantitative, accessible
  { thresholdId: 5,  departmentId: 3, year: 2024, sekemType: 'quantitative', sekemWeights: { bagrutWeight: 0.40, psychometricWeight: 0.60 }, sekemBonuses: [], minSekem: 420 },

  // Software Eng @ Technion (dept 4) — quantitative, most competitive
  { thresholdId: 6,  departmentId: 4, year: 2023, sekemType: 'quantitative', sekemWeights: { bagrutWeight: 0.33, psychometricWeight: 0.67 }, sekemBonuses: [{ condition: '5-unit Math', points: 10 }, { condition: '5-unit Physics', points: 8 }], minSekem: 500 },
  { thresholdId: 7,  departmentId: 4, year: 2024, sekemType: 'quantitative', sekemWeights: { bagrutWeight: 0.33, psychometricWeight: 0.67 }, sekemBonuses: [{ condition: '5-unit Math', points: 10 }, { condition: '5-unit Physics', points: 8 }], minSekem: 510 },

  // Industrial Eng @ BGU (dept 5) — quantitative, accessible
  { thresholdId: 8,  departmentId: 5, year: 2024, sekemType: 'quantitative', sekemWeights: { bagrutWeight: 0.40, psychometricWeight: 0.60 }, sekemBonuses: [{ condition: '5-unit Math', points: 10 }], minSekem: 425 },

  // Law @ TAU (dept 6) — verbal, competitive
  { thresholdId: 9,  departmentId: 6, year: 2024, sekemType: 'verbal',       sekemWeights: { bagrutWeight: 0.45, psychometricWeight: 0.55 }, sekemBonuses: [{ condition: '5-unit English', points: 8 }], minSekem: 430 },

  // Psychology @ Hebrew U (dept 7) — verbal, very competitive
  { thresholdId: 10, departmentId: 7, year: 2024, sekemType: 'verbal',       sekemWeights: { bagrutWeight: 0.45, psychometricWeight: 0.55 }, sekemBonuses: [{ condition: '5-unit English', points: 8 }], minSekem: 445 },

  // Business Admin @ Haifa (dept 8) — general, accessible
  { thresholdId: 11, departmentId: 8, year: 2024, sekemType: 'general',      sekemWeights: { bagrutWeight: 0.50, psychometricWeight: 0.50 }, sekemBonuses: [], minSekem: 385 },

  // Communication @ Bar-Ilan (dept 9) — general, most accessible
  { thresholdId: 12, departmentId: 9, year: 2024, sekemType: 'general',      sekemWeights: { bagrutWeight: 0.50, psychometricWeight: 0.50 }, sekemBonuses: [], minSekem: 400 }
];

let nextId = 13;
function getNextId() { return nextId++; }

module.exports = { admissionThresholds, getNextId };