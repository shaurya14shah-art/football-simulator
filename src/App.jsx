import { GameProvider, useGame, PHASES } from './context/GameContext';
import SetupScreen from './components/SetupScreen';
import TeamBuilder from './components/TeamBuilder';
import ReviewScreen from './components/ReviewScreen';
import SimulationScreen from './components/SimulationScreen';
import ResultsScreen from './components/ResultsScreen';
import XGCalculator from './components/XGCalculator';
import SeasonView from './components/SeasonView';
import { useState } from 'react';

function GameRouter() {
  const { state } = useGame();
  switch (state.phase) {
    case PHASES.SETUP: return <SetupScreen />;
    case PHASES.TEAM_BUILDER: return <TeamBuilder />;
    case PHASES.REVIEW: return <ReviewScreen />;
    case PHASES.SIMULATION: return <SimulationScreen />;
    case PHASES.RESULTS: return <ResultsScreen />;
    default: return <SetupScreen />;
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState('simulator');

  return (
    <GameProvider>
      <div className="app-shell">
        <header className="top-bar">
          <div className="logo">⚽ <span>FootballSim</span></div>
          <div className="nav-tabs">
            <button 
              className={`tab-btn ${activeTab === 'simulator' ? 'active' : ''}`}
              onClick={() => setActiveTab('simulator')}
            >
              Match Simulator
            </button>
            <button 
              className={`tab-btn ${activeTab === 'xg' ? 'active' : ''}`}
              onClick={() => setActiveTab('xg')}
            >
              xG Calculator
            </button>
            <button 
              className={`tab-btn ${activeTab === 'season' ? 'active' : ''}`}
              onClick={() => setActiveTab('season')}
            >
              Season Simulator
            </button>
          </div>
          <div className="badge">SEASON 26/27</div>
        </header>
        <main>
          {activeTab === 'simulator' ? <GameRouter /> : activeTab === 'xg' ? <XGCalculator /> : <SeasonView />}
        </main>
      </div>
    </GameProvider>
  );
}
