import { useState, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { POSITIONS, POSITION_COLORS, STAT_KEYS, POSITION_LABELS } from '../data/players';
import { SQUAD_SIZE } from '../data/teams';

export default function TeamBuilder() {
  const { state, dispatch } = useGame();
  const { teams, players, currentBuildTeamIdx } = state;
  const team = teams[currentBuildTeamIdx];
  const [filterPos, setFilterPos] = useState('ALL');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('overall');
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const available = useMemo(() => {
    let list = players.filter(p => !p.teamId);
    if (filterPos !== 'ALL') list = list.filter(p => p.position === filterPos);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.club.toLowerCase().includes(q) || p.nationality.includes(q));
    }
    list.sort((a, b) => (b[sortBy] || b.overall) - (a[sortBy] || a.overall));
    return list;
  }, [players, filterPos, search, sortBy]);

  const posCount = { GK: 0, DF: 0, MF: 0, FW: 0 };
  team.roster.forEach(p => posCount[p.position]++);

  const statColor = (v) => v >= 85 ? 'high' : v >= 75 ? 'mid' : 'low';

  const addPlayer = (player) => {
    if (team.roster.length >= SQUAD_SIZE) return;
    dispatch({ type: 'ADD_PLAYER_TO_TEAM', payload: { playerId: player.id, teamIdx: currentBuildTeamIdx } });
    setSelectedPlayer(null);
  };

  const removePlayer = (player) => {
    dispatch({ type: 'REMOVE_PLAYER_FROM_TEAM', payload: { playerId: player.id, teamIdx: currentBuildTeamIdx } });
  };

  return (
    <div className="team-builder container">
      {/* Header */}
      <div className="tb-header animate-fade-in">
        <div className="tb-header-left">
          <span className="tb-team-emoji">{team.emoji}</span>
          <div>
            <h2 className="tb-team-name">{team.name}</h2>
            <div className="tb-team-meta">
              Team {currentBuildTeamIdx + 1} of {state.numCustomTeams} &nbsp;•&nbsp;
              Squad: <strong>{team.roster.length}</strong>/{SQUAD_SIZE}
            </div>
          </div>
        </div>
        <div className="tb-pos-summary">
          {POSITIONS.map(pos => (
            <div key={pos} className="tb-pos-chip" style={{ borderColor: POSITION_COLORS[pos] + '80' }}>
              <span style={{ color: POSITION_COLORS[pos] }}>{pos}</span>
              <span className="tb-pos-count">{posCount[pos]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="tb-layout">
        {/* Left: Player Pool */}
        <div className="tb-pool">
          <div className="tb-filters">
            <div className="tb-search-wrap">
              <input
                type="text"
                className="tb-search"
                placeholder="Search players..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="tb-filter-row">
              <div className="tb-pos-filters">
                {['ALL', ...POSITIONS].map(pos => (
                  <button
                    key={pos}
                    className={`tb-filter-btn ${filterPos === pos ? 'active' : ''}`}
                    onClick={() => setFilterPos(pos)}
                    style={filterPos === pos && pos !== 'ALL' ? { background: POSITION_COLORS[pos] + '25', borderColor: POSITION_COLORS[pos] } : {}}
                  >
                    {pos === 'ALL' ? '🌐 All' : pos}
                  </button>
                ))}
              </div>
              <select className="tb-sort" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="overall">Overall</option>
                {STAT_KEYS.map(k => <option key={k} value={k}>{k.charAt(0).toUpperCase() + k.slice(1)}</option>)}
              </select>
            </div>
          </div>

          <div className="tb-player-list">
            {available.slice(0, 80).map(player => (
              <div
                key={player.id}
                className={`tb-player-row ${selectedPlayer?.id === player.id ? 'selected' : ''}`}
                onClick={() => setSelectedPlayer(player)}
              >
                <div className="tb-player-pos-badge" style={{ background: POSITION_COLORS[player.position] + '25', color: POSITION_COLORS[player.position] }}>
                  {player.position}
                </div>
                <div className="tb-player-info">
                  <div className="tb-player-name">{player.nationality} {player.name}</div>
                  <div className="tb-player-club">{player.club}</div>
                </div>
                <div className="tb-player-ovr">{player.overall}</div>
                <button
                  className="tb-add-btn"
                  onClick={(e) => { e.stopPropagation(); addPlayer(player); }}
                  disabled={team.roster.length >= SQUAD_SIZE}
                  title="Add to squad"
                >
                  +
                </button>
              </div>
            ))}
            {available.length > 80 && (
              <div className="tb-more">Showing top 80 of {available.length} — use search to find more</div>
            )}
          </div>
        </div>

        {/* Right: Current Squad + Selected Player */}
        <div className="tb-right">
          {/* Selected Player Detail */}
          {selectedPlayer && (
            <div className="tb-player-detail glass-card animate-fade-in">
              <div className="tb-detail-header">
                <div className="tb-detail-pos" style={{ background: POSITION_COLORS[selectedPlayer.position] + '25', color: POSITION_COLORS[selectedPlayer.position] }}>
                  {selectedPlayer.position}
                </div>
                <div className="tb-detail-ovr">{selectedPlayer.overall}</div>
              </div>
              <div className="tb-detail-name">{selectedPlayer.name}</div>
              <div className="tb-detail-info">{selectedPlayer.nationality} • {selectedPlayer.club}</div>
              <div className="tb-detail-stats">
                {STAT_KEYS.map(k => (
                  <div key={k} className="tb-detail-stat">
                    <div className="tb-stat-bar-wrap">
                      <div className="tb-stat-bar" style={{ width: `${selectedPlayer[k]}%`, background: selectedPlayer[k] >= 85 ? '#10b981' : selectedPlayer[k] >= 75 ? '#f59e0b' : '#ef4444' }}></div>
                    </div>
                    <span className="tb-stat-label">{k.slice(0, 3).toUpperCase()}</span>
                    <span className={`tb-stat-val ${statColor(selectedPlayer[k])}`}>{selectedPlayer[k]}</span>
                  </div>
                ))}
              </div>
              <button className="btn btn-success btn-sm" style={{ width: '100%', marginTop: 8 }} onClick={() => addPlayer(selectedPlayer)} disabled={team.roster.length >= SQUAD_SIZE}>
                ➕ Add to {team.name}
              </button>
            </div>
          )}

          {/* Squad Roster */}
          <div className="tb-squad glass-card">
            <h3 className="tb-squad-title">📋 Your Squad ({team.roster.length}/{SQUAD_SIZE})</h3>
            {team.roster.length === 0 ? (
              <div className="tb-squad-empty">Select players from the list to build your squad</div>
            ) : (
              <div className="tb-squad-list">
                {['GK', 'DF', 'MF', 'FW'].map(pos => {
                  const posPlayers = team.roster.filter(p => p.position === pos).sort((a, b) => b.overall - a.overall);
                  if (posPlayers.length === 0) return null;
                  return (
                    <div key={pos}>
                      <div className="tb-squad-pos-header" style={{ color: POSITION_COLORS[pos] }}>{POSITION_LABELS[pos]}s ({posPlayers.length})</div>
                      {posPlayers.map(p => (
                        <div key={p.id} className="tb-squad-player">
                          <span className="tb-squad-player-name">{p.nationality} {p.name}</span>
                          <span className="tb-squad-player-ovr">{p.overall}</span>
                          <button className="tb-remove-btn" onClick={() => removePlayer(p)} title="Remove">×</button>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="tb-nav">
            {currentBuildTeamIdx > 0 && (
              <button className="btn btn-ghost" onClick={() => dispatch({ type: 'PREV_TEAM' })}>← Previous Team</button>
            )}
            <button
              className="btn btn-primary btn-lg"
              onClick={() => dispatch({ type: 'NEXT_TEAM' })}
            >
              {currentBuildTeamIdx < state.numCustomTeams - 1 ? `Next Team →` : '🏟️ Finalize & Start'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
