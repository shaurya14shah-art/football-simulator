import { useGame } from '../context/GameContext';

export default function ResultsScreen() {
  const { state, dispatch } = useGame();
  const { standings, teams, topScorers } = state;

  const teamsMap = {};
  teams.forEach(t => teamsMap[t.id] = t);

  const champion = standings[0];
  const championTeam = teamsMap[champion?.teamId];

  const scorersList = Object.entries(topScorers)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 20);

  // Season stats
  const totalGoals = standings.reduce((s, r) => s + r.goalsFor, 0) / 2;
  const totalMatches = standings.reduce((s, r) => s + r.played, 0) / 2;
  const goalsPerMatch = totalMatches > 0 ? (totalGoals / totalMatches).toFixed(2) : 0;

  return (
    <div className="results-screen container">
      {/* Champion */}
      <div className="results-champion glass-card animate-bounce-in">
        <span className="champion-trophy">🏆</span>
        <div className="champion-label">League Champions</div>
        <div className="champion-name">{championTeam?.emoji} {champion?.name}</div>
        <div className="champion-stats">
          <div className="champion-stat">
            <div className="champion-stat-value">{champion?.points}</div>
            <div className="champion-stat-label">Points</div>
          </div>
          <div className="champion-stat">
            <div className="champion-stat-value">{champion?.won}</div>
            <div className="champion-stat-label">Wins</div>
          </div>
          <div className="champion-stat">
            <div className="champion-stat-value">{champion?.goalsFor}</div>
            <div className="champion-stat-label">Goals Scored</div>
          </div>
          <div className="champion-stat">
            <div className="champion-stat-value">{champion?.goalDifference > 0 ? '+' : ''}{champion?.goalDifference}</div>
            <div className="champion-stat-label">GD</div>
          </div>
          <div className="champion-stat">
            <div className="champion-stat-value">{goalsPerMatch}</div>
            <div className="champion-stat-label">Goals/Match</div>
          </div>
        </div>
      </div>

      {/* Final Table */}
      <div className="glass-card animate-fade-in-up" style={{ padding: 24, marginBottom: 32, overflow: 'auto' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', marginBottom: 16 }}>📊 Final Standings</h3>
        <table className="league-table">
          <thead>
            <tr>
              <th>#</th><th>Team</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GF</th><th>GA</th><th>GD</th><th>Pts</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((row, idx) => {
              const team = teamsMap[row.teamId];
              return (
                <tr key={row.teamId} className={team?.isCustom ? 'custom-team-row' : ''}>
                  <td>
                    <span className={`rank ${idx === 0 ? 'rank-1' : idx === 1 ? 'rank-2' : idx === 2 ? 'rank-3' : idx >= 17 ? 'rank-rel' : ''}`}>
                      {idx + 1}
                    </span>
                  </td>
                  <td>
                    <div className="team-cell">
                      <span className="team-dot" style={{ background: team?.color }}></span>
                      <span>{team?.emoji}</span>
                      <span>{row.name}</span>
                      {team?.isCustom && <span style={{ fontSize: '0.55rem', color: 'var(--accent-amber)' }}>⭐</span>}
                    </div>
                  </td>
                  <td>{row.played}</td><td>{row.won}</td><td>{row.drawn}</td><td>{row.lost}</td>
                  <td>{row.goalsFor}</td><td>{row.goalsAgainst}</td>
                  <td className={row.goalDifference >= 0 ? 'gd-positive' : 'gd-negative'}>
                    {row.goalDifference > 0 ? '+' : ''}{row.goalDifference}
                  </td>
                  <td className="points-cell">{row.points}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Top Scorers */}
      {scorersList.length > 0 && (
        <div className="top-scorers glass-card animate-fade-in-up">
          <h3>⚽ Golden Boot — Top Scorers</h3>
          <ul className="top-scorers-list">
            {scorersList.map(([name, goals], idx) => (
              <li key={name}>
                <span className="scorer-rank">{idx + 1}.</span>
                <span className="scorer-name">{name}</span>
                <span className="scorer-goals">{goals} goals</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: 32, marginBottom: 48 }}>
        <button className="btn btn-primary btn-xl" onClick={() => dispatch({ type: 'RESTART' })}>
          🔄 New Season
        </button>
      </div>
    </div>
  );
}
