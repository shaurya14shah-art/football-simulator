// Match Simulation Engine — Realistic 38-week season
// Tuned for ~2.65 goals/match average (PL style)

export const calculateTeamRatings = (roster) => {
  if (!roster || roster.length === 0) return { attack: 50, midfield: 50, defense: 50 };
  const fw = roster.filter(p => p.position === 'FW');
  const mf = roster.filter(p => p.position === 'MF');
  const df = roster.filter(p => p.position === 'DF');
  const gk = roster.filter(p => p.position === 'GK');

  const avg = (arr, key) => arr.length ? arr.reduce((s, p) => s + (p[key] * (p.form || 1)), 0) / arr.length : 50;

  // Use best 11: top 3 FW, 3 MF, 4 DF, 1 GK by overall
  const best = (arr, n) => [...arr].sort((a, b) => b.overall - a.overall).slice(0, n);
  const bFW = best(fw, 3);
  const bMF = best(mf, 3);
  const bDF = best(df, 4);
  const bGK = best(gk, 1);

  return {
    attack: avg(bFW, 'shooting') * 0.35 + avg(bFW, 'pace') * 0.2 + avg(bFW, 'dribbling') * 0.2 + avg(bMF, 'passing') * 0.25,
    midfield: avg(bMF, 'passing') * 0.3 + avg(bMF, 'dribbling') * 0.2 + avg(bMF, 'defending') * 0.2 + avg(bMF, 'physical') * 0.15 + avg(bMF, 'shooting') * 0.15,
    defense: avg(bDF, 'defending') * 0.4 + avg(bDF, 'physical') * 0.2 + avg(bDF, 'pace') * 0.15 + avg(bGK, 'defending') * 0.25,
  };
};

const poissonGoals = (lambda) => {
  const L = Math.exp(-lambda);
  let k = 0, p = 1;
  do { k++; p *= Math.random(); } while (p > L);
  return k - 1;
};

export const simulateMatch = (homeTeam, awayTeam) => {
  const hr = calculateTeamRatings(homeTeam.roster);
  const ar = calculateTeamRatings(awayTeam.roster);

  // Realistic xG — tuned to ~1.45 home, ~1.15 away baseline (PL averages)
  const homeAdv = 4.0;
  const atkVsDef_home = (hr.attack - ar.defense + homeAdv) / 45;
  const atkVsDef_away = (ar.attack - hr.defense) / 45;
  const midEdge = (hr.midfield - ar.midfield) / 80;

  let homeXG = Math.max(0.25, 1.42 + atkVsDef_home + midEdge * 0.5);
  let awayXG = Math.max(0.20, 1.12 + atkVsDef_away - midEdge * 0.3);

  // Cap to prevent unrealistic scorelines
  homeXG = Math.min(homeXG, 3.2);
  awayXG = Math.min(awayXG, 2.8);

  const homeGoals = poissonGoals(homeXG);
  const awayGoals = poissonGoals(awayXG);

  // Goal scorers
  const pickScorers = (team, goals) => {
    const attackers = team.roster.filter(p => p.position === 'FW' || p.position === 'MF');
    if (attackers.length === 0) return [];
    const scorers = [];
    for (let i = 0; i < goals; i++) {
      const weights = attackers.map(p => (p.shooting || 70) * (p.form || 1));
      const total = weights.reduce((a, b) => a + b, 0);
      let r = Math.random() * total, idx = 0;
      for (let j = 0; j < weights.length; j++) { r -= weights[j]; if (r <= 0) { idx = j; break; } }
      scorers.push({ player: attackers[idx].name, minute: Math.floor(Math.random() * 90) + 1 });
    }
    return scorers.sort((a, b) => a.minute - b.minute);
  };

  // Possession
  const totalMid = hr.midfield + ar.midfield + homeAdv;
  const homePoss = Math.round(((hr.midfield + homeAdv * 0.5) / totalMid) * 100);

  return {
    homeTeamId: homeTeam.id,
    awayTeamId: awayTeam.id,
    homeGoals,
    awayGoals,
    homeScorers: pickScorers(homeTeam, homeGoals),
    awayScorers: pickScorers(awayTeam, awayGoals),
    possession: { home: homePoss, away: 100 - homePoss },
    shotsOnTarget: { home: homeGoals + Math.floor(Math.random() * 4) + 1, away: awayGoals + Math.floor(Math.random() * 4) + 1 },
    played: true,
  };
};

// Round-robin schedule for N teams (produces N-1 rounds × 2 = 2*(N-1) total matchdays)
export const generateSchedule = (teams) => {
  const ids = teams.map(t => t.id);
  const n = ids.length;
  if (n % 2 !== 0) ids.push(null);
  const numRounds = ids.length - 1;
  const half = ids.length / 2;
  const rounds = [];
  const work = [...ids];

  for (let round = 0; round < numRounds; round++) {
    const matches = [];
    for (let i = 0; i < half; i++) {
      const home = work[i];
      const away = work[work.length - 1 - i];
      if (home !== null && away !== null) {
        matches.push({ homeTeamId: home, awayTeamId: away, homeGoals: 0, awayGoals: 0, homeScorers: [], awayScorers: [], possession: { home: 50, away: 50 }, shotsOnTarget: { home: 0, away: 0 }, played: false });
      }
    }
    rounds.push({ week: round + 1, matches });
    work.splice(1, 0, work.pop());
  }

  // Reverse fixtures
  const reverse = rounds.map((r, i) => ({
    week: numRounds + i + 1,
    matches: r.matches.map(m => ({ ...m, homeTeamId: m.awayTeamId, awayTeamId: m.homeTeamId })),
  }));

  return [...rounds, ...reverse];
};

// League standings
export const calculateStandings = (teams, schedule) => {
  const s = {};
  teams.forEach(t => {
    s[t.id] = { teamId: t.id, name: t.name, color: t.color, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0, form: [] };
  });
  schedule.forEach(round => {
    round.matches.forEach(m => {
      if (!m.played) return;
      const h = s[m.homeTeamId], a = s[m.awayTeamId];
      if (!h || !a) return;
      h.played++; a.played++;
      h.goalsFor += m.homeGoals; h.goalsAgainst += m.awayGoals;
      a.goalsFor += m.awayGoals; a.goalsAgainst += m.homeGoals;
      if (m.homeGoals > m.awayGoals) { h.won++; h.points += 3; a.lost++; h.form.push('W'); a.form.push('L'); }
      else if (m.homeGoals < m.awayGoals) { a.won++; a.points += 3; h.lost++; a.form.push('W'); h.form.push('L'); }
      else { h.drawn++; a.drawn++; h.points++; a.points++; h.form.push('D'); a.form.push('D'); }
      h.goalDifference = h.goalsFor - h.goalsAgainst;
      a.goalDifference = a.goalsFor - a.goalsAgainst;
    });
  });
  return Object.values(s).sort((a, b) => b.points !== a.points ? b.points - a.points : b.goalDifference !== a.goalDifference ? b.goalDifference - a.goalDifference : b.goalsFor - a.goalsFor);
};

// Update player form after each week — slight random fluctuation
export const updateForms = (teams) => {
  teams.forEach(team => {
    team.roster.forEach(player => {
      const delta = (Math.random() - 0.5) * 0.08;
      player.form = Math.max(0.78, Math.min(1.22, (player.form || 1) + delta));
      player.form = +player.form.toFixed(2);
    });
  });
};
