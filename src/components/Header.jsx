import { useGame, PHASES } from '../context/GameContext';

export default function Header() {
  const { state } = useGame();

  const phaseLabels = {
    [PHASES.SETUP]: 'Team Setup',
    [PHASES.AUCTION]: 'Player Auction',
    [PHASES.REVIEW]: 'Squad Review',
    [PHASES.SIMULATION]: 'Season Simulation',
    [PHASES.RESULTS]: 'Final Results',
  };

  return (
    <header className="app-header">
      <div className="container header-inner">
        <div className="logo">
          ⚽ FootballSim<span>26</span>
        </div>
        <div className="phase-badge">{phaseLabels[state.phase]}</div>
      </div>
    </header>
  );
}
