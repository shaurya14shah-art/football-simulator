import React, { useState, useEffect } from 'react';
import { TEAMS } from '../data/teams';
import { generateSchedule, simulateMatch, calculateStandings } from '../engine/simulate';

// Override calculateTeamRatings to use our basic atk/def instead of roster if roster is missing
import * as simEngine from '../engine/simulate';
const originalSim = simEngine.simulateMatch;

// Monkey patch simulateMatch to use our simple atk/def if roster doesn't exist
const customSimulateMatch = (homeTeam, awayTeam) => {
  // Simple poisson simulation using just atk and def
  const poissonGoals = (lambda) => {
    const L = Math.exp(-lambda);
    let k = 0, p = 1;
    do { k++; p *= Math.random(); } while (p > L);
    return k - 1;
  };
  
  const homeAdv = 0.3;
  const homeXG = Math.max(0.2, (homeTeam.atk / awayTeam.def) * 1.5 + homeAdv);
  const awayXG = Math.max(0.2, (awayTeam.atk / homeTeam.def) * 1.5 - homeAdv);
  
  const homeGoals = poissonGoals(homeXG);
  const awayGoals = poissonGoals(awayXG);
  
  return {
    homeTeamId: homeTeam.id,
    awayTeamId: awayTeam.id,
    homeGoals,
    awayGoals,
    homeScorers: [],
    awayScorers: [],
    possession: { home: 50, away: 50 },
    shotsOnTarget: { home: homeGoals, away: awayGoals },
    played: true,
  };
};

export default function SeasonView() {
  const [schedule, setSchedule] = useState([]);
  const [standings, setStandings] = useState([]);
  const [currentWeek, setCurrentWeek] = useState(0);

  useEffect(() => {
    const initialSchedule = generateSchedule(TEAMS);
    setSchedule(initialSchedule);
    setStandings(calculateStandings(TEAMS, initialSchedule));
  }, []);

  const simulateWeek = () => {
    if (currentWeek >= schedule.length) return;
    
    const newSchedule = [...schedule];
    const week = newSchedule[currentWeek];
    
    week.matches = week.matches.map(match => {
      const homeTeam = TEAMS.find(t => t.id === match.homeTeamId);
      const awayTeam = TEAMS.find(t => t.id === match.awayTeamId);
      return customSimulateMatch(homeTeam, awayTeam);
    });
    
    setSchedule(newSchedule);
    setCurrentWeek(currentWeek + 1);
    setStandings(calculateStandings(TEAMS, newSchedule));
  };

  const simulateRest = () => {
    const newSchedule = [...schedule];
    for (let i = currentWeek; i < newSchedule.length; i++) {
      newSchedule[i].matches = newSchedule[i].matches.map(match => {
        const homeTeam = TEAMS.find(t => t.id === match.homeTeamId);
        const awayTeam = TEAMS.find(t => t.id === match.awayTeamId);
        return customSimulateMatch(homeTeam, awayTeam);
      });
    }
    setSchedule(newSchedule);
    setCurrentWeek(newSchedule.length);
    setStandings(calculateStandings(TEAMS, newSchedule));
  };

  return (
    <div style={{ padding: '20px', color: 'white', fontFamily: 'sans-serif' }}>
      <h1>Football Season Simulator</h1>
      <div style={{ marginBottom: '20px' }}>
        <button onClick={simulateWeek} disabled={currentWeek >= schedule.length} style={btnStyle}>
          Simulate Week {currentWeek + 1}
        </button>
        <button onClick={simulateRest} disabled={currentWeek >= schedule.length} style={{...btnStyle, marginLeft: '10px'}}>
          Simulate Full Season
        </button>
        <span style={{ marginLeft: '20px' }}>
          Progress: {currentWeek} / {schedule.length} Weeks
        </span>
      </div>

      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ flex: 2 }}>
          <h2>League Table</h2>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th>Pos</th>
                <th>Team</th>
                <th>P</th>
                <th>W</th>
                <th>D</th>
                <th>L</th>
                <th>GF</th>
                <th>GA</th>
                <th>GD</th>
                <th>Pts</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((team, idx) => (
                <tr key={team.teamId} style={{ backgroundColor: idx % 2 === 0 ? '#333' : '#222' }}>
                  <td>{idx + 1}</td>
                  <td style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '15px', height: '15px', backgroundColor: team.color }}></div>
                    {team.name}
                  </td>
                  <td>{team.played}</td>
                  <td>{team.won}</td>
                  <td>{team.drawn}</td>
                  <td>{team.lost}</td>
                  <td>{team.goalsFor}</td>
                  <td>{team.goalsAgainst}</td>
                  <td>{team.goalDifference}</td>
                  <td><strong>{team.points}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ flex: 1 }}>
          <h2>Latest Results</h2>
          {currentWeek > 0 && schedule[currentWeek - 1] ? (
            <div style={{ backgroundColor: '#2a2a2a', padding: '15px', borderRadius: '8px' }}>
              <h3>Week {currentWeek}</h3>
              {schedule[currentWeek - 1].matches.map((m, i) => {
                const home = TEAMS.find(t => t.id === m.homeTeamId);
                const away = TEAMS.find(t => t.id === m.awayTeamId);
                return (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #444' }}>
                    <span>{home?.name}</span>
                    <strong>{m.homeGoals} - {m.awayGoals}</strong>
                    <span>{away?.name}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p>No matches played yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

const btnStyle = {
  padding: '10px 20px',
  backgroundColor: '#007bff',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '16px'
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  textAlign: 'center'
};
