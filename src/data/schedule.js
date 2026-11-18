/**
 * Generates a round-robin schedule for an array of teams.
 * Each team plays every other team twice (home and away).
 */
export function generateSchedule(teams) {
  const numTeams = teams.length;
  const schedule = [];
  
  // Clone team array and add a ghost team if odd
  let teamIds = teams.map(t => t.id);
  if (numTeams % 2 !== 0) {
    teamIds.push(null);
  }
  
  const totalRounds = teamIds.length - 1;
  const matchesPerRound = teamIds.length / 2;

  // Generate first half of season
  for (let round = 0; round < totalRounds; round++) {
    const roundMatches = [];
    for (let match = 0; match < matchesPerRound; match++) {
      const home = teamIds[match];
      const away = teamIds[teamIds.length - 1 - match];
      
      if (home !== null && away !== null) {
        // Alternate home/away for the fixed team (index 0)
        if (match === 0 && round % 2 === 1) {
          roundMatches.push({ home: away, away: home });
        } else {
          roundMatches.push({ home, away });
        }
      }
    }
    schedule.push(roundMatches);
    
    // Rotate array (keep first element fixed)
    teamIds.splice(1, 0, teamIds.pop());
  }

  // Generate second half of season (reverse home/away)
  const secondHalf = schedule.map(round => 
    round.map(match => ({ home: match.away, away: match.home }))
  );

  return [...schedule, ...secondHalf];
}
