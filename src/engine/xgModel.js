/**
 * Football xG (Expected Goals) Model
 * A simplified mathematical model to calculate the probability of a shot resulting in a goal.
 */

// Basic logistic regression constants (tuned for realistic outputs)
// P = 1 / (1 + e^-(b0 + b1*d + b2*a + modifiers))
const B0 = 0.8;         // Intercept
const B_DIST = -0.12;   // Distance penalty
const B_ANGLE = 0.015;  // Angle bonus (larger angle to goal is better)

export const SHOT_TYPES = {
  FOOT: { label: 'Foot', value: 'foot', modifier: 0 },
  HEADER: { label: 'Header', value: 'header', modifier: -0.7 },
  VOLLEY: { label: 'Volley', value: 'volley', modifier: -0.3 },
};

export const ASSIST_TYPES = {
  NONE: { label: 'Unassisted', value: 'none', modifier: -0.2 },
  PASS: { label: 'Standard Pass', value: 'pass', modifier: 0 },
  THROUGH_BALL: { label: 'Through Ball', value: 'through_ball', modifier: 0.6 },
  CROSS: { label: 'Cross', value: 'cross', modifier: -0.1 },
  CUTBACK: { label: 'Cutback', value: 'cutback', modifier: 0.8 },
};

export const PLAY_CONTEXT = {
  OPEN_PLAY: { label: 'Open Play', value: 'open_play', modifier: 0 },
  CORNER: { label: 'Corner', value: 'corner', modifier: -0.3 },
  FREE_KICK: { label: 'Direct Free Kick', value: 'free_kick', modifier: 0.4 }, // free kicks usually don't have assists
  PENALTY: { label: 'Penalty', value: 'penalty', modifier: 1.8 }, // sets xG to ~0.79
};

/**
 * Calculate expected goals (xG)
 * @param {number} distance - Distance to goal in meters
 * @param {number} angle - Visible angle of the goal in degrees
 * @param {string} shotType - Key from SHOT_TYPES
 * @param {string} assistType - Key from ASSIST_TYPES
 * @param {string} playContext - Key from PLAY_CONTEXT
 * @returns {number} Probability between 0 and 1
 */
export function calculateXG(distance, angle, shotType = 'foot', assistType = 'none', playContext = 'open_play') {
  // If penalty, return fixed xG standard (around 0.79)
  if (playContext === 'penalty') {
    return 0.79;
  }

  // Get modifiers
  const mShot = Object.values(SHOT_TYPES).find(s => s.value === shotType)?.modifier || 0;
  const mAssist = Object.values(ASSIST_TYPES).find(s => s.value === assistType)?.modifier || 0;
  const mContext = Object.values(PLAY_CONTEXT).find(s => s.value === playContext)?.modifier || 0;

  let totalModifier = mShot + mAssist + mContext;

  // Synergies/Penalties
  // Crosses are better with headers than feet
  if (assistType === 'cross' && shotType === 'header') {
    totalModifier += 0.3;
  }
  // Free kicks don't usually have assists in this model
  if (playContext === 'free_kick') {
    totalModifier -= mAssist; // negate assist
  }

  // Calculate log-odds
  const logOdds = B0 + (B_DIST * distance) + (B_ANGLE * angle) + totalModifier;
  
  // Convert log-odds to probability using sigmoid function
  const probability = 1 / (1 + Math.exp(-logOdds));

  // Cap at 0.99 for non-penalties just in case
  return Math.max(0.001, Math.min(0.99, probability));
}

/**
 * Generate data for distance vs xG graph (keeping other vars constant)
 */
export function generateDistanceData(angle, shotType, assistType, playContext) {
  const data = [];
  for (let d = 2; d <= 40; d += 2) {
    data.push({
      distance: d,
      xg: calculateXG(d, angle, shotType, assistType, playContext)
    });
  }
  return data;
}

/**
 * Generate data for angle vs xG graph (keeping other vars constant)
 */
export function generateAngleData(distance, shotType, assistType, playContext) {
  const data = [];
  for (let a = 10; a <= 90; a += 5) {
    data.push({
      angle: a,
      xg: calculateXG(distance, a, shotType, assistType, playContext)
    });
  }
  return data;
}
