import { useGame } from '../context/GameContext';

export default function SetupScreen() {
  const { state, dispatch } = useGame();

  return (
    <div className="setup-screen">
      <div className="setup-card glass-card animate-fade-in-up">
        <span className="emoji-hero">⚽</span>
        <h1>Football Simulator</h1>
        <p className="subtitle">
          Build your dream squad, then simulate a full 38-match league season.<br />
          EAFC 26 × FM26 style — 500 real players, 20 teams, dynamic form.
        </p>

        <div style={{ marginBottom: 12, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          How many custom teams do you want to build?
        </div>

        <div className="team-count-selector">
          {[1, 2, 3, 4, 5].map(n => (
            <button
              key={n}
              className={`team-count-btn ${state.numCustomTeams === n ? 'active' : ''}`}
              onClick={() => dispatch({ type: 'SET_NUM_CUSTOM', payload: n })}
            >
              {n}
            </button>
          ))}
        </div>

        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 32 }}>
          You'll hand-pick squads for {state.numCustomTeams} team{state.numCustomTeams > 1 ? 's' : ''}.
          The remaining {20 - state.numCustomTeams} teams will be auto-drafted by AI.
        </p>

        <button
          className="btn btn-primary btn-xl"
          onClick={() => dispatch({ type: 'START_TEAM_BUILDER' })}
        >
          🏗️ Build Your Team{state.numCustomTeams > 1 ? 's' : ''}
        </button>
      </div>
    </div>
  );
}
