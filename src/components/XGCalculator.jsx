import React, { useState, useMemo } from 'react';
import { 
  calculateXG, generateDistanceData, generateAngleData, 
  SHOT_TYPES, ASSIST_TYPES, PLAY_CONTEXT 
} from '../engine/xgModel';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';

export default function XGCalculator() {
  const [distance, setDistance] = useState(12);
  const [angle, setAngle] = useState(45);
  const [shotType, setShotType] = useState('foot');
  const [assistType, setAssistType] = useState('none');
  const [playContext, setPlayContext] = useState('open_play');

  // Calculate current xG
  const currentXG = calculateXG(distance, angle, shotType, assistType, playContext);
  
  // Generate graph data
  const distanceData = useMemo(() => generateDistanceData(angle, shotType, assistType, playContext), 
    [angle, shotType, assistType, playContext]);
    
  const angleData = useMemo(() => generateAngleData(distance, shotType, assistType, playContext), 
    [distance, shotType, assistType, playContext]);

  // Color mapping based on xG value
  const getXGColor = (val) => {
    if (val < 0.1) return '#ef4444'; // Red
    if (val < 0.3) return '#f97316'; // Orange
    if (val < 0.5) return '#eab308'; // Yellow
    if (val < 0.7) return '#84cc16'; // Light Green
    return '#22c55e'; // Green
  };

  const xgColor = getXGColor(currentXG);

  return (
    <div className="xg-calculator">
      <div className="xg-header">
        <h2>xG Analytics Engine</h2>
        <p>Tweak the variables below to see how they impact Expected Goals (xG)</p>
      </div>

      <div className="xg-grid">
        {/* Left Column: Controls */}
        <div className="xg-controls-panel glass-panel">
          <h3>Shot Variables</h3>
          
          <div className="control-group">
            <label>
              Distance to Goal: <span>{distance}m</span>
            </label>
            <input 
              type="range" min="2" max="40" value={distance} 
              onChange={(e) => setDistance(Number(e.target.value))} 
            />
          </div>

          <div className="control-group">
            <label>
              Visible Angle: <span>{angle}°</span>
            </label>
            <input 
              type="range" min="10" max="90" value={angle} 
              onChange={(e) => setAngle(Number(e.target.value))} 
            />
          </div>

          <div className="control-group">
            <label>Shot Type</label>
            <select value={shotType} onChange={(e) => setShotType(e.target.value)}>
              {Object.values(SHOT_TYPES).map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="control-group">
            <label>Assist Type</label>
            <select value={assistType} onChange={(e) => setAssistType(e.target.value)}>
              {Object.values(ASSIST_TYPES).map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="control-group">
            <label>Play Context</label>
            <select value={playContext} onChange={(e) => setPlayContext(e.target.value)}>
              {Object.values(PLAY_CONTEXT).map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Middle Column: Current xG Display */}
        <div className="xg-display-panel glass-panel">
          <h3>Calculated xG</h3>
          <div className="xg-gauge-container">
            <svg viewBox="0 0 100 100" className="xg-circular-gauge">
              <circle className="xg-gauge-bg" cx="50" cy="50" r="45" />
              <circle 
                className="xg-gauge-fill" 
                cx="50" cy="50" r="45" 
                stroke={xgColor}
                strokeDasharray={`${currentXG * 283} 283`}
              />
            </svg>
            <div className="xg-value">
              <span style={{ color: xgColor }}>{currentXG.toFixed(2)}</span>
              <small>Expected Goals</small>
            </div>
          </div>
          <div className="xg-insights">
            {currentXG > 0.5 ? "🔥 High quality chance" : currentXG > 0.15 ? "📊 Average chance" : "🧱 Low probability shot"}
          </div>
        </div>

        {/* Right Column: Graphs */}
        <div className="xg-graphs-panel glass-panel">
          <h3>Correlation Graphs</h3>
          
          <div className="chart-container">
            <h4>xG vs Distance (holding Angle at {angle}°)</h4>
            <ResponsiveContainer width="100%" height={150}>
              <AreaChart data={distanceData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDistance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="distance" stroke="#888" fontSize={12} tickCount={5} />
                <YAxis domain={[0, 1]} stroke="#888" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="xg" stroke="#3b82f6" fillOpacity={1} fill="url(#colorDistance)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-container">
            <h4>xG vs Angle (holding Distance at {distance}m)</h4>
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={angleData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="angle" stroke="#888" fontSize={12} />
                <YAxis domain={[0, 1]} stroke="#888" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="xg" stroke="#10b981" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
