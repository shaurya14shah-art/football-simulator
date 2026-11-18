import { createContext, useContext, useReducer } from 'react';
import { createPlayerDatabase } from '../data/players';
import { createTeams, SQUAD_SIZE } from '../data/teams';
import { generateSchedule, simulateMatch, calculateStandings, updateForms } from '../engine/simulate';

const GameContext = createContext(null);

const PHASES = {
  SETUP: 'SETUP',
  TEAM_BUILDER: 'TEAM_BUILDER',
  REVIEW: 'REVIEW',
  SIMULATION: 'SIMULATION',
  RESULTS: 'RESULTS',
};

const initialState = {
  phase: PHASES.SETUP,
  players: [],
  teams: [],
  numCustomTeams: 1,
  currentBuildTeamIdx: 0, // which custom team is currently being built
  schedule: [],
  currentWeek: 0,
  standings: [],
  topScorers: {},
};

// Auto-draft players to fill AI team rosters evenly
function autoDraftRemaining(players, teams) {
  const unsold = players.filter(p => !p.teamId);
  unsold.sort((a, b) => b.overall - a.overall);

  // Pass 1: Fill positional needs
  unsold.forEach(player => {
    if (player.teamId) return;
    const ideal = { GK: 3, DF: 8, MF: 7, FW: 7 };
    const posCount = (team) => {
      const c = { GK: 0, DF: 0, MF: 0, FW: 0 };
      team.roster.forEach(p => c[p.position]++);
      return c;
    };
    const eligible = teams
      .filter(t => t.roster.length < SQUAD_SIZE)
      .filter(t => posCount(t)[player.position] < ideal[player.position])
      .sort((a, b) => a.roster.length - b.roster.length);
    if (eligible.length > 0) {
      player.teamId = eligible[0].id;
      eligible[0].roster.push(player);
    }
  });

  // Pass 2: Fill remaining slots
  unsold.forEach(player => {
    if (player.teamId) return;
    const eligible = teams
      .filter(t => t.roster.length < SQUAD_SIZE)
      .sort((a, b) => a.roster.length - b.roster.length);
    if (eligible.length > 0) {
      player.teamId = eligible[0].id;
      eligible[0].roster.push(player);
    }
  });
}

function gameReducer(state, action) {
  switch (action.type) {
    case 'SET_NUM_CUSTOM':
      return { ...state, numCustomTeams: action.payload };

    case 'START_TEAM_BUILDER': {
      const players = createPlayerDatabase();
      const teams = createTeams(state.numCustomTeams);
      return {
        ...state,
        phase: PHASES.TEAM_BUILDER,
        players,
        teams,
        currentBuildTeamIdx: 0,
      };
    }

    case 'ADD_PLAYER_TO_TEAM': {
      const { playerId, teamIdx } = action.payload;
      const newPlayers = state.players.map(p =>
        p.id === playerId ? { ...p, teamId: state.teams[teamIdx].id } : p
      );
      const player = newPlayers.find(p => p.id === playerId);
      const newTeams = state.teams.map((t, i) => {
        if (i === teamIdx) return { ...t, roster: [...t.roster, player] };
        return t;
      });
      return { ...state, players: newPlayers, teams: newTeams };
    }

    case 'REMOVE_PLAYER_FROM_TEAM': {
      const { playerId, teamIdx } = action.payload;
      const newPlayers = state.players.map(p =>
        p.id === playerId ? { ...p, teamId: null } : p
      );
      const newTeams = state.teams.map((t, i) => {
        if (i === teamIdx) return { ...t, roster: t.roster.filter(p => p.id !== playerId) };
        return t;
      });
      return { ...state, players: newPlayers, teams: newTeams };
    }

    case 'NEXT_TEAM': {
      const next = state.currentBuildTeamIdx + 1;
      if (next >= state.numCustomTeams) {
        // All custom teams built — auto-draft remaining
        const newPlayers = [...state.players];
        const newTeams = state.teams.map(t => ({ ...t, roster: [...t.roster] }));
        autoDraftRemaining(newPlayers, newTeams);
        return { ...state, players: newPlayers, teams: newTeams, phase: PHASES.REVIEW, currentBuildTeamIdx: next };
      }
      return { ...state, currentBuildTeamIdx: next };
    }

    case 'PREV_TEAM': {
      return { ...state, currentBuildTeamIdx: Math.max(0, state.currentBuildTeamIdx - 1) };
    }

    case 'FINALIZE_TEAMS': {
      const newPlayers = [...state.players];
      const newTeams = state.teams.map(t => ({ ...t, roster: [...t.roster] }));
      autoDraftRemaining(newPlayers, newTeams);
      return { ...state, players: newPlayers, teams: newTeams, phase: PHASES.REVIEW };
    }

    case 'START_SIMULATION': {
      const schedule = generateSchedule(state.teams);
      return {
        ...state,
        phase: PHASES.SIMULATION,
        schedule,
        currentWeek: 0,
        standings: calculateStandings(state.teams, schedule),
        topScorers: {},
      };
    }

    case 'SIMULATE_WEEK': {
      const weekIdx = state.currentWeek;
      if (weekIdx >= state.schedule.length) return state;
      const newSchedule = [...state.schedule];
      const teamsMap = {};
      state.teams.forEach(t => teamsMap[t.id] = t);
      const round = { ...newSchedule[weekIdx], matches: [] };
      newSchedule[weekIdx].matches.forEach(match => {
        round.matches.push(simulateMatch(teamsMap[match.homeTeamId], teamsMap[match.awayTeamId]));
      });
      newSchedule[weekIdx] = round;
      const newTopScorers = { ...state.topScorers };
      round.matches.forEach(m => {
        [...m.homeScorers, ...m.awayScorers].forEach(s => {
          newTopScorers[s.player] = (newTopScorers[s.player] || 0) + 1;
        });
      });
      const newTeams = state.teams.map(t => ({ ...t, roster: t.roster.map(p => ({ ...p })) }));
      updateForms(newTeams);
      const newStandings = calculateStandings(newTeams, newSchedule);
      const isLast = weekIdx >= newSchedule.length - 1;
      return { ...state, schedule: newSchedule, currentWeek: weekIdx + 1, standings: newStandings, teams: newTeams, topScorers: newTopScorers, phase: isLast ? PHASES.RESULTS : PHASES.SIMULATION };
    }

    case 'SIMULATE_ALL': {
      const teamsMap = {};
      let newTeams = state.teams.map(t => ({ ...t, roster: t.roster.map(p => ({ ...p })) }));
      newTeams.forEach(t => teamsMap[t.id] = t);
      const newSchedule = [...state.schedule];
      const newTopScorers = { ...state.topScorers };
      for (let w = state.currentWeek; w < newSchedule.length; w++) {
        const round = { ...newSchedule[w], matches: [] };
        newSchedule[w].matches.forEach(m => {
          round.matches.push(simulateMatch(teamsMap[m.homeTeamId], teamsMap[m.awayTeamId]));
        });
        newSchedule[w] = round;
        round.matches.forEach(m => {
          [...m.homeScorers, ...m.awayScorers].forEach(s => {
            newTopScorers[s.player] = (newTopScorers[s.player] || 0) + 1;
          });
        });
        updateForms(newTeams);
      }
      return { ...state, schedule: newSchedule, currentWeek: newSchedule.length, standings: calculateStandings(newTeams, newSchedule), teams: newTeams, topScorers: newTopScorers, phase: PHASES.RESULTS };
    }

    case 'SIMULATE_5_WEEKS': {
      const teamsMap = {};
      let newTeams = state.teams.map(t => ({ ...t, roster: t.roster.map(p => ({ ...p })) }));
      newTeams.forEach(t => teamsMap[t.id] = t);
      const newSchedule = [...state.schedule];
      const newTopScorers = { ...state.topScorers };
      const end = Math.min(state.currentWeek + 5, newSchedule.length);
      for (let w = state.currentWeek; w < end; w++) {
        const round = { ...newSchedule[w], matches: [] };
        newSchedule[w].matches.forEach(m => {
          round.matches.push(simulateMatch(teamsMap[m.homeTeamId], teamsMap[m.awayTeamId]));
        });
        newSchedule[w] = round;
        round.matches.forEach(m => {
          [...m.homeScorers, ...m.awayScorers].forEach(s => {
            newTopScorers[s.player] = (newTopScorers[s.player] || 0) + 1;
          });
        });
        updateForms(newTeams);
      }
      const isLast = end >= newSchedule.length;
      return { ...state, schedule: newSchedule, currentWeek: end, standings: calculateStandings(newTeams, newSchedule), teams: newTeams, topScorers: newTopScorers, phase: isLast ? PHASES.RESULTS : PHASES.SIMULATION };
    }

    case 'RESTART':
      return { ...initialState };

    default:
      return state;
  }
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}

export { PHASES };
