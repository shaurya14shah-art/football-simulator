import { useState } from 'react';
import { useGame } from '../context/GameContext';
import { POSITION_COLORS } from '../data/players';

export default function ReviewScreen() {
  const { state, dispatch } = useGame();
  const { teams } = state;
  const [expandedTeam, setExpandedTeam] = useState(null);

  return (
    <div className="review-screen container">
      <h2 className="animate-fade-in-up">📋 Squad Review — 20 Teams</h2>
      <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: 32, fontSize: '0.95rem' }}>
        All 500 players have been distributed across 20 squads. Review your teams before starting the 38-match season.
      </p>

      <div className="teams-review-grid stagger-children">
        {teams.map(team => {
          const isExpanded = expandedTeam === team.id;
          const posCount = { GK: 0, DF: 0, MF: 0, FW: 0 };
          team.roster.forEach(p => posCount[p.position]++);
          const avgOvr = team.roster.length > 0
            ? (team.roster.reduce((s, p) => s + p.overall, 0) / team.roster.length).toFixed(1)
            : 0;

          return (
            <div
              key={team.id}
              className={`glass-card team-review-card ${isExpanded ? 'expanded' : ''}`}
              onClick={() => setExpandedTeam(isExpanded ? null : team.id)}
              style={{ cursor: 'pointer' }}
            >
              <div className="team-review-header">
                <span className="team-review-emoji">{team.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div className="team-review-name">
                    {team.name}
                    {team.isCustom && <span style={{ color: 'var(--accent-amber)', marginLeft: 8, fontSize: '0.7rem' }}>⭐ YOUR TEAM</span>}
                  </div>
                  <div className="team-review-budget">
                    Squad: {team.roster.length} • Avg OVR: {avgOvr}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {Object.entries(posCount).map(([pos, count]) => (
                    <span key={pos} style={{ fontSize: '0.65rem', color: POSITION_COLORS[pos], fontWeight: 700 }}>
                      {pos}:{count}
                    </span>
                  ))}
                </div>
              </div>
              {isExpanded && (
                <ul className="team-review-roster animate-fade-in">
                  {team.roster
                    .sort((a, b) => {
                      const order = { GK: 0, DF: 1, MF: 2, FW: 3 };
                      return order[a.position] - order[b.position] || b.overall - a.overall;
                    })
                    .map(player => (
                      <li key={player.id}>
                        <span
                          className="roster-player-pos"
                          style={{ background: POSITION_COLORS[player.position] + '33', color: POSITION_COLORS[player.position] }}
                        >
                          {player.position}
                        </span>
                        <span className="roster-player-name">{player.nationality} {player.name}</span>
                        <span className="roster-player-ovr">{player.overall}</span>
                      </li>
                    ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ textAlign: 'center', marginTop: 24, marginBottom: 40 }}>
        <button
          className="btn btn-primary btn-xl"
          onClick={() => dispatch({ type: 'START_SIMULATION' })}
        >
          🏟️ Start 38-Week Season
        </button>
      </div>
    </div>
  );
}
