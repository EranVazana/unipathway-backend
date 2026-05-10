/**
 * sekemCalculator.js
 * Core Sekem scoring logic for UniPathway.
 * Used by validate.js (for cross-reference checks) and controllers (for storing results).
 */

/**
 * Calculates the user's Sekem score for a given threshold.
 *
 * Step 1 - Bagrut average (weighted by units):
 *   bagrutAvg = sum(grade × units) / sum(units)
 *
 * Step 2 - Psychometric composite (depends on sekemType):
 *   quantitative: 0.53 × quant + 0.27 × verbal + 0.20 × english
 *   verbal:       0.53 × verbal + 0.27 × quant  + 0.20 × english
 *   general:      0.40 × verbal + 0.40 × quant  + 0.20 × english
 *
 * Step 3 - Combine using university weights:
 *   sekem = (bagrutAvg × bagrutWeight) + (psychoScore × psychometricWeight)
 *
 * Step 4 - Apply bonuses from threshold.sekemBonuses
 *
 * Returns the score rounded to 2 decimal places, or null if scores are missing.
 */
function calculateUserSekem(user, threshold) {
  const { psychometricScores, bagrutScores } = user;
  const { sekemType, sekemWeights, sekemBonuses } = threshold;

  if (!psychometricScores || !bagrutScores) return null;

  // Step 1 — Bagrut weighted average
  let totalPoints = 0;
  let totalUnits = 0;
  for (const { grade, units } of Object.values(bagrutScores)) {
    totalPoints += grade * units;
    totalUnits += units;
  }
  const bagrutAvg = totalUnits > 0 ? totalPoints / totalUnits : 0;

  // Step 2 — Psychometric composite
  const { verbal, quantitative, english } = psychometricScores;
  let psychoScore;
  if (sekemType === 'quantitative') {
    psychoScore = 0.53 * quantitative + 0.27 * verbal + 0.20 * english;
  } else if (sekemType === 'verbal') {
    psychoScore = 0.53 * verbal + 0.27 * quantitative + 0.20 * english;
  } else {
    psychoScore = 0.40 * verbal + 0.40 * quantitative + 0.20 * english;
  }

  // Step 3 — Combine
  let sekem = (bagrutAvg * sekemWeights.bagrutWeight) + (psychoScore * sekemWeights.psychometricWeight);

  // Step 4 — Apply bonuses
  for (const bonus of (sekemBonuses || [])) {
    if (bonus.condition === '5-unit Math'    && bagrutScores.mathematics?.units === 5) sekem += bonus.points;
    if (bonus.condition === '5-unit English' && bagrutScores.english?.units    === 5) sekem += bonus.points;
    if (bonus.condition === '5-unit Physics' && bagrutScores.physics?.units    === 5) sekem += bonus.points;
  }

  return Math.round(sekem * 100) / 100;
}

/**
 * Derives the sekemStatus string from a user's score vs a threshold.
 * Always called server-side — never provided by the client.
 *
 * Returns:
 *   'passed-required-acceptance-score'  — user Sekem >= minSekem
 *   'below-required-acceptance-score'   — user Sekem < minSekem
 *   'no-data'                           — missing scores or threshold
 */
function deriveSekemStatus(user, threshold) {
  if (!threshold || !user.psychometricScores || !user.bagrutScores) {
    return 'no-data';
  }
  const userSekem = calculateUserSekem(user, threshold);
  return userSekem >= threshold.minSekem
    ? 'passed-required-acceptance-score'
    : 'below-required-acceptance-score';
}

/**
 * Returns the most recent threshold for a given departmentId.
 */
function getLatestThreshold(admissionThresholds, departmentId) {
  return admissionThresholds
    .filter(t => t.departmentId === departmentId)
    .sort((a, b) => b.year - a.year)[0] || null;
}

module.exports = { calculateUserSekem, deriveSekemStatus, getLatestThreshold };
