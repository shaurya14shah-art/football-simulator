import { useGame } from '../context/GameContext';

export default function SimulationScreen() {
  const { state, dispatch } = useGame();
  const { schedule, currentWeek, standings, teams } = state;

  const teamsMap = {};
  teams.forEach(t => teamsMap[t.id] = t);

  const lastPlayedWeek = currentWeek > 0 ? currentWeek - 1 : null;
  const lastRound = lastPlayedWeek !== null ? schedule[lastPlayedWeek] : null;
  const totalWeeks = schedule.length;

  return (
    <div className="simulation-screen container">
      <div className="sim-controls animate-fade-in">
        <button className="btn btn-primary" onClick={() => dispatch({ type: 'SIMULATE_WEEK' })} disabled={currentWeek >= totalWeeks}>
          ▶️ Next Week
        </button>
        <button className="btn btn-ghost" onClick={() => dispatch({ type: 'SIMULATE_5_WEEKS' })} disabled={currentWeek >= totalWeeks}>
          ⏩ +5 Weeks
        </button>
        <div className="week-indicator">
          Week <span className="week-num">{currentWeek}</span> / {totalWeeks}
        </div>
        <button className="btn btn-danger btn-sm" onClick={() => dispatch({ type: 'SIMULATE_ALL' })} disabled={currentWeek >= totalWeeks}>
          ⏭️ Sim All
        </button>
      </div>

      <div className="sim-layout">
        <div className="glass-card animate-fade-in-up" style={{ padding: 20, overflow: 'auto' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: 16 }}>
            📊 League Standings
          </h3>
          <table className="league-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Team</th>
                <th>P</th>
                <th>W</th>
                <th>D</th>
                <th>L</th>
                <th>GF</th>
                <th>GA</th>
                <th>GD</th>
                <th>Pts</th>
                <th>Form</th>
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
                        {team?.isCustom && <span style={{ fontSize: '0.55rem', color: 'var(--accent-amber)', fontWeight: 800 }}>⭐</span>}
                      </div>
                    </td>
                    <td>{row.played}</td>
                    <td>{row.won}</td>
                    <td>{row.drawn}</td>
                    <td>{row.lost}</td>
                    <td>{row.goalsFor}</td>
                    <td>{row.goalsAgainst}</td>
                    <td className={row.goalDifference >= 0 ? 'gd-positive' : 'gd-negative'}>
                      {row.goalDifference > 0 ? '+' : ''}{row.goalDifference}
                    </td>
                    <td className="points-cell">{row.points}</td>
                    <td>
                      <div className="form-badges">
                        {row.form.slice(-5).map((f, i) => (
                          <span key={i} className={`form-badge ${f}`}>{f}</span>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="match-results-panel">
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: 12, color: 'var(--text-secondary)' }}>
            {lastRound ? `📅 Matchday ${lastPlayedWeek + 1} Results` : '📅 Matches'}
          </h3>
          {lastRound ? (
            <div className="match-results-scroll">
              {lastRound.matches.map((match, idx) => {
                const home = teamsMap[match.homeTeamId];
                const away = teamsMap[match.awayTeamId];
                return (
                  <div key={idx} className="match-result-card">
                    <div className="match-result-row">
                      <div className="match-team">
                        <span>{home?.emoji}</span>
                        <span>{home?.name}</span>
                      </div>
                      <div className="match-score">
                        <span>{match.homeGoals}</span>
                        <span className="separator">-</span>
                        <span>{match.awayGoals}</span>
                      </div>
                      <div className="match-team away">
                        <span>{away?.name}</span>
                        <span>{away?.emoji}</span>
                      </div>
                    </div>
                    {(match.homeScorers.length > 0 || match.awayScorers.length > 0) && (
                      <div className="match-scorers">
                        <div>
                          {match.homeScorers.map((s, i) => (
                            <div key={i} className="scorer">{s.player} {s.minute}'</div>
                          ))}
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          {match.awayScorers.map((s, i) => (
                            <div key={i} className="scorer">{s.player} {s.minute}'</div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="glass-card" style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>
              Click "Next Week" to begin the season
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
