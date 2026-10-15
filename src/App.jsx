import Website from './Website';
import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import * as THREE from 'three';
import { MiniIxchel, MiniSwarm, MiniChaac } from './Minigames';
import ProductPage from './ProductPage';

// ------------------------------------------------------------------------------------------------
// AUDIO MANAGEMENT
// ------------------------------------------------------------------------------------------------
const BGM_URLS = {
  tutorial: "/audio/_The Sanctuary (U Naajil Yuum K'iin)_.wav",
  macro: "/audio/_The Sanctuary (U Naajil Yuum K'iin)_.wav",
  micro: "/audio/Canopy Flight.wav",
  defense: "/audio/_Guard of the Jobón_.wav",
  harvest: "/audio/The Gift of the Full Moon.wav",
  cutscene: "/audio/_The Sanctuary (U Naajil Yuum K'iin)_.wav",
  mini_ixchel: "/audio/THE TEARS OF IXCHEL.wav",
  mini_swarm: "/audio/THE YELLOW SWARM.wav",
  mini_chaac: "/audio/THE WRATH OF CHAAC.wav",
};

class GameAudio {
  constructor() {
    this.bgm = new Audio();
    this.bgm.loop = true;
    this.bgm.volume = 0.2;
    this.audioCtx = null;
  }

  playBGM(state) {
    const url = BGM_URLS[state];
    if (url) {
      if (this.bgm.src !== url) {
        this.bgm.src = url;
        this.bgm.play().catch(e => console.log('BGM Autoplay Blocked:', e));
      } else {
        if (this.bgm.paused) this.bgm.play().catch(() => { });
      }
    } else {
      this.bgm.pause();
    }
  }

  playTone(freq, type, duration, vol = 0.1) {
    try {
      if (!this.audioCtx) this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
      gain.gain.setValueAtTime(vol, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch (e) {
      console.log('Audio error:', e);
    }
  }

  playBiteSFX() {
    this.playTone(150, 'sawtooth', 0.15, 0.4);
    setTimeout(() => this.playTone(100, 'square', 0.1, 0.3), 50);
  }

  playCollectSFX() {
    this.playTone(400, 'sine', 0.05, 0.01);
  }

  playHitSFX() {
    this.playTone(300, 'sawtooth', 0.1, 0.5);
    setTimeout(() => this.playTone(150, 'square', 0.3, 0.6), 50);
  }

  playWebSFX() {
    this.playTone(200, 'sine', 0.05, 0.3);
    setTimeout(() => this.playTone(250, 'triangle', 0.1, 0.4), 100);
  }
}

export const audioManager = new GameAudio();




// ------------------------------------------------------------------------------------------------
// CUTSCENE MODE (Cinematic Storytelling)
// ------------------------------------------------------------------------------------------------
function CutsceneMode({ cutscene, onComplete }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (cutscene.video && videoRef.current) {
      // Attempt to auto play the specific video
      videoRef.current.play().catch(e => console.log('Video play blocked', e));
    }
  }, [cutscene.video]);

  return (
    <div className="relative w-full h-screen bg-black flex flex-col items-center justify-center overflow-hidden">
      {cutscene.video && (
        <video
          ref={videoRef}
          src={cutscene.video}
          className="absolute inset-0 w-full h-full object-cover"
          loop
          muted // Muted explicitly so the background BGM handles the game sound!
          playsInline
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-slate-900/60 to-transparent"></div>

      <div className="relative z-10 flex flex-col items-center justify-center h-full max-w-5xl p-8 text-center animate-in fade-in duration-1000">
        <p className="text-3xl md:text-5xl font-serif leading-relaxed text-amber-50 drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] mb-12 bg-black/40 px-6 py-4 rounded-xl backdrop-blur-sm border border-slate-700/50">
          {cutscene.narrative}
        </p>
        <button onClick={onComplete} className="px-8 py-3 bg-amber-600/60 hover:bg-amber-600/80 border border-amber-500/50 hover:border-amber-400 text-amber-100 transition-all rounded text-2xl uppercase tracking-widest backdrop-blur shadow-2xl">
          Continue
        </button>
      </div>
    </div>
  );
}

function VictoryScreen({ onRestart }) {
  return (
    <div className="w-full h-screen relative bg-slate-950 flex flex-col items-center justify-center font-sans overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 pointer-events-none"></div>
      <div className="z-10 text-center flex flex-col items-center p-8 bg-black/60 backdrop-blur-md rounded-2xl border border-amber-500/50 shadow-[0_0_100px_rgba(217,119,6,0.3)]">
        <h1 className="text-6xl font-black mb-6 font-serif bg-gradient-to-t from-amber-600 to-amber-200 bg-clip-text text-transparent drop-shadow-md">U JAANLI K'IIN</h1>
        <p className="text-2xl text-emerald-300 font-semibold mb-4 max-w-2xl">
          The Sanctuary flourishes! You have rebuilt the great hives and harvested abundantly.
        </p>
        <p className="text-lg text-slate-300 mb-8 max-w-xl">
          The elders celebrate your tireless work. The legacy of the Xunán Kab—the Royal Lady Bee—is secured for generations to come.
        </p>
        <button
          onClick={onRestart}
          className="px-10 py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold rounded-full text-2xl shadow-[0_0_20px_rgba(16,185,129,0.8)] transition-all hover:scale-110">
          Rejoice & Rebirth
        </button>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------------------------------------
// CODEX TUTORIAL
// ------------------------------------------------------------------------------------------------
function CodexTutorial({ onStart }) {
  return (
    <div className="w-full h-full bg-[#110a05] flex items-center justify-center p-2 md:p-4 overflow-hidden">
      <div className="max-w-3xl w-full max-h-[95vh] flex flex-col bg-[#1c110a] border border-amber-900/50 p-6 md:p-8 rounded-2xl shadow-2xl relative">
        <h1 className="text-2xl md:text-3xl font-serif text-amber-500 mb-2 md:mb-3 text-center shrink-0">The Madrid Codex</h1>
        <div className="w-16 md:w-24 h-1 bg-amber-600 mx-auto rounded-full mb-4 shrink-0"></div>

        <div className="text-stone-300 space-y-3 md:space-y-4 text-sm md:text-base font-light leading-relaxed overflow-y-auto pr-2 custom-scrollbar flex-1">
          <p>
            Welcome to the realm of the <strong className="text-white">Xunán Kab</strong>. Before you take flight, you must understand the sacred knowledge passed down through generations, preserved in the ancient <strong className="text-amber-400">Madrid Codex</strong>.
          </p>
          <p>
            The Madrid Codex is one of the few surviving Maya books, and it contains vital treatises on the precise husbandry of the stingless bee <em>(Melipona beecheii)</em>. It details how the ancestors harmonized with the jungle's seasons, performed ceremonies to appease gods like Chaac (God of Rain), and protected the Jobón (hollowed log hives).
          </p>

          <h3 className="text-lg md:text-xl font-serif text-amber-400 mt-4 md:mt-6 mb-2">Game Mechanics</h3>
          <ul className="list-disc pl-5 space-y-2 text-xs md:text-sm">
            <li><strong>Seasons:</strong> Resources follow the cycles. Expect abundance in the Flowering Season, but extreme scarcity during the Dry and Rainy seasons.</li>
            <li><strong>Roles:</strong> Manage your hive. Assign Foragers to brave the canopy, Nurses to raise the brood, and Guards to mitigate the Invasion Threat.</li>
            <li><strong>Canopy Flight:</strong> Send the bee out. Fly deep into the jungle to collect Nectar, Pollen, and Resin. Watch out for spider webs!</li>
            <li><strong>Hive Defense:</strong> When the Invasion Threat reaches 100%, Phorid Flies will attack the Jobón! You must manually defend it.
              <ul className="list-none pl-4 mt-2 space-y-1 text-amber-200">
                <li><kbd className="bg-slate-700 px-2 py-0.5 rounded text-white font-mono text-[10px] md:text-xs">SPACEBAR</kbd> or <kbd className="bg-slate-700 px-2 py-0.5 rounded text-white font-mono text-[10px] md:text-xs">Left-Click</kbd> : Bite attacking flies.</li>
                <li><kbd className="bg-slate-700 px-2 py-0.5 rounded text-white font-mono text-[10px] md:text-xs">SHIFT</kbd> or <kbd className="bg-slate-700 px-2 py-0.5 rounded text-white font-mono text-[10px] md:text-xs">Right-Click</kbd> : Block the entrance with your body.</li>
              </ul>
            </li>
          </ul>
        </div>

        <div className="mt-4 md:mt-6 flex justify-center shrink-0">
          <button
            onClick={onStart}
            className="bg-amber-600 hover:bg-amber-500 text-stone-900 font-bold px-6 py-2 md:px-8 md:py-3 rounded-full text-base md:text-lg shadow-[0_0_15px_#d97706] transition-all"
          >
            Enter the Jungle
          </button>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------------------------------------
// MACROVIEW (2D Dashboard)
// ------------------------------------------------------------------------------------------------
function MacroView({ gameState, setGameState, state, setState }) {
  // Passive game loop (Time passes only in macro)
  useEffect(() => {
    const loop = setInterval(() => {
      setState(prev => {
        let newThreat = prev.invasionThreat;
        let newPop = { ...prev.population };
        let newRes = { ...prev.resources };
        let newRespect = prev.villageRespect;
        let activeCrisis = prev.activeCrisis;
        let cTimer = prev.crisisTimer;
        let currentCutscene = prev.currentCutscene;

        // Season System
        let newSeason = prev.season || 'Flowering Season';
        let newSeasonTicks = (prev.seasonTicks || 0) + 1;
        if (newSeasonTicks > 60) {
          newSeasonTicks = 0;
          if (newSeason === 'Flowering Season') newSeason = 'Rainy Season';
          else if (newSeason === 'Rainy Season') newSeason = 'Dry Season';
          else newSeason = 'Flowering Season';
        }

        // Threat System (ensure it always increases at least slightly so they must manage it)
        const threatSpeed = activeCrisis === 'yellow_swarm' ? 3 : 1;
        const threatIncrease = Math.max(0.5, (2 - (newPop.guards * 0.01)) * threatSpeed);
        newThreat = Math.min(100, newThreat + threatIncrease);

        // Resource & Population Generate
        let seasonMod = 1;
        if (newSeason === 'Rainy Season') seasonMod = 0.5;
        if (newSeason === 'Dry Season') seasonMod = 0.1; // Very harsh dry season

        if (activeCrisis !== 'yellow_swarm') {
          newRes.nectar += newPop.foragers * 0.01 * seasonMod;
          newRes.pollen += newPop.foragers * 0.005 * seasonMod;
          newRes.resin += newPop.foragers * 0.002 * seasonMod;
        }

        if (newRes.pollen > 0 && newPop.nurses > 0 && newPop.total < (newPop.max || 1000)) {
          const consumed = Math.min(newRes.pollen, newPop.nurses * 0.01);
          newRes.pollen -= consumed;
          newPop.total = Math.min(newPop.max || 1000, newPop.total + Math.floor(consumed * 2));
        }

        // Crisis Timers
        if (cTimer > 0) {
          cTimer -= 1;
          if (cTimer <= 0) {
            if (activeCrisis === 'tears_of_ixchel') {
              newRespect = Math.max(0, newRespect - 40);
            }
            activeCrisis = null;
          }
        }

        // Random Crisis trigger (5% every 10 ticks pseudo-check = 0.5% every second)
        let nextState = 'macro';

        // Win Condition Check
        if (newPop.jobones >= 20 && newRes.honey >= 1000) {
          nextState = 'victory';
        } else if (!activeCrisis && newThreat < 100 && Math.random() < 0.005) {
          const r = Math.random();
          activeCrisis = r < 0.33 ? 'tears_of_ixchel' : r < 0.66 ? 'yellow_swarm' : 'wrath_of_chaac';
          cTimer = activeCrisis === 'tears_of_ixchel' ? 120 : activeCrisis === 'yellow_swarm' ? 60 : 0;

          if (activeCrisis === 'wrath_of_chaac') {
            nextState = 'cutscene';
            currentCutscene = {
              video: "/audio/Drought_Stricken_Jungle_Video cutscene.mp4",
              narrative: "The Wrath of Chaac is upon the land. A brutal drought drains your stamina twice as fast in the canopy. Offer 100 Nectar to appease him.",
              nextState: 'macro'
            };
          }
        }

        // Invasion Alert Check
        if (nextState === 'macro' && newThreat >= 100 && activeCrisis !== 'invasion') {
          activeCrisis = 'invasion';
          cTimer = 0;
          nextState = 'defense';
        }

        return {
          ...prev, resources: newRes, population: newPop, invasionThreat: newThreat,
          villageRespect: newRespect, activeCrisis, crisisTimer: cTimer, currentCutscene, _triggerNext: nextState,
          season: newSeason, seasonTicks: newSeasonTicks
        };
      });
    }, 1000);
    return () => clearInterval(loop);
  }, []);

  // Monitor for transitions triggered by loop
  useEffect(() => {
    if (state._triggerNext && state._triggerNext !== 'macro') {
      const next = state._triggerNext;
      setState(prev => ({ ...prev, _triggerNext: null }));
      setGameState(next);
    }
  }, [state._triggerNext, setGameState, setState]);

  const sealHive = () => {
    if (state.resources.resin >= 5) {
      setState(prev => ({
        ...prev,
        resources: { ...prev.resources, resin: prev.resources.resin - 5 },
        invasionThreat: Math.max(0, prev.invasionThreat - 20)
      }));
    }
  };

  const handleTearsQuest = () => {
    if (state.resources.nectar >= 50 && state.resources.resin >= 30) {
      setState(prev => ({
        ...prev,
        resources: { ...prev.resources, nectar: prev.resources.nectar - 50, resin: prev.resources.resin - 30 },
        population: { ...prev.population, max: (prev.population.max || 1000) + 200 },
        activeCrisis: null,
        crisisTimer: 0
      }));
    }
  };

  const handleDroughtAppease = () => {
    if (state.resources.nectar >= 100) {
      setState(prev => ({
        ...prev,
        resources: { ...prev.resources, nectar: prev.resources.nectar - 100 },
        activeCrisis: null
      }));
    }
  }

  const handleSwarmDefeat = () => {
    if (state.population.guards >= 50) {
      setState(prev => ({
        ...prev,
        population: {
          ...prev.population,
          guards: prev.population.guards - 50,
          total: Math.max(0, prev.population.total - 50)
        },
        activeCrisis: null,
        crisisTimer: 0
      }));
    }
  };

  const adjustWorker = (role, val) => {
    setState(prev => {
      const numericVal = parseInt(val, 10);
      const newPop = { ...prev.population, [role]: numericVal };
      const currentAssigned = newPop.foragers + newPop.nurses + newPop.guards;
      if (currentAssigned > prev.population.total) return prev;
      return { ...prev, population: newPop };
    });
  };

  const craftJobon = () => {
    if (state.resources.resin >= 50 && state.resources.nectar >= 100) {
      setState(prev => ({
        ...prev,
        resources: { ...prev.resources, resin: prev.resources.resin - 50, nectar: prev.resources.nectar - 100 },
        population: { ...prev.population, jobones: (prev.population.jobones || 1) + 1, max: (prev.population.max || 1000) + 1000 },
        villageRespect: Math.min(100, prev.villageRespect + 10)
      }));
    }
  };

  const triggerHiveDefense = () => {
    setState(prev => ({
      ...prev,
      activeCrisis: 'invasion',
      crisisTimer: 0,
      invasionThreat: 100,
      _triggerNext: 'defense'
    }));
  };

  if (state.villageRespect <= 0 || state.population.total <= 0) {
    const reason = state.villageRespect <= 0 ? "The village has abandoned The Sanctuary." : "The hive has perished.";
    return (
      <div className="w-full h-screen bg-slate-950 flex flex-col items-center justify-center text-red-500 font-sans">
        <h1 className="text-6xl font-bold mb-4 font-serif">THE LINEAGE ENDS</h1>
        <p className="text-2xl text-slate-300">{reason}</p>
        <button onClick={() => window.location.reload()} className="mt-8 px-8 py-3 bg-red-800 hover:bg-red-700 text-white rounded text-xl shadow-lg transition-transform hover:scale-105">Rebirth</button>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-[#0f1115] text-white p-4 md:p-6 flex flex-col font-sans overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
      <header className="flex justify-between items-center mb-4 pb-2 border-b border-amber-900/50">
        <div>
          <h1 className="text-3xl font-serif font-black bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent drop-shadow-md">
            The Sanctuary (U Naajil Yuum K'iin)
          </h1>
          <div className="flex gap-4 items-center mt-1">
            <span className="text-emerald-400 font-mono text-xs tracking-wider uppercase">Village Respect: {Math.floor(state.villageRespect)}%</span>
            <span className="text-amber-200 font-mono text-xs tracking-wider uppercase bg-amber-900/40 px-2 py-0.5 rounded-full border border-amber-800/50">Season: {state.season || 'Flowering Season'}</span>
          </div>
        </div>
        <div className="flex gap-4 text-base md:text-lg font-semibold bg-slate-900/50 p-2 md:p-3 rounded-xl border border-slate-800 shadow-inner">
          <div className="flex items-center gap-1.5" title="Jobones (Hives)"><span className="text-amber-600">🪵</span>{state.population.jobones || 1}</div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_10px_#fbbf24]"></span>{Math.floor(state.resources.nectar)}</div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]"></span>{Math.floor(state.resources.pollen)}</div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_10px_#ef4444]"></span>{Math.floor(state.resources.resin)}</div>
          <div className="flex items-center gap-1.5 ml-2 border-l border-amber-900/50 pl-3"><span className="text-xl leading-none">🍯</span>{Math.floor(state.resources.honey || 0)}</div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 flex-1 min-h-0">
        {/* Workers Panel */}
        <div className="bg-gradient-to-b from-slate-900 to-slate-950 p-4 md:p-6 rounded-2xl border border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.5)] flex flex-col overflow-y-auto hide-scrollbar">
          <h2 className="text-xl md:text-2xl font-serif font-semibold mb-4 md:mb-6 text-amber-300 drop-shadow-md flex justify-between items-baseline">
            <span>Swarm Population</span>
            <div className="text-white font-mono text-lg md:text-xl">
              {state.population.total} <span className="text-slate-500 text-xs md:text-sm">/ {state.population.max || 1000} MAX</span>
            </div>
          </h2>

          <div className="space-y-4 md:space-y-6 flex-1">
            <div className="bg-slate-800/40 p-3 md:p-4 rounded-lg border border-slate-700">
              <div className="flex justify-between mb-2 text-sm md:text-base"><span className="text-amber-200">Foragers (Nectar Gen)</span><span className="font-mono">{state.population.foragers}</span></div>
              <input type="range" className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500" min="0" max={state.population.total} value={state.population.foragers} onChange={(e) => adjustWorker('foragers', e.target.value)} />
            </div>
            <div className="bg-slate-800/40 p-3 md:p-4 rounded-lg border border-slate-700">
              <div className="flex justify-between mb-2 text-sm md:text-base"><span className="text-emerald-200">Nurses (Pop Growth)</span><span className="font-mono">{state.population.nurses}</span></div>
              <input type="range" className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500" min="0" max={state.population.total} value={state.population.nurses} onChange={(e) => adjustWorker('nurses', e.target.value)} />
            </div>
            <div className="bg-slate-800/40 p-3 md:p-4 rounded-lg border border-slate-700">
              <div className="flex justify-between mb-2 text-sm md:text-base"><span className="text-blue-300">Guards (Defense)</span><span className="font-mono">{state.population.guards}</span></div>
              <input type="range" className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500" min="0" max={state.population.total} value={state.population.guards} onChange={(e) => adjustWorker('guards', e.target.value)} />
            </div>
          </div>
          <div className="mt-3 text-center text-slate-400 font-mono tracking-wide text-xs md:text-sm">
            IDLE BEES: {state.population.total - state.population.foragers - state.population.nurses - state.population.guards}
          </div>
        </div>

        {/* Global Alert & Boss Panel */}
        <div className="bg-gradient-to-b from-slate-900 to-slate-950 p-4 md:p-6 rounded-2xl border border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.5)] flex flex-col items-center overflow-y-auto hide-scrollbar">

          <div className="w-full mb-4 md:mb-6 bg-black/40 p-4 rounded-xl border border-red-900">
            <h3 className="text-lg md:text-xl font-serif mb-2 text-red-500 font-bold tracking-widest text-center">INVASION THREAT</h3>
            <div className="w-full bg-slate-950 h-6 rounded-full overflow-hidden border border-slate-700 shadow-inner p-1">
              <div className={`h-full rounded-full transition-all duration-500 ${state.invasionThreat > 80 ? 'bg-red-600 animate-pulse' : 'bg-gradient-to-r from-red-800 to-red-500'}`} style={{ width: `${state.invasionThreat}%` }}></div>
            </div>
            <p className="mt-2 text-center text-slate-400 font-mono font-semibold text-sm">{Math.floor(state.invasionThreat)} / 100</p>
            <button
              className={`w-full mt-3 py-2 rounded text-base font-bold border transition-all ${state.resources.resin >= 5 ? 'bg-red-900/40 hover:bg-red-700 border-red-500 text-red-100 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed'}`}
              onClick={sealHive} disabled={state.resources.resin < 5}
            >
              Seal Entrance (5 Resin)
            </button>
          </div>

          <div className="w-full flex-1 flex flex-col min-h-[0]">
            <h3 className="text-sm md:text-base font-mono text-slate-500 mb-2 uppercase tracking-widest border-b border-slate-800 pb-1">Active Events</h3>

            {state.activeCrisis === 'tears_of_ixchel' && (
              <div className="bg-red-900/40 border border-red-500 p-3 md:p-4 rounded-xl animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.4)]">
                <h4 className="text-base md:text-lg text-amber-500 font-serif font-black mb-1 uppercase flex items-center gap-1.5"><span>⚠️</span> Tears of Ixchel</h4>
                <p className="text-red-200/90 mb-2 text-xs md:text-sm font-semibold">A severe infection blights the elders! Prepare the sacred salve in the alchemy mortar.</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-amber-400 font-black font-mono text-lg md:text-xl">{state.crisisTimer}s</span>
                  <button onClick={() => {
                    setState(prev => ({
                      ...prev,
                      currentCutscene: {
                        video: "/audio/Woman_gives_honey_to_elder_cutscene/Woman_gives_honey_to_elder_cutscene.mp4",
                        narrative: "A severe infection blights the elders! Prepare the sacred salve in the alchemy mortar.",
                        nextState: 'mini_ixchel'
                      }
                    }));
                    setGameState('cutscene');
                  }} className="px-3 py-1.5 bg-red-600 border border-red-400 rounded font-black text-amber-50 hover:bg-red-500 hover:shadow-[0_0_10px_#ef4444] transition-all text-xs md:text-sm">Face Crisis</button>
                </div>
              </div>
            )}

            {state.activeCrisis === 'yellow_swarm' && (
              <div className="bg-red-900/40 border border-red-500 p-3 md:p-4 rounded-xl animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.4)]">
                <h4 className="text-base md:text-lg text-amber-500 font-serif font-black mb-1 uppercase flex items-center gap-1.5"><span>⚠️</span> The Yellow Swarm</h4>
                <p className="text-red-200/90 mb-2 text-xs md:text-sm font-semibold">Giant Apis mellifera are invading! Defend the Jobón entrance!</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-amber-400 font-black font-mono text-lg md:text-xl">{state.crisisTimer}s</span>
                  <button onClick={() => {
                    setState(prev => ({
                      ...prev,
                      currentCutscene: {
                        video: "/audio/Bees_attack_melipona_bee_jobones_video cutscene/Bees_attack_melipona_bee_jobones_video cutscene.mp4",
                        narrative: "Giant Apis mellifera are invading! Defend the Jobón entrance!",
                        nextState: 'mini_swarm'
                      }
                    }));
                    setGameState('cutscene');
                  }} className="px-3 py-1.5 bg-red-600 border border-red-500 rounded font-black text-amber-50 hover:bg-red-500 hover:shadow-[0_0_10px_#ef4444] transition-all text-xs md:text-sm">Face Crisis</button>
                </div>
              </div>
            )}

            {state.activeCrisis === 'wrath_of_chaac' && (
              <div className="bg-red-900/40 border border-red-500 p-3 md:p-4 rounded-xl shadow-[0_0_15px_rgba(239,68,68,0.4)]">
                <h4 className="text-base md:text-lg text-amber-500 font-serif font-black mb-1 uppercase flex items-center gap-1.5"><span>⚠️</span> Wrath of Chaac</h4>
                <p className="text-red-200/90 mb-2 text-xs md:text-sm font-semibold">A brutal drought withers the jungle. Perform the sacred rain ritual!</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-amber-400 font-black font-mono text-lg md:text-xl">∞</span>
                  <button onClick={() => setGameState('mini_chaac')} className="px-3 py-1.5 bg-amber-600/80 border border-amber-500 rounded font-black text-amber-50 hover:bg-amber-500 hover:shadow-[0_0_10px_#f59e0b] transition-all text-xs md:text-sm">Face Crisis</button>
                </div>
              </div>
            )}

            {!state.activeCrisis && (
              <div className="flex-1 flex items-center justify-center font-serif text-slate-600 italic text-sm md:text-base">
                The jungle is at peace.
              </div>
            )}
          </div>
        </div>

        {/* Action Panel */}
        <div className="bg-gradient-to-t from-black to-slate-900 border border-amber-900/50 rounded-2xl p-4 md:p-6 flex flex-col justify-end relative overflow-y-auto hide-scrollbar group">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-20 mix-blend-overlay group-hover:scale-110 group-hover:opacity-30 transition-all duration-1000"></div>

          <div className="relative z-10 flex flex-col h-full bg-black/60 p-4 md:p-5 rounded-xl border border-amber-900/30 backdrop-blur-sm">
            <div className="flex-1 min-h-[0] overflow-y-auto hide-scrollbar pr-2">
              <h2 className="text-xl md:text-2xl font-serif text-amber-100 mb-2 border-b border-amber-900/50 pb-1.5">Meliponary Expansion</h2>
              <p className="text-amber-200/70 mb-4 text-xs md:text-sm">Expand your apiary or test your defenses against the jungle's threats.</p>

              <div className="space-y-2 md:space-y-3 mb-2 md:mb-4">
                <div className="bg-slate-900/80 p-2 md:p-3 rounded-lg border border-amber-900/50">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm md:text-base font-serif text-amber-300">Construct Jobón</span>
                    <span className="text-[9px] md:text-[10px] font-mono bg-slate-800 px-1 py-0.5 rounded text-slate-300 flex items-center gap-1">+1000 Pop, +10 Respect</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] md:text-xs font-mono text-slate-400">Cost: 100 Nectar, 50 Resin</span>
                    <button onClick={craftJobon} disabled={state.resources.nectar < 100 || state.resources.resin < 50} className="px-2 py-1 md:px-3 md:py-1.5 bg-amber-700 hover:bg-amber-600 disabled:opacity-50 disabled:bg-slate-800 rounded font-bold text-white transition-all text-[10px] md:text-xs shadow-[0_0_10px_rgba(180,83,9,0.5)]">Craft</button>
                  </div>
                </div>

                <div className="bg-amber-900/40 p-2 md:p-3 rounded-lg border border-amber-900/50">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm md:text-base font-serif text-amber-300">Harvest Honey</span>
                    <span className="text-[9px] md:text-[10px] font-mono bg-amber-950 px-1 py-0.5 rounded text-amber-300">Full Moon Event</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] md:text-xs font-mono text-slate-400">Low Threat Required</span>
                    <button onClick={() => setGameState('harvest')} disabled={state.invasionThreat >= 30} className="px-2 py-1 md:px-3 md:py-1.5 bg-amber-800 hover:bg-amber-700 disabled:opacity-50 disabled:bg-slate-800 rounded font-bold text-white transition-all text-[10px] md:text-xs shadow-[0_0_10px_rgba(180,83,9,0.5)]">Harvest</button>
                  </div>
                </div>

                <div className="bg-red-950/40 p-2 md:p-3 rounded-lg border border-red-900/50">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm md:text-base font-serif text-red-400">Hive Protection</span>
                    <span className="text-[9px] md:text-[10px] font-mono bg-red-950 px-1 py-0.5 rounded text-red-300">Boss Level</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] md:text-xs font-mono text-slate-400">Face Phorid Swarm</span>
                    <button onClick={triggerHiveDefense} className="px-2 py-1 md:px-3 md:py-1.5 bg-red-800 hover:bg-red-700 rounded font-bold text-white transition-all text-[10px] md:text-xs shadow-[0_0_10px_rgba(153,27,27,0.5)]">Trigger</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-auto shrink-0 pt-2 md:pt-4">
              <button
                className="w-full py-2.5 md:py-3 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-slate-950 text-lg md:text-xl font-black font-sans tracking-tight rounded-lg md:rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.6)] transform hover:-translate-y-1 transition-all"
                onClick={() => setGameState('micro')}
              >
                Fly Out to Canopy →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------------------------------------
// MICROVIEW (3D Canopy Flight)
// ------------------------------------------------------------------------------------------------
function MicroBeePlayer({ position, gameStats, stateRef, activeCrisis, treeData }) {
  const groupRef = useRef();
  const beeGroupRef = useRef();
  const wingRRef = useRef();
  const wingLRef = useRef();
  const { camera } = useThree();

  const speed = 12;
  const turnSpeed = 2.0;
  const ascendSpeed = 8;
  const yawRef = useRef(0); // Global Y rotation of bee

  const pressedKeys = useRef({});
  useEffect(() => {
    const onKeyDown = (e) => {
      if (['Space', 'KeyE', 'ShiftLeft', 'ShiftRight'].includes(e.code)) e.preventDefault();
      pressedKeys.current[e.code] = true;
    };
    const onKeyUp = (e) => (pressedKeys.current[e.code] = false);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  // Build the exact Melipona beecheii 3D model imperatively
  useEffect(() => {
    if (!groupRef.current) return;
    const currentGroup = groupRef.current; // Capture group reference securely for cleanup

    const bee = new THREE.Group();
    bee.scale.set(1.3, 1.3, 1.3);

    const darkAmberMat = new THREE.MeshPhysicalMaterial({ color: 0x5c3a21, emissive: 0x1a0f05, metalness: 0.3, roughness: 0.1, clearcoat: 1.0, clearcoatRoughness: 0.05 });
    const darkChitinMat = new THREE.MeshPhysicalMaterial({ color: 0x0f0f0f, metalness: 0.5, roughness: 0.15, clearcoat: 1.0, clearcoatRoughness: 0.05 });
    const wingMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, transmission: 0.95, opacity: 1, metalness: 0.1, roughness: 0.02, ior: 1.1, transparent: true, side: THREE.DoubleSide });

    // Stubby Stingless Abdomen (striped cylinder slices)
    const abdomen = new THREE.Group();
    for (let i = 0; i < 4; i++) {
      const slice = new THREE.Mesh(
        new THREE.CylinderGeometry(0.38 - i * 0.03, 0.4 - i * 0.02, 0.18, 32),
        i % 2 === 0 ? darkAmberMat : darkChitinMat
      );
      slice.rotation.x = Math.PI / 2;
      slice.position.z = i * 0.18;
      slice.castShadow = true;
      abdomen.add(slice);
    }
    const endCap = new THREE.Mesh(
      new THREE.SphereGeometry(0.29, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2),
      darkChitinMat
    );
    endCap.rotation.x = Math.PI / 2;
    endCap.position.z = 3 * 0.18 + 0.09;
    endCap.castShadow = true;
    abdomen.add(endCap);
    abdomen.position.set(0, 0, 0.35);
    abdomen.scale.set(1.1, 0.85, 0.8);
    bee.add(abdomen);

    // Thorax
    const thorax = new THREE.Mesh(new THREE.SphereGeometry(0.35, 32, 32), darkChitinMat);
    thorax.scale.z = 1.1;
    thorax.castShadow = true;
    bee.add(thorax);

    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 32, 32), darkChitinMat);
    head.position.set(0, -0.05, -0.45);
    head.castShadow = true;
    bee.add(head);

    // Compound Eyes
    const eyeMat = new THREE.MeshPhysicalMaterial({ color: 0x050505, roughness: 0.1, clearcoat: 1.0 });
    const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), eyeMat);
    eyeR.position.set(0.16, 0.05, -0.5);
    bee.add(eyeR);
    const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), eyeMat);
    eyeL.position.set(-0.16, 0.05, -0.5);
    bee.add(eyeL);

    // Antennae
    const antGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.25);
    antGeo.translate(0, 0.12, 0);
    const antR = new THREE.Mesh(antGeo, darkChitinMat);
    antR.position.set(0.08, 0.08, -0.6);
    antR.rotation.x = Math.PI / 2.5;
    antR.rotation.z = -Math.PI / 8;
    bee.add(antR);
    const antL = new THREE.Mesh(antGeo.clone(), darkChitinMat);
    antL.position.set(-0.08, 0.08, -0.6);
    antL.rotation.x = Math.PI / 2.5;
    antL.rotation.z = Math.PI / 8;
    bee.add(antL);

    // Wings (flat, mounted on sides)
    const wingGeo = new THREE.BoxGeometry(0.9, 0.005, 0.35);
    wingGeo.translate(0.45, 0, 0);
    const wingR = new THREE.Mesh(wingGeo, wingMat);
    wingR.position.set(0.25, 0.15, -0.1);
    wingR.rotation.x = Math.PI / 12;
    wingR.rotation.y = -0.3;
    bee.add(wingR);
    wingRRef.current = wingR;

    const wingGeoL = new THREE.BoxGeometry(0.9, 0.005, 0.35);
    wingGeoL.translate(0.45, 0, 0);
    const wingL = new THREE.Mesh(wingGeoL, wingMat);
    wingL.position.set(-0.25, 0.15, -0.1);
    wingL.rotation.x = Math.PI / 12;
    wingL.rotation.y = 0.3 + Math.PI;
    bee.add(wingL);
    wingLRef.current = wingL;

    // Legs (3 pairs)
    const legMat = darkChitinMat;
    const legPositions = [
      { x: 0.2, z: -0.2 }, { x: -0.2, z: -0.2 },
      { x: 0.25, z: 0.05 }, { x: -0.25, z: 0.05 },
      { x: 0.22, z: 0.3 }, { x: -0.22, z: 0.3 }
    ];
    for (const lp of legPositions) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.008, 0.25, 6), legMat);
      leg.position.set(lp.x, -0.15, lp.z);
      leg.rotation.z = lp.x > 0 ? 0.6 : -0.6;
      leg.rotation.x = 0.2;
      bee.add(leg);
    }

    // Warm glow
    const glow = new THREE.PointLight(0xfbbf24, 3, 6, 2);
    glow.position.set(0, 0, 0);
    bee.add(glow);

    beeGroupRef.current = bee;
    groupRef.current.add(bee);

    return () => {
      // Cleanup
      currentGroup?.remove(bee);
      bee.traverse((child) => {
        if (child.isMesh) {
          child.geometry?.dispose();
        }
      });
    };
  }, []);

  useFrame((threeState, delta) => {
    if (!groupRef.current || !beeGroupRef.current) return;

    const drainRate = activeCrisis === 'wrath_of_chaac' ? 3 : 1.5;
    gameStats.current.stamina = Math.max(0, gameStats.current.stamina - delta * drainRate);

    const k = pressedKeys.current;
    const bee = beeGroupRef.current;

    // === OMNIDIRECTIONAL CONTROLS ===
    // A/D: Turn left/right (yaw)
    if (k['KeyA'] || k['ArrowLeft']) yawRef.current += turnSpeed * delta;
    if (k['KeyD'] || k['ArrowRight']) yawRef.current -= turnSpeed * delta;

    // Calculate forward direction from yaw
    const forward = new THREE.Vector3(0, 0, -1);
    forward.applyAxisAngle(new THREE.Vector3(0, 1, 0), yawRef.current);
    const right = new THREE.Vector3(1, 0, 0);
    right.applyAxisAngle(new THREE.Vector3(0, 1, 0), yawRef.current);

    // W/S: Move forward/backward in local space
    let moveSpeed = 0;
    if (k['KeyW'] || k['ArrowUp']) moveSpeed = speed * delta;
    if (k['KeyS'] || k['ArrowDown']) moveSpeed = -speed * 0.5 * delta;

    // Spider web slowdown and aggressive drain
    if (stateRef.current.inWeb) {
      moveSpeed *= 0.15; // Extreme slowdown
      gameStats.current.stamina = Math.max(0, gameStats.current.stamina - delta * 15); // Moderate drain (was 30)
      // Camera shake
      camera.position.x += (Math.random() - 0.5) * 0.4;
      camera.position.y += (Math.random() - 0.5) * 0.4;
    }

    // Wasp Hit Knockback & Drain
    if (stateRef.current.waspHit > 0) {
      stateRef.current.waspHit -= delta;
      moveSpeed = -speed * 1.5 * delta; // Force backward
      camera.position.z += (Math.random() - 0.5) * 1.0; // Heavy shake
    }

    // Apply movement in local forward direction
    groupRef.current.position.addScaledVector(forward, moveSpeed);

    // E/Shift/Space: Ascend/Descend
    if (k['KeyE'] || k['Space']) groupRef.current.position.y += ascendSpeed * delta;
    if (k['ShiftLeft'] || k['ShiftRight']) groupRef.current.position.y -= ascendSpeed * 0.7 * delta;
    if (!k['KeyE'] && !k['Space'] && !k['ShiftLeft'] && !k['ShiftRight']) {
      groupRef.current.position.y -= ascendSpeed * 0.15 * delta; // Gentle gravity
    }

    // Tree trunk collision
    if (treeData) {
      const bPos = groupRef.current.position;
      for (const tree of treeData) {
        const dx = bPos.x - tree.x;
        const dz = bPos.z - tree.z;
        const trunkRadius = 3 * tree.scale;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < trunkRadius && bPos.y < 25 * tree.scale) {
          const pushDir = new THREE.Vector2(dx, dz).normalize();
          groupRef.current.position.x = tree.x + pushDir.x * trunkRadius;
          groupRef.current.position.z = tree.z + pushDir.y * trunkRadius;
        }
      }
    }

    // Bounds
    groupRef.current.position.y = Math.max(1, Math.min(35, groupRef.current.position.y));
    groupRef.current.position.x = Math.max(-40, Math.min(40, groupRef.current.position.x));

    // === BEE ROTATION (yaw + pitch + roll) ===
    // Base yaw rotation
    bee.rotation.y = yawRef.current;

    // Pitch: tilt forward when moving forward, backward when reversing
    const targetPitch = moveSpeed > 0 ? -0.25 : moveSpeed < 0 ? 0.15 : 0;
    bee.rotation.x = THREE.MathUtils.lerp(bee.rotation.x, targetPitch, 0.08);

    // Roll/Bank: tilt into turns
    let targetRoll = 0;
    if (k['KeyA'] || k['ArrowLeft']) targetRoll = 0.35;
    if (k['KeyD'] || k['ArrowRight']) targetRoll = -0.35;
    bee.rotation.z = THREE.MathUtils.lerp(bee.rotation.z, targetRoll, 0.08);

    // === WING ANIMATION ===
    if (wingRRef.current && wingLRef.current) {
      const wingFlap = Math.sin(threeState.clock.elapsedTime * 50) * 0.4;
      // Wings flap by rotating around their Y axis (since they're mounted sideways)
      wingRRef.current.rotation.z = wingFlap * 0.3;
      wingLRef.current.rotation.z = -wingFlap * 0.3;
    }

    // === STRICT THIRD-PERSON CAMERA ===
    // Calculate ideal camera offset behind and above the bee, in bee's local space
    bee.updateMatrixWorld();
    const idealOffset = new THREE.Vector3(0, 2.5, 7);
    idealOffset.applyMatrix4(bee.matrixWorld);

    // Smoothly move camera to that offset
    camera.position.lerp(idealOffset, 0.08);

    // Look slightly ahead of the bee in its local forward direction
    const lookAtTarget = new THREE.Vector3(0, 0, -10);
    lookAtTarget.applyMatrix4(bee.matrixWorld);
    camera.lookAt(lookAtTarget);

    // Update player position for collision checks in MicroView
    stateRef.current.playerPosition = groupRef.current.position;
  });

  return <group ref={groupRef} position={position} />;
}

function InstancedTrees({ treeData }) {
  const trunkRef = useRef();
  const branchRef = useRef();
  const canopy1Ref = useRef();
  const canopy2Ref = useRef();
  const vineRef = useRef();

  useEffect(() => {
    if (!trunkRef.current || !canopy1Ref.current) return;
    const dummy = new THREE.Object3D();
    const c = new THREE.Color();
    let branchIdx = 0;
    let vineIdx = 0;

    treeData.forEach((tree, i) => {
      dummy.position.set(tree.x, 0, tree.z);
      dummy.scale.set(tree.scale, tree.scale, tree.scale);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();

      let localDummy = new THREE.Object3D();
      localDummy.copy(dummy);
      localDummy.translateY(15);
      localDummy.updateMatrix();
      trunkRef.current.setMatrixAt(i, localDummy.matrix);
      trunkRef.current.setColorAt(i, c.set(tree.trunkColor));

      [0, 1.5, 3, 4.5].forEach(rot => {
        let bd = new THREE.Object3D();
        bd.copy(dummy);
        bd.position.x += Math.sin(rot) * 1.8 * tree.scale;
        bd.position.y += 1.5 * tree.scale;
        bd.position.z += Math.cos(rot) * 1.8 * tree.scale;
        bd.rotation.set(0.3 * Math.cos(rot), rot, 0.3 * Math.sin(rot));
        bd.updateMatrix();
        if (branchRef.current) {
          branchRef.current.setMatrixAt(branchIdx, bd.matrix);
          branchRef.current.setColorAt(branchIdx, c.set(tree.trunkColor));
        }
        branchIdx++;
      });

      let c1 = new THREE.Object3D();
      c1.copy(dummy);
      c1.translateY(28);
      c1.scale.set(tree.canopySize, tree.canopySize, tree.canopySize);
      c1.updateMatrix();
      canopy1Ref.current.setMatrixAt(i, c1.matrix);
      canopy1Ref.current.setColorAt(i, c.set(tree.canopyColor));

      let c2 = new THREE.Object3D();
      c2.copy(dummy);
      c2.position.x += tree.canopySize * 0.3 * tree.scale;
      c2.position.y += 26 * tree.scale;
      c2.position.z += tree.canopySize * 0.2 * tree.scale;
      c2.scale.set(tree.canopySize * 0.7, tree.canopySize * 0.7, tree.canopySize * 0.7);
      c2.updateMatrix();
      canopy2Ref.current.setMatrixAt(i, c2.matrix);
      canopy2Ref.current.setColorAt(i, c.set(tree.canopyColor));

      if (tree.hasVines && vineRef.current) {
        [0, 2.2, 4.4].forEach(r => {
          let vd = new THREE.Object3D();
          vd.copy(dummy);
          vd.position.x += Math.sin(r) * 3 * tree.scale;
          vd.position.y += 18 * tree.scale;
          vd.position.z += Math.cos(r) * 3 * tree.scale;
          vd.updateMatrix();
          vineRef.current.setMatrixAt(vineIdx, vd.matrix);
          vineRef.current.setColorAt(vineIdx, c.set('#1a3a1a'));
          vineIdx++;
        });
      }
    });

    [trunkRef, branchRef, canopy1Ref, canopy2Ref, vineRef].forEach(ref => {
      if (ref.current) {
        ref.current.instanceMatrix.needsUpdate = true;
        if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true;
      }
    });
  }, [treeData]);

  const totalVines = treeData.filter(t => t.hasVines).length * 3;

  return (
    <group>
      <instancedMesh ref={trunkRef} args={[null, null, treeData.length]}>
        <cylinderGeometry args={[1.2, 2.5, 30, 8]} />
        <meshStandardMaterial roughness={0.9} flatShading={true} />
      </instancedMesh>
      <instancedMesh ref={branchRef} args={[null, null, treeData.length * 4]}>
        <boxGeometry args={[0.3, 3, 1.2]} />
        <meshStandardMaterial roughness={1} flatShading={true} />
      </instancedMesh>
      <instancedMesh ref={canopy1Ref} args={[null, null, treeData.length]}>
        <dodecahedronGeometry args={[1, 1]} />
        <meshStandardMaterial roughness={0.8} flatShading={true} />
      </instancedMesh>
      <instancedMesh ref={canopy2Ref} args={[null, null, treeData.length]}>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial roughness={0.7} flatShading={true} />
      </instancedMesh>
      {totalVines > 0 && (
        <instancedMesh ref={vineRef} args={[null, null, totalVines]}>
          <cylinderGeometry args={[0.03, 0.03, 12, 3]} />
          <meshStandardMaterial roughness={1} flatShading={true} />
        </instancedMesh>
      )}
    </group>
  );
}

function InstancedResources({ nodes }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (!meshRef.current) return;
    const dummy = new THREE.Object3D();
    const c = new THREE.Color();
    const colors = { nectar: '#fbbf24', pollen: '#10b981', resin: '#ef4444' };

    nodes.forEach((n, i) => {
      dummy.position.set(n.pos[0], n.pos[1] + Math.sin(state.clock.elapsedTime * 2 + n.pos[0]) * 0.3, n.pos[2]);
      dummy.rotation.y = state.clock.elapsedTime * 1.5;
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
      meshRef.current.setColorAt(i, c.set(colors[n.type]));
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
    meshRef.current.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, 60]} count={nodes.length}>
      <dodecahedronGeometry args={[0.5, 0]} />
      <meshStandardMaterial roughness={0.1} metalness={0.3} emissive="#aaaaaa" emissiveIntensity={0.2} />
    </instancedMesh>
  );
}

function InstancedHazards({ hazards }) {
  const web1Ref = useRef();
  const web2Ref = useRef();

  useEffect(() => {
    if (!web1Ref.current || !web2Ref.current) return;
    const dummy = new THREE.Object3D();

    hazards.forEach((h, i) => {
      dummy.position.set(h.pos[0], h.pos[1], h.pos[2]);

      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      web1Ref.current.setMatrixAt(i, dummy.matrix);

      dummy.rotation.set(0, Math.PI / 4, 0);
      dummy.updateMatrix();
      web2Ref.current.setMatrixAt(i, dummy.matrix);
    });
    web1Ref.current.instanceMatrix.needsUpdate = true;
    web2Ref.current.instanceMatrix.needsUpdate = true;
  }, [hazards]);

  return (
    <group>
      <instancedMesh ref={web1Ref} args={[null, null, hazards.length]}>
        <circleGeometry args={[2.5, 12]} />
        <meshBasicMaterial color="#e2e8f0" wireframe={true} transparent opacity={0.6} depthWrite={false} side={THREE.DoubleSide} />
      </instancedMesh>
      <instancedMesh ref={web2Ref} args={[null, null, hazards.length]}>
        <circleGeometry args={[1.5, 8]} />
        <meshBasicMaterial color="#cbd5e1" wireframe={true} transparent opacity={0.4} depthWrite={false} side={THREE.DoubleSide} />
      </instancedMesh>
    </group>
  );
}

// Seeded random for deterministic positions
function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function InstancedWasps({ waspsRef }) {
  const abdomenRef = useRef();
  const thoraxRef = useRef();
  const headRef = useRef();
  const wingLRef = useRef();
  const wingRRef = useRef();

  const [abGeo] = useState(() => { const g = new THREE.ConeGeometry(0.25, 0.7, 16); g.rotateX(-Math.PI / 2); return g; });
  const [wingGeo] = useState(() => { const g = new THREE.BoxGeometry(0.6, 0.01, 0.2); g.translate(0.3, 0, 0); return g; });

  useFrame((state, delta) => {
    if (!abdomenRef.current || !waspsRef.current) return;
    const dummy = new THREE.Object3D();
    const subDummy = new THREE.Object3D();
    const time = state.clock.getElapsedTime();

    for (let i = 0; i < waspsRef.current.length; i++) {
      const wasp = waspsRef.current[i];

      // Patrol logic
      wasp.pos.x += wasp.dir * wasp.speed * delta;
      if (wasp.pos.x > wasp.bounds.max || wasp.pos.x < wasp.bounds.min) {
        wasp.dir *= -1;
        wasp.pos.x = Math.max(wasp.bounds.min, Math.min(wasp.bounds.max, wasp.pos.x));
      }

      const currentY = wasp.pos.y + Math.sin(time * 3 + wasp.id) * 1.5;

      dummy.position.set(wasp.pos.x, currentY, wasp.pos.z);
      // Face movement direction
      dummy.rotation.set(0, wasp.dir > 0 ? Math.PI / 2 : -Math.PI / 2, (Math.sin(time * 30) * 0.2));
      dummy.scale.set(1.5, 1.5, 1.5);
      dummy.updateMatrix();

      subDummy.copy(dummy);
      subDummy.translateX(0).translateY(0).translateZ(0.2);
      subDummy.updateMatrix();
      abdomenRef.current.setMatrixAt(i, subDummy.matrix);

      subDummy.copy(dummy);
      subDummy.translateX(0).translateY(0.1).translateZ(-0.2);
      subDummy.updateMatrix();
      thoraxRef.current.setMatrixAt(i, subDummy.matrix);

      subDummy.copy(dummy);
      subDummy.translateX(0).translateY(0.15).translateZ(-0.5);
      subDummy.updateMatrix();
      headRef.current.setMatrixAt(i, subDummy.matrix);

      const wingFlap = Math.sin(time * 80) * 0.5;

      subDummy.copy(dummy);
      subDummy.translateX(-0.1).translateY(0.2).translateZ(-0.2);
      subDummy.rotateZ(wingFlap - 1.5);
      subDummy.updateMatrix();
      wingLRef.current.setMatrixAt(i, subDummy.matrix);

      subDummy.copy(dummy);
      subDummy.translateX(0.1).translateY(0.2).translateZ(-0.2);
      subDummy.rotateZ(-wingFlap + 1.5);
      subDummy.updateMatrix();
      wingRRef.current.setMatrixAt(i, subDummy.matrix);
    }

    dummy.scale.set(0, 0, 0);
    dummy.updateMatrix();
    for (let i = waspsRef.current.length; i < 20; i++) {
      abdomenRef.current.setMatrixAt(i, dummy.matrix);
      thoraxRef.current.setMatrixAt(i, dummy.matrix);
      headRef.current.setMatrixAt(i, dummy.matrix);
      wingLRef.current.setMatrixAt(i, dummy.matrix);
      wingRRef.current.setMatrixAt(i, dummy.matrix);
    }

    abdomenRef.current.instanceMatrix.needsUpdate = true;
    thoraxRef.current.instanceMatrix.needsUpdate = true;
    headRef.current.instanceMatrix.needsUpdate = true;
    wingLRef.current.instanceMatrix.needsUpdate = true;
    wingRRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      <instancedMesh ref={abdomenRef} args={[abGeo, null, 20]}>
        <meshPhysicalMaterial color="#f59e0b" emissive="#b45309" emissiveIntensity={0.2} metalness={0.4} roughness={0.15} clearcoat={1.0} clearcoatRoughness={0.05} />
      </instancedMesh>
      <instancedMesh ref={thoraxRef} args={[null, null, 20]}>
        <sphereGeometry args={[0.25, 12, 12]} />
        <meshPhysicalMaterial color="#1f1f1f" metalness={0.6} roughness={0.15} clearcoat={1.0} clearcoatRoughness={0.05} />
      </instancedMesh>
      <instancedMesh ref={headRef} args={[null, null, 20]}>
        <sphereGeometry args={[0.18, 12, 12]} />
        <meshPhysicalMaterial color="#0a0a0a" metalness={0.6} roughness={0.1} clearcoat={1.0} clearcoatRoughness={0.05} />
      </instancedMesh>
      <instancedMesh ref={wingLRef} args={[wingGeo, null, 20]}>
        <meshPhysicalMaterial color="#ffffff" transmission={0.95} opacity={1} metalness={0.1} roughness={0.02} ior={1.1} transparent={true} side={THREE.DoubleSide} />
      </instancedMesh>
      <instancedMesh ref={wingRRef} args={[wingGeo, null, 20]}>
        <meshPhysicalMaterial color="#ffffff" transmission={0.95} opacity={1} metalness={0.1} roughness={0.02} ior={1.1} transparent={true} side={THREE.DoubleSide} />
      </instancedMesh>
    </group>
  );
}

function MicroView({ setGameState, state, setState }) {
  const { gl, scene } = useThree();
  const gameStats = useRef({ stamina: 100, nectar: 0, pollen: 0, resin: 0 });
  const microStateRef = useRef({ playerPosition: new THREE.Vector3(0, 0, 0), inWeb: false, waspHit: 0 });
  const [nodes, setNodes] = useState([]);
  const [hazards, setHazards] = useState([]);
  const waspsRef = useRef([]);

  // Removed garbage collection that forced WebGL context loss causing global black screen

  const treeData = React.useMemo(() => {
    const rng = seededRandom(42);
    const trees = [];
    const trunkColors = ['#302018', '#3d2914', '#2a1e10', '#40301e', '#1e1408'];
    const canopyColors = ['#0f3014', '#154020', '#0a2510', '#1a4a25', '#0d3518'];
    for (let i = 0; i < 50; i++) {
      const x = (rng() - 0.5) * 70;
      const z = -rng() * 80 - 10;
      const scale = 0.7 + rng() * 0.5;
      const trunkColor = trunkColors[Math.floor(rng() * trunkColors.length)];
      const canopyColor = canopyColors[Math.floor(rng() * canopyColors.length)];
      const canopySize = 6 + rng() * 4;
      const hasVines = rng() > 0.6;
      trees.push({ x, z, scale, trunkColor, canopyColor, canopySize, hasVines });
    }
    return trees;
  }, []);

  useEffect(() => {
    const generatedNodes = [];
    const generatedHazards = [];
    const generatedWasps = [];
    const rng = seededRandom(123);
    for (let i = 0; i < 60; i++) {
      const type = rng() < 0.5 ? 'nectar' : rng() < 0.8 ? 'pollen' : 'resin';
      generatedNodes.push({ id: i, type, pos: [(rng() - 0.5) * 35, rng() * 12 + 3, -rng() * 80 - 10] });
      if (i % 5 === 0) {
        generatedHazards.push({ id: `web-${i}`, pos: [(rng() - 0.5) * 35, rng() * 12 + 3, -rng() * 80 - 10] });
      }
      if (i % 6 === 0) {
        const baseX = (rng() - 0.5) * 30;
        generatedWasps.push({
          id: i,
          pos: new THREE.Vector3(baseX, rng() * 15 + 5, -rng() * 70 - 15),
          dir: rng() > 0.5 ? 1 : -1,
          speed: 8 + rng() * 6,
          bounds: { min: baseX - 15, max: baseX + 15 }
        });
      }
    }
    setNodes(generatedNodes);
    setHazards(generatedHazards);
    waspsRef.current = generatedWasps;
  }, []);

  useFrame(() => {
    if (!microStateRef.current.playerPosition) return;
    const pPos = microStateRef.current.playerPosition;

    // Collect resources calculation (ref-only to avoid massive re-renders)
    setNodes(prev => {
      let remaining = [];
      let collectedNodes = false;
      for (const node of prev) {
        const distSq = (pPos.x - node.pos[0]) ** 2 + (pPos.y - node.pos[1]) ** 2 + (pPos.z - node.pos[2]) ** 2;
        if (distSq < 4) {
          gameStats.current[node.type] += 2.5;
          collectedNodes = true;
          if (node.type === 'nectar') gameStats.current.stamina = Math.min(100, gameStats.current.stamina + 20);
        } else {
          remaining.push(node);
        }
      }
      if (collectedNodes) audioManager.playCollectSFX();
      return collectedNodes ? remaining : prev;
    });

    let hitWeb = false;
    for (const h of hazards) {
      const dx = Math.abs(pPos.x - h.pos[0]);
      const dy = Math.abs(pPos.y - h.pos[1]);
      const dz = Math.abs(pPos.z - h.pos[2]);
      if (dx < 2.5 && dy < 2.5 && dz < 2) {
        hitWeb = true; break;
      }
    }

    if (hitWeb && !microStateRef.current.inWeb) audioManager.playWebSFX();
    microStateRef.current.inWeb = hitWeb;

    // Fast moving Wasp Collision
    if (microStateRef.current.waspHit <= 0) {
      for (const w of waspsRef.current) {
        // tighter bounding box check
        const dx = Math.abs(pPos.x - w.pos.x);
        const dy = Math.abs(pPos.y - w.pos.y);
        const dz = Math.abs(pPos.z - w.pos.z);
        if (dx < 1.5 && dy < 1.5 && dz < 1.5) {
          audioManager.playHitSFX();
          gameStats.current.stamina = Math.max(0, gameStats.current.stamina - 15); // Reduced from 25
          microStateRef.current.waspHit = 0.5; // iFrames and knockback duration
          break;
        }
      }
    }

    // Direct DOM HUD Update
    const stamEl = document.getElementById('hud-stamina-bar');
    if (stamEl) stamEl.style.width = `${Math.max(0, gameStats.current.stamina)}%`;
    const necEl = document.getElementById('hud-nectar');
    if (necEl) necEl.innerText = Math.floor(gameStats.current.nectar);
    const polEl = document.getElementById('hud-pollen');
    if (polEl) polEl.innerText = Math.floor(gameStats.current.pollen);
    const resEl = document.getElementById('hud-resin');
    if (resEl) resEl.innerText = Math.floor(gameStats.current.resin);

    if (gameStats.current.stamina <= 0 || pPos.z <= -80) {
      handleExit(gameStats.current.stamina <= 0);
    }
  });

  const isExiting = useRef(false);
  const handleExit = () => {
    if (isExiting.current) return;
    isExiting.current = true;

    setState(prev => ({
      ...prev,
      resources: {
        nectar: prev.resources.nectar + gameStats.current.nectar,
        pollen: prev.resources.pollen + gameStats.current.pollen,
        resin: prev.resources.resin + gameStats.current.resin
      }
    }));
    setGameState('macro');
  };

  return (
    <>
      <color attach="background" args={['#020d08']} />
      <fog attach="fog" args={['#020d08', 20, 100]} />
      <Environment preset="forest" />
      <ambientLight intensity={0.35} color="#8fbc8f" />
      <directionalLight position={[10, 40, 20]} intensity={2.5} color="#fff8e1" castShadow shadow-mapSize={[1024, 1024]} shadow-camera-far={80} shadow-camera-left={-30} shadow-camera-right={30} shadow-camera-top={30} shadow-camera-bottom={-30} />
      <spotLight position={[5, 35, -30]} angle={0.2} penumbra={1} intensity={15} color="#fef3c7" />
      <spotLight position={[-8, 35, -100]} angle={0.15} penumbra={1} intensity={12} color="#d4edda" />

      <InstancedWasps waspsRef={waspsRef} />

      <MicroBeePlayer position={[0, 5, 0]} gameStats={gameStats} stateRef={microStateRef} activeCrisis={state.activeCrisis} treeData={treeData} />

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, -45]} receiveShadow>
        <planeGeometry args={[100, 150]} />
        <meshStandardMaterial color="#0a1f0d" roughness={1} />
      </mesh>

      {/* Ramón Tree Exit (Glowing Goal) */}
      <group position={[0, 0, -85]}>
        <mesh position={[0, 10, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[6, 8, 30]} />
          <meshStandardMaterial color="#2c1a12" roughness={1} />
        </mesh>
        <mesh position={[0, 28, 0]}>
          <sphereGeometry args={[15, 32, 32]} />
          <meshStandardMaterial color="#fcd34d" emissive="#fbbf24" emissiveIntensity={0.6} roughness={0.8} />
        </mesh>
        <pointLight position={[0, 25, 0]} color="#fbbf24" intensity={80} distance={60} decay={2} />
      </group>

      <InstancedTrees treeData={treeData} />
      <InstancedResources nodes={nodes} />
      <InstancedHazards hazards={hazards} />
    </>
  );
}

function InstancedFlies({ fliesRef }) {
  const meshRef = useRef();
  const eyeLRef = useRef();
  const eyeRRef = useRef();

  useFrame(() => {
    if (!meshRef.current || !eyeLRef.current || !eyeRRef.current) return;
    const dummy = new THREE.Object3D();
    const lDummy = new THREE.Object3D();
    const rDummy = new THREE.Object3D();

    for (let i = 0; i < 150; i++) {
      const fly = fliesRef.current[i];
      if (fly && fly.active) {
        dummy.position.set(fly.pos.x, fly.pos.y, fly.pos.z);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(i, dummy.matrix);

        lDummy.copy(dummy);
        lDummy.translateX(-0.15).translateY(0.1).translateZ(0.3);
        lDummy.updateMatrix();
        eyeLRef.current.setMatrixAt(i, lDummy.matrix);

        rDummy.copy(dummy);
        rDummy.translateX(0.15).translateY(0.1).translateZ(0.3);
        rDummy.updateMatrix();
        eyeRRef.current.setMatrixAt(i, rDummy.matrix);
      } else {
        dummy.scale.set(0, 0, 0);
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(i, dummy.matrix);
        eyeLRef.current.setMatrixAt(i, dummy.matrix);
        eyeRRef.current.setMatrixAt(i, dummy.matrix);
      }
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
    eyeLRef.current.instanceMatrix.needsUpdate = true;
    eyeRRef.current.instanceMatrix.needsUpdate = true;
  });

  const [geometry] = useState(() => new THREE.SphereGeometry(0.4, 16, 16));
  const [material] = useState(() => new THREE.MeshStandardMaterial({ color: "#050505", roughness: 0.5 }));
  const [eyeGeo] = useState(() => new THREE.SphereGeometry(0.1, 8, 8));
  const [eyeMat] = useState(() => new THREE.MeshStandardMaterial({ color: "#f00", emissive: "#f00" }));

  return (
    <group>
      <instancedMesh ref={meshRef} args={[geometry, material, 150]} castShadow />
      <instancedMesh ref={eyeLRef} args={[eyeGeo, eyeMat, 150]} />
      <instancedMesh ref={eyeRRef} args={[eyeGeo, eyeMat, 150]} />
    </group>
  );
}

// ------------------------------------------------------------------------------------------------
// DETAILED DEFENSE BEE MODEL 
// ------------------------------------------------------------------------------------------------
export function DetailedDefenseBee({ parentRef, faceCamera = false }) {
  const innerGroupRef = useRef();
  const wingRRef = useRef();
  const wingLRef = useRef();

  useFrame((state) => {
    if (wingRRef.current && wingLRef.current) {
      const wingFlap = Math.sin(state.clock.elapsedTime * 80) * 0.5;
      wingRRef.current.rotation.z = wingFlap * 0.3;
      wingLRef.current.rotation.z = -wingFlap * 0.3;
    }
    if (innerGroupRef.current) {
      innerGroupRef.current.position.y = Math.sin(state.clock.elapsedTime * 5) * 0.1;
    }
  });

  useEffect(() => {
    if (!innerGroupRef.current) return;
    const bee = innerGroupRef.current;
    while (bee.children.length > 0) { bee.remove(bee.children[0]); }

    const darkAmberMat = new THREE.MeshPhysicalMaterial({ color: 0x5c3a21, emissive: 0x000000, metalness: 0.3, roughness: 0.1, clearcoat: 1.0, clearcoatRoughness: 0.05 });
    const darkChitinMat = new THREE.MeshPhysicalMaterial({ color: 0x0f0f0f, emissive: 0x000000, metalness: 0.5, roughness: 0.15, clearcoat: 1.0, clearcoatRoughness: 0.05 });
    const wingMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, transmission: 0.95, opacity: 1, metalness: 0.1, roughness: 0.02, ior: 1.1, transparent: true, side: THREE.DoubleSide });

    // Abdomen
    const abdomen = new THREE.Group();
    for (let i = 0; i < 4; i++) {
      const slice = new THREE.Mesh(
        new THREE.CylinderGeometry(0.38 - i * 0.03, 0.4 - i * 0.02, 0.18, 32),
        i % 2 === 0 ? darkAmberMat : darkChitinMat
      );
      slice.rotation.x = Math.PI / 2;
      slice.position.z = i * 0.18;
      slice.castShadow = true;
      abdomen.add(slice);
    }
    const endCap = new THREE.Mesh(new THREE.SphereGeometry(0.29, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), darkChitinMat);
    endCap.rotation.x = Math.PI / 2;
    endCap.position.z = 3 * 0.18 + 0.09;
    endCap.castShadow = true;
    abdomen.add(endCap);
    abdomen.position.set(0, 0, 0.35);
    abdomen.scale.set(1.1, 0.85, 0.8);
    bee.add(abdomen);

    // Thorax
    const thorax = new THREE.Mesh(new THREE.SphereGeometry(0.35, 32, 32), darkChitinMat);
    thorax.scale.z = 1.1;
    thorax.castShadow = true;
    bee.add(thorax);

    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 32, 32), darkChitinMat);
    head.position.set(0, -0.05, -0.45);
    head.castShadow = true;
    bee.add(head);

    // Eyes
    const eyeMat = new THREE.MeshPhysicalMaterial({ color: 0x050505, roughness: 0.1, clearcoat: 1.0 });
    const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), eyeMat);
    eyeR.position.set(0.16, 0.05, -0.5);
    bee.add(eyeR);
    const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), eyeMat);
    eyeL.position.set(-0.16, 0.05, -0.5);
    bee.add(eyeL);

    // Antennae
    const antGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.25);
    antGeo.translate(0, 0.12, 0);
    const antR = new THREE.Mesh(antGeo, darkChitinMat);
    antR.position.set(0.08, 0.08, -0.6);
    antR.rotation.x = Math.PI / 2.5;
    antR.rotation.z = -Math.PI / 8;
    bee.add(antR);
    const antL = new THREE.Mesh(antGeo.clone(), darkChitinMat);
    antL.position.set(-0.08, 0.08, -0.6);
    antL.rotation.x = Math.PI / 2.5;
    antL.rotation.z = Math.PI / 8;
    bee.add(antL);

    // Wings
    const wingGeo = new THREE.BoxGeometry(0.9, 0.005, 0.35);
    wingGeo.translate(0.45, 0, 0);
    const wingR = new THREE.Mesh(wingGeo, wingMat);
    wingR.position.set(0.25, 0.15, -0.1);
    wingR.rotation.x = Math.PI / 12;
    wingR.rotation.y = -0.3;
    bee.add(wingR);
    wingRRef.current = wingR;

    const wingGeoL = new THREE.BoxGeometry(0.9, 0.005, 0.35);
    wingGeoL.translate(0.45, 0, 0);
    const wingL = new THREE.Mesh(wingGeoL, wingMat);
    wingL.position.set(-0.25, 0.15, -0.1);
    wingL.rotation.x = Math.PI / 12;
    wingL.rotation.y = 0.3 + Math.PI;
    bee.add(wingL);
    wingLRef.current = wingL;

    // Legs
    const legPositions = [
      { x: 0.2, z: -0.2 }, { x: -0.2, z: -0.2 },
      { x: 0.25, z: 0.05 }, { x: -0.25, z: 0.05 },
      { x: 0.22, z: 0.3 }, { x: -0.22, z: 0.3 }
    ];
    for (const lp of legPositions) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.008, 0.25, 6), darkChitinMat);
      leg.position.set(lp.x, -0.15, lp.z);
      leg.rotation.z = lp.x > 0 ? 0.6 : -0.6;
      leg.rotation.x = 0.2;
      bee.add(leg);
    }

    // Defensive Mandibles
    const mandibleR = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.3, 16), darkChitinMat.clone());
    mandibleR.position.set(0.15, -0.1, -0.6);
    mandibleR.rotation.x = Math.PI / 2;
    mandibleR.rotation.z = Math.PI / 6;
    bee.add(mandibleR);

    const mandibleL = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.3, 16), darkChitinMat.clone());
    mandibleL.position.set(-0.15, -0.1, -0.6);
    mandibleL.rotation.x = Math.PI / 2;
    mandibleL.rotation.z = -Math.PI / 6;
    bee.add(mandibleL);

  }, []);

  return (
    <group ref={parentRef}>
      <group ref={innerGroupRef} rotation={[0, faceCamera ? Math.PI : 0, 0]} scale={[1.6, 1.6, 1.6]} />
    </group>
  );
}



// ------------------------------------------------------------------------------------------------
// DEFENSE MODE (3D Action Minigame)
// ------------------------------------------------------------------------------------------------
function DefenseMode({ setGameState, state, setState }) {
  const [timeLeft, setTimeLeft] = useState(30);
  const fliesRef = useRef([]);
  const beeRef = useRef();
  const mousePosRef = useRef(new THREE.Vector2());
  const defenseStats = useRef({ beesLost: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      mousePosRef.current.set(
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1
      );
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const spawner = setInterval(() => {
      const idx = fliesRef.current.findIndex(f => !f.active);
      const startX = (Math.random() - 0.5) * 40;
      const startY = (Math.random() - 0.5) * 40;
      const newFly = {
        pos: new THREE.Vector3(startX, startY, 40), // Spawn behind the camera (into the screen)
        speed: 6 + Math.random() * 8, // Made them substantially faster
        active: true,
        wiggleOffset: Math.random() * Math.PI * 2
      };
      if (idx !== -1) fliesRef.current[idx] = newFly;
      else if (fliesRef.current.length < 100) fliesRef.current.push(newFly);
    }, 450); // Increased spawn rate drastically
    return () => clearInterval(spawner);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(t => {
        const newTime = t - 1;
        const domEl = document.getElementById('defense-time');
        if (domEl) domEl.innerText = newTime;

        if (newTime <= 0) {
          setState(prev => ({
            ...prev,
            invasionThreat: 0,
            activeCrisis: null,
            population: { ...prev.population, total: Math.max(0, prev.population.total - defenseStats.current.beesLost) }
          }));
          setGameState('macro');
        }
        return newTime;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [setGameState, setState]);

  const [isBiting, setIsBiting] = useState(false);
  const [isBlocking, setIsBlocking] = useState(false);

  const biteRef = useRef(false);
  const blockRef = useRef(false);
  const keys = useRef({});

  useEffect(() => {
    const handleDown = (e) => {
      keys.current[e.code] = true;
      if (e.type === 'mousedown') {
        if (e.button === 2) { setIsBlocking(true); blockRef.current = true; }
        else if (e.button === 0) triggerBite();
      } else if (e.type === 'keydown') {
        if (e.code === 'Space') triggerBite();
        if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') { setIsBlocking(true); blockRef.current = true; }
      }
    };
    const handleUp = (e) => {
      keys.current[e.code] = false;
      if (e.type === 'mouseup' && e.button === 2) { setIsBlocking(false); blockRef.current = false; }
      if (e.type === 'keyup' && (e.code === 'ShiftLeft' || e.code === 'ShiftRight')) { setIsBlocking(false); blockRef.current = false; }
    };

    const triggerBite = () => {
      audioManager.playBiteSFX();
      setIsBiting(true);
      biteRef.current = true;
      setTimeout(() => { setIsBiting(false); biteRef.current = false; }, 200);
      // Collisions are handled inside useFrame so motion overlap is caught
    };

    window.addEventListener('mousedown', handleDown);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('keydown', handleDown);
    window.addEventListener('keyup', handleUp);

    const preventContext = (e) => e.preventDefault();
    window.addEventListener('contextmenu', preventContext);

    return () => {
      window.removeEventListener('mousedown', handleDown);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('keydown', handleDown);
      window.removeEventListener('keyup', handleUp);
      window.removeEventListener('contextmenu', preventContext);
    };
  }, []);

  useFrame((stateObj, delta) => {
    const mousePos = mousePosRef.current;
    if (beeRef.current) {
      const moveSpeed = 1.0;
      if (keys.current['KeyW']) mousePos.y = Math.min(1, mousePos.y + moveSpeed * delta);
      if (keys.current['KeyS']) mousePos.y = Math.max(-1, mousePos.y - moveSpeed * delta);
      if (keys.current['KeyA']) mousePos.x = Math.max(-1, mousePos.x - moveSpeed * delta);
      if (keys.current['KeyD']) mousePos.x = Math.min(1, mousePos.x + moveSpeed * delta);

      beeRef.current.position.x += (mousePos.x * 6 - beeRef.current.position.x) * 0.2;
      beeRef.current.position.y += (mousePos.y * 6 - beeRef.current.position.y) * 0.2;
      beeRef.current.position.z = 2; // Fixed depth

      const targetScaleX = blockRef.current ? 3.0 : (biteRef.current ? 2.0 : 1);
      const targetScaleY = blockRef.current ? 3.0 : (biteRef.current ? 2.0 : 1);
      const targetScaleZ = biteRef.current ? 2.0 : 1.0;

      beeRef.current.scale.lerp(new THREE.Vector3(targetScaleX, targetScaleY, targetScaleZ), 0.3);

      let emissiveHex = 0x000000;
      let emissiveInt = 0.0;
      if (blockRef.current) {
        emissiveHex = 0x331100; // Subtle block glow
        emissiveInt = 1.0;
      } else if (biteRef.current) {
        emissiveHex = 0xff0000; // Bright flash bite
        emissiveInt = 2.0;
      }

      beeRef.current.traverse((node) => {
        if (node.isMesh && node.material && node.material.emissive) {
          node.material.emissive.setHex(emissiveHex);
          node.material.emissiveIntensity = emissiveInt;
        }
      });
    }

    let beesLostCount = 0;
    const target = new THREE.Vector3(0, 0, -8);
    const time = stateObj.clock.getElapsedTime();

    let genesLost = false;

    fliesRef.current.forEach(fly => {
      if (!fly.active) return;

      const dir = new THREE.Vector3().subVectors(target, fly.pos).normalize();
      fly.pos.x += dir.x * fly.speed * delta;
      fly.pos.y += dir.y * fly.speed * delta;
      fly.pos.z += dir.z * fly.speed * delta;

      // Dynamic wiggle
      fly.pos.x += Math.sin(time * 6 + fly.wiggleOffset) * 0.15;
      fly.pos.y += Math.cos(time * 5 + fly.wiggleOffset) * 0.15;

      // Check Bite collisions (must be much closer now to actually hit them)
      if (biteRef.current && beeRef.current) {
        const dx = fly.pos.x - beeRef.current.position.x;
        const dy = fly.pos.y - beeRef.current.position.y;
        // Ignore depth for bite to make it a 2D-style hitbox since they both are roughly parallel
        const distSq = dx * dx + dy * dy;
        if (distSq <= 12) { // Formerly 40, now much tighter (radius ~3.5)
          fly.active = false;
          return;
        }
      }

      // Check Entrance Hit / Passing
      if (fly.pos.z <= -8 && fly.speed > 0) { // Moving forwards and hit back wall (entrance)
        // If blocking, check if the player's body physically covers the fly's impact point
        if (blockRef.current && beeRef.current) {
          const dx = fly.pos.x - beeRef.current.position.x;
          const dy = fly.pos.y - beeRef.current.position.y;
          const blockDist = Math.sqrt(dx * dx + dy * dy);

          if (blockDist < 4.8) { // Tightened block coverage
            fly.pos.z += 8;
            fly.speed *= -1.5; // Bounce off toward the camera
            return;
          }
        }
        genesLost = true;
        beesLostCount += 50;
        fly.active = false;
      }

      // Cleanup repelled flies that bounce past the camera
      if (fly.pos.z > 60) {
        fly.active = false;
      }
    });

    if (beesLostCount > 0) {
      defenseStats.current.beesLost += beesLostCount;
      const doc = document.getElementById('defense-pop');
      if (doc) doc.innerText = `${Math.max(0, state.population.total - defenseStats.current.beesLost)} bees`;
    }
  });

  return (
    <>
      <color attach="background" args={['#2a160b']} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[0, 10, 10]} intensity={1.5} color="#fff" />
      <pointLight position={[0, 0, 10]} intensity={5} distance={50} decay={2} castShadow />
      <spotLight position={[0, 10, 0]} intensity={8} penumbra={1} castShadow />

      {/* Massive Detailed Jobon */}
      <mesh position={[0, 0, -10]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
        <cylinderGeometry args={[12, 12, 5, 64]} />
        <meshStandardMaterial color="#2d1c10" roughness={1} bumpScale={0.1} />
      </mesh>

      {/* Entrance Hole */}
      <mesh position={[0, 0, -7.4]}>
        <circleGeometry args={[2.5, 32]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* Fully Modeled Detailed Player Bee */}
      <DetailedDefenseBee parentRef={beeRef} faceCamera={true} />

      <InstancedFlies fliesRef={fliesRef} />
    </>
  );
}

// ------------------------------------------------------------------------------------------------
// HARVEST MODE (3D Action Minigame)
// ------------------------------------------------------------------------------------------------
function HarvestSimulation({ setState }) {
  const { camera, gl, scene } = useThree();

  useEffect(() => {
    camera.position.set(0, 15, 0);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  const drainingPotsRef = useRef({});
  const beesRef = useRef();

  useFrame((state, delta) => {
    // Process continuous draining via mutable ref so useFrame doesn't capture stale closures
    let harvestedThisFrame = 0;

    for (const id in drainingPotsRef.current) {
      if (drainingPotsRef.current[id].active && !drainingPotsRef.current[id].complete) {
        drainingPotsRef.current[id].progress += delta * 1.5; // Drain speed (approx 0.6s to drain)

        // Render shrink over time
        if (drainingPotsRef.current[id].ref.current) {
          const p = Math.min(1.0, drainingPotsRef.current[id].progress);
          const scale = 1.0 - (p * 0.5); // Shrinks to 50%
          drainingPotsRef.current[id].ref.current.scale.set(scale, scale, scale);
          if (p % 0.2 < 0.05) { // periodic sound while draining
            audioManager.playCollectSFX();
          }
        }

        if (drainingPotsRef.current[id].progress >= 1.0) {
          drainingPotsRef.current[id].complete = true;
          drainingPotsRef.current[id].active = false;
          harvestedThisFrame += 10;

          if (drainingPotsRef.current[id].ref.current && drainingPotsRef.current[id].ref.current.material) {
            drainingPotsRef.current[id].ref.current.material.emissive.setHex(0x220a00);
          }
          showFloatingText("+10 Honey", drainingPotsRef.current[id].x, drainingPotsRef.current[id].y, "#fbbf24");
        }
      }
    }

    if (harvestedThisFrame > 0) {
      setState(prev => ({
        ...prev,
        resources: { ...prev.resources, honey: (prev.resources.honey || 0) + harvestedThisFrame }
      }));
    }

    // Animate Guard Bees with random unbounded flight
    if (beesRef.current) {
      beesRef.current.children.forEach(bee => {
        const u = bee.userData;

        // Complex random wandering paths mapping
        const getPos = (time) => {
          return new THREE.Vector3(
            Math.sin(time * u.speedX + u.offsetX) * u.rangeX + Math.cos(time * u.speedY * 0.5 + u.offsetY) * (u.rangeX * 0.5),
            2.0 + Math.sin(time * u.speedY + u.offsetY) * u.rangeY + Math.cos(time * 1.5 + u.offsetX) * 1.0,
            Math.cos(time * u.speedZ + u.offsetZ) * u.rangeZ + Math.sin(time * u.speedX * 0.7 + u.offsetX) * (u.rangeZ * 0.5)
          );
        };

        const t = state.clock.elapsedTime;
        const currentPos = getPos(t);
        const futurePos = getPos(t + 0.05);

        bee.position.copy(currentPos);
        bee.lookAt(futurePos);
      });
    }
  });

  const handlePointerDown = (id, ref, e) => {
    e.stopPropagation();
    if (!drainingPotsRef.current[id]) {
      drainingPotsRef.current[id] = { progress: 0 };
    }
    if (!drainingPotsRef.current[id].complete) {
      drainingPotsRef.current[id].active = true;
      drainingPotsRef.current[id].ref = ref;
      drainingPotsRef.current[id].x = e.clientX;
      drainingPotsRef.current[id].y = e.clientY;
    }
  };

  const handlePointerUp = (id, e) => {
    e.stopPropagation();
    if (drainingPotsRef.current[id]) {
      drainingPotsRef.current[id].active = false;
    }
  };

  const handleBroodClick = (e) => {
    e.stopPropagation();
    audioManager.playHitSFX();

    const ox = camera.position.x;
    const oz = camera.position.z;
    camera.position.x += (Math.random() - 0.5) * 2;
    camera.position.z += (Math.random() - 0.5) * 2;
    setTimeout(() => {
      camera.position.set(ox, 15, oz);
      camera.lookAt(0, 0, 0);
    }, 150);

    setState(prev => ({
      ...prev,
      population: { ...prev.population, total: Math.max(0, prev.population.total - 20) }
    }));

    showFloatingText("Careful! Damaged nursery!", e.clientX, e.clientY, "#ef4444");
  };

  const showFloatingText = (text, x, y, color) => {
    const el = document.createElement('div');
    el.innerText = text;
    el.style.position = 'absolute';
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.color = color;
    el.style.fontWeight = 'bold';
    el.style.fontSize = '1.25rem';
    el.style.pointerEvents = 'none';
    el.style.transition = 'all 1s ease-out';
    el.style.zIndex = '1000';
    el.style.textShadow = '0 2px 4px rgba(0,0,0,0.8)';
    document.body.appendChild(el);

    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(-30px)';
    }, 50);

    setTimeout(() => {
      if (document.body.contains(el)) document.body.removeChild(el);
    }, 1000);
  };

  const potsData = React.useMemo(() => {
    const data = [];
    const numClusters = 5;
    for (let c = 0; c < numClusters; c++) {
      const cx = (Math.random() - 0.5) * 12;
      const cz = (Math.random() - 0.5) * 8;
      // create 4-7 pots per cluster
      const potsInCluster = 4 + Math.floor(Math.random() * 3);
      for (let i = 0; i < potsInCluster; i++) {
        // Must avoid center brood
        const px = cx + (Math.random() - 0.5) * 4;
        const pz = cz + (Math.random() - 0.5) * 4;
        const distFromCenter = Math.sqrt(px * px + pz * pz);
        if (distFromCenter < 3.5) continue; // Keep clear of nursery

        data.push({
          pos: [px, 0.5 + Math.random() * 0.3, pz],
          rot: [Math.random() * 0.2 - 0.1, Math.random() * Math.PI, Math.random() * 0.2 - 0.1],
          scale: 0.6 + Math.random() * 0.4
        });
      }
    }
    // Also add some scattered perimeter pots
    for (let i = 0; i < 8; i++) {
      const radius = 5.0 + Math.random() * 3.5;
      const angle = Math.random() * Math.PI * 2;
      data.push({
        pos: [Math.cos(angle) * radius, 0.5 + Math.random() * 0.2, Math.sin(angle) * radius],
        rot: [Math.random() * 0.2 - 0.1, Math.random() * Math.PI, Math.random() * 0.2 - 0.1],
        scale: 0.6 + Math.random() * 0.5
      });
    }
    return data;
  }, []);

  const guardBeesData = React.useMemo(() => {
    const data = [];
    for (let i = 0; i < 20; i++) {
      data.push({
        offsetX: Math.random() * Math.PI * 2,
        offsetY: Math.random() * Math.PI * 2,
        offsetZ: Math.random() * Math.PI * 2,
        speedX: 0.3 + Math.random() * 0.8,
        speedY: 0.2 + Math.random() * 0.6,
        speedZ: 0.3 + Math.random() * 0.8,
        rangeX: 3 + Math.random() * 4, // Constrained to inside the box (width is 18, so -9 to 9)
        rangeY: 1 + Math.random() * 1.5,
        rangeZ: 3 + Math.random() * 3 // Constrained to inside the box (depth is 14, so -7 to 7)
      });
    }
    return data;
  }, []);

  return (
    <>
      <color attach="background" args={['#1a100a']} />
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 10, 5]} intensity={1.5} color="#fff1e6" castShadow />

      {/* Box */}
      <mesh position={[0, -0.5, 0]} receiveShadow>
        <boxGeometry args={[18, 1, 14]} />
        <meshStandardMaterial color="#362211" roughness={0.9} />
      </mesh>
      {/* Floor Batumen Smear (dark propolis floor base) */}
      <mesh position={[0, 0.01, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[17.8, 13.8]} />
        <meshStandardMaterial color="#1f0c03" roughness={1.0} />
      </mesh>

      <mesh position={[0, 1.5, -7]} receiveShadow>
        <boxGeometry args={[18, 4, 0.5]} />
        <meshStandardMaterial color="#3a2210" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.5, 7]} receiveShadow>
        <boxGeometry args={[18, 4, 0.5]} />
        <meshStandardMaterial color="#3a2210" roughness={0.9} />
      </mesh>
      <mesh position={[-9, 1.5, 0]} receiveShadow>
        <boxGeometry args={[0.5, 4, 14]} />
        <meshStandardMaterial color="#3a2210" roughness={0.9} />
      </mesh>
      <mesh position={[9, 1.5, 0]} receiveShadow>
        <boxGeometry args={[0.5, 4, 14]} />
        <meshStandardMaterial color="#3a2210" roughness={0.9} />
      </mesh>

      {/* Batumen Corner Seals (Stingless bees seal cracks with resin/mud) */}
      {[-8.7, 8.7].map(x =>
        [-6.7, 6.7].map(z => (
          <mesh key={`batumen-${x}-${z}`} position={[x, 1.5, z]} castShadow receiveShadow>
            <cylinderGeometry args={[0.6, 1.0, 4, 8]} />
            <meshStandardMaterial color="#1a0a03" roughness={1.0} />
          </mesh>
        ))
      )}

      {/* Brood */}
      <group scale={[1.8, 1.8, 1.8]}>
        {[...Array(6)].map((_, i) => (
          <mesh key={`brood-${i}`} position={[0, i * 0.4, 0]} rotation={[0, i * 0.5, 0]} onPointerDown={handleBroodClick}>
            <torusGeometry args={[1.5 - i * 0.2, 0.4, 16, 32]} />
            <meshStandardMaterial color="#d4b08c" roughness={0.6} metalness={0.1} />
          </mesh>
        ))}
        {/* Fill center to ensure it's easily clicked */}
        <mesh position={[0, 1.2, 0]} onPointerDown={handleBroodClick}>
          <cylinderGeometry args={[1.7, 1.7, 2.5, 16]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} color="#000" />
        </mesh>
      </group>

      {/* Guard Bees */}
      <group ref={beesRef}>
        {guardBeesData.map((b, i) => (
          <group key={`gbee-${i}`} userData={b} onPointerDown={handleBroodClick} scale={[0.4, 0.4, 0.4]}>
            <DetailedDefenseBee faceCamera={true} />
          </group>
        ))}
      </group>

      {/* Pots */}
      {potsData.map((pot, idx) => {
        const meshRef = useRef();
        return (
          <group key={`pot-${idx}`} position={pot.pos}>
            {/* Invisible Hitbox that never shrinks! */}
            <mesh
              onPointerDown={(e) => handlePointerDown(idx, meshRef, e)}
              onPointerUp={(e) => handlePointerUp(idx, e)}
              onPointerOut={(e) => handlePointerUp(idx, e)}
            >
              <sphereGeometry args={[1.5, 16, 16]} />
              <meshBasicMaterial transparent opacity={0.0} depthWrite={false} color="#000" />
            </mesh>

            {/* Visible organic cerumen pot (dynamically scales down when drained) */}
            <group
              ref={meshRef}
              scale={[pot.scale, pot.scale, pot.scale]}
              rotation={pot.rot}
            >
              <mesh castShadow receiveShadow position={[0, -0.2, 0]}>
                <cylinderGeometry args={[1.0, 0.7, 1.4, 16, 1]} />
                <meshPhysicalMaterial color="#3a1100" roughness={0.4} metalness={0.1} clearcoat={0.3} clearcoatRoughness={0.3} emissive="#100500" emissiveIntensity={0.5} />
              </mesh>
              {/* Top opening/rim of the vase */}
              <mesh castShadow receiveShadow position={[0, 0.5, 0]}>
                <sphereGeometry args={[1.0, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.65]} />
                <meshPhysicalMaterial color="#3a1100" roughness={0.4} metalness={0.1} clearcoat={0.3} clearcoatRoughness={0.3} emissive="#100500" emissiveIntensity={0.5} />
              </mesh>
              {/* Irregular cerumen/propolis clumps for realistic organic texture */}
              <mesh castShadow position={[0.7, 0.2, 0.5]}><sphereGeometry args={[0.35, 8, 8]} /><meshPhysicalMaterial color="#2d0a00" roughness={0.6} /></mesh>
              <mesh castShadow position={[-0.6, -0.4, 0.6]}><sphereGeometry args={[0.45, 8, 8]} /><meshPhysicalMaterial color="#2d0a00" roughness={0.6} /></mesh>
              <mesh castShadow position={[0.2, 0.4, -0.8]}><sphereGeometry args={[0.4, 8, 8]} /><meshPhysicalMaterial color="#2d0a00" roughness={0.6} /></mesh>
            </group>
          </group>
        );
      })}
    </>
  );
}

function HarvestMode({ setGameState, state, setState }) {
  return (
    <div className="w-full h-full relative cursor-crosshair">
      <Canvas shadows gl={{ toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.0 }}>
        <HarvestSimulation setState={setState} />
      </Canvas>
      <div className="absolute bottom-8 left-0 w-full flex justify-center pointer-events-none">
        <button
          onClick={() => setGameState('macro')}
          className="pointer-events-auto px-8 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-full text-xl shadow-[0_0_20px_rgba(217,119,6,0.5)] transition-all">
          Finish Harvest
        </button>
      </div>
      <div className="absolute top-8 left-8 pointer-events-none">
        <div className="bg-black/60 backdrop-blur-md p-6 rounded-xl border border-white/20 shadow-2xl">
          <h2 className="text-amber-400 font-black text-2xl font-serif">Harvest Mode</h2>
          <p className="text-slate-300 mt-2">CLICK AND HOLD the dark amber pots to drain them.</p>
          <p className="text-red-400 font-bold mt-1">Avoid touching the central spiral brood!</p>
          <div className="mt-4 text-3xl font-mono text-amber-300">🍯 {state.resources.honey || 0}</div>
        </div>
      </div>
    </div>
  );
}


// ------------------------------------------------------------------------------------------------
// MAIN APP COMPONENT
// ------------------------------------------------------------------------------------------------
export default function App() {
  const [showWebsite, setShowWebsite] = useState(true);
  const [gameState, setGameState] = useState('tutorial');
  const [isPaused, setIsPaused] = useState(false);

  // Pause with Escape key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.code === 'Escape' && !showWebsite && gameState !== 'tutorial' && gameState !== 'cutscene') {
        e.preventDefault();
        setIsPaused(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [showWebsite, gameState]);

  // Pause/resume audio
  useEffect(() => {
    if (isPaused) {
      try { audioManager.bgm.pause(); } catch (e) { }
    } else if (!showWebsite) {
      try { audioManager.bgm.play(); } catch (e) { }
    }
  }, [isPaused, showWebsite]);

  // Audio state observer
  useEffect(() => {
    if (!showWebsite) {
      audioManager.playBGM(gameState);
    } else {
      audioManager.playBGM(null);
    }
  }, [showWebsite, gameState]);
  const [state, setState] = useState({
    resources: { nectar: 0, pollen: 0, resin: 0, honey: 0 },
    population: { total: 500, foragers: 100, guards: 50, nurses: 350, max: 1000, jobones: 1 },
    villageRespect: 100,
    invasionThreat: 0,
    activeCrisis: null,
    crisisTimer: 0,
    currentCutscene: {
      video: "/audio/Drought_Stricken_Jungle_Video cutscene.mp4",
      narrative: "The Wrath of Chaac is upon the land. A brutal drought drains your stamina twice as fast in the canopy. Offer 100 Nectar to appease him.",
      nextState: 'macro'
    },
    _triggerNext: null,
    lang: 'EN',
    viewingProduct: false
  });

  // Extract from state for HUD purposes
  const staminaValueRef = useRef(100);

  return (
    <div className={`w-screen h-screen ${showWebsite ? 'overflow-auto' : 'overflow-hidden'} bg-black text-white relative select-none`}>
      {showWebsite ? (
        state.viewingProduct ? (
          <ProductPage 
            lang={state.lang}
            onBack={() => setState(prev => ({ ...prev, viewingProduct: false }))} 
          />
        ) : (
          <Website 
            lang={state.lang}
            setLang={(l) => setState(prev => ({ ...prev, lang: l }))}
            onPlayGame={(mode) => {
              if (mode === 'product') {
                const element = document.getElementById('donate');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
              } else {
                setShowWebsite(false);
              }
            }} 
          />
        )
      ) : (
        <>
          {gameState === 'victory' && (
            <VictoryScreen onRestart={() => window.location.reload()} />
          )}

          {gameState === 'tutorial' && (
            <CodexTutorial onStart={() => setGameState('macro')} />
          )}

          {gameState === 'cutscene' && (
            <CutsceneMode
              cutscene={state.currentCutscene}
              onComplete={() => setGameState(state.currentCutscene.nextState)}
            />
          )}

          {gameState === 'macro' && (
            <MacroView gameState={gameState} setGameState={setGameState} state={state} setState={setState} />
          )}

          {gameState === 'harvest' && (
            <HarvestMode setGameState={setGameState} state={state} setState={setState} />
          )}

          {gameState === 'micro' && (
            <>
              <Canvas shadows gl={{ toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }} camera={{ fov: 65 }}>
                <MicroView setGameState={setGameState} state={state} setState={setState} />
              </Canvas>
              {/* Micro HUD Overlay */}
              <div className="absolute top-0 left-0 w-full p-8 pointer-events-none flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div className="bg-black/60 backdrop-blur-md border border-white/20 p-6 rounded-xl shadow-2xl">
                    <h2 className="text-amber-400 font-black text-2xl mb-2 font-serif uppercase tracking-widest">Canopy Flight</h2>
                    <div className="text-slate-300 font-mono text-lg flex flex-col gap-1">
                      <span>[W] Forward · [S] Reverse</span>
                      <span>[A/D] Turn · [E] Ascend · [SHIFT] Descend</span>
                    </div>
                  </div>
                  {state.activeCrisis === 'wrath_of_chaac' && (
                    <div className="bg-orange-900/80 text-orange-200 px-6 py-2 rounded-full font-bold animate-bounce shadow-[0_0_20px_#ea580c]">
                      WRATH OF CHAAC: Double Stamina Drain!
                    </div>
                  )}
                  <div className="text-right flex flex-col items-end">
                    <div className="text-3xl font-black text-emerald-400 font-serif drop-shadow-md">GOAL: Reach Glowing Tree</div>
                    <div className="text-lg text-slate-300 mt-2 font-mono">Avoid spider webs to preserve speed</div>
                    <div className="flex gap-4 mt-4 bg-black/60 p-4 rounded-xl border border-white/20">
                      <div className="text-amber-400 text-xl font-bold font-mono">Nectar: <span id="hud-nectar">0</span></div>
                      <div className="text-emerald-400 text-xl font-bold font-mono">Pollen: <span id="hud-pollen">0</span></div>
                      <div className="text-red-400 text-xl font-bold font-mono">Resin: <span id="hud-resin">0</span></div>
                    </div>
                  </div>
                </div>
                <div className="w-full flex justify-center mt-auto pb-4 absolute bottom-0 left-0">
                  <div className="w-1/2 bg-black/80 rounded-full h-8 border border-white/20 overflow-hidden relative shadow-[0_0_20px_rgba(0,0,0,0.8)]">
                    <div id="hud-stamina-bar" className="h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-75" style={{ width: '100%' }}></div>
                    <div className="absolute inset-0 flex items-center justify-center font-bold text-white uppercase tracking-widest text-sm drop-shadow-md">Stamina</div>
                  </div>
                </div>
              </div>
            </>
          )}

          {gameState === 'mini_ixchel' && (
            <MiniIxchel setGameState={setGameState} state={state} setState={setState} />
          )}

          {gameState === 'mini_swarm' && (
            <MiniSwarm setGameState={setGameState} state={state} setState={setState} />
          )}

          {gameState === 'mini_chaac' && (
            <MiniChaac setGameState={setGameState} state={state} setState={setState} />
          )}

          {gameState === 'defense' && (
            <>
              <Canvas shadows gl={{ toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.0 }} camera={{ position: [0, 0, 10] }}>
                <DefenseMode setGameState={setGameState} state={state} setState={setState} />
              </Canvas>
              {/* Defense HUD Overlay */}
              <div className="absolute top-0 left-0 w-full h-full pointer-events-none flex flex-col pt-4">
                <div className="w-full flex-1 flex flex-col items-center">
                  <h1 className="text-4xl text-red-600 font-black font-serif drop-shadow-[0_5px_5px_rgba(0,0,0,1)] uppercase tracking-widest animate-pulse">Hive Under Attack!</h1>
                  <p className="text-base mt-2 bg-black/80 px-6 py-2 rounded-full border border-red-900/50 shadow-2xl tracking-wide font-mono text-amber-200">
                    <span className="text-white font-bold bg-slate-800 px-2 rounded">[SPACE/L-Click]</span> Bite &nbsp;&nbsp;&nbsp;
                    <span className="text-white font-bold bg-slate-800 px-2 rounded">[SHIFT/R-Click]</span> Block Entrance
                  </p>
                </div>

                <div className="w-full pb-12 px-12 flex justify-between items-end">
                  <div className="bg-black/80 border border-slate-700 px-8 py-4 rounded-2xl">
                    <p className="text-sm font-mono text-slate-400 mb-1">Time Remaining: <span id="defense-time">30</span>s</p>
                    <p className="text-sm font-mono text-slate-400 mb-1">Population Integrity</p>
                    <p className="text-4xl font-black text-emerald-400" id="defense-pop">{state.population.total} bees</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* Pause Button (visible during gameplay) */}
      {!showWebsite && gameState !== 'tutorial' && gameState !== 'cutscene' && !isPaused && (
        <button
          onClick={() => setIsPaused(true)}
          className="absolute top-4 right-4 z-50 bg-black/60 backdrop-blur-md border border-white/20 hover:border-white/40 text-white px-4 py-2 rounded-xl font-mono text-sm hover:bg-black/80 transition-all shadow-lg cursor-pointer"
        >
          ⏸ Pause
        </button>
      )}

      {/* Pause Overlay */}
      {isPaused && (
        <div className="absolute inset-0 z-[999] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}>
          <div className="bg-black/90 border-2 border-amber-700/60 rounded-2xl p-10 max-w-md text-center shadow-[0_0_80px_rgba(217,119,6,0.15)]">
            <h1 className="text-5xl text-amber-400 font-serif font-black mb-2">⏸ Paused</h1>
            <p className="text-slate-400 text-sm mb-8 font-mono">Game is paused</p>

            <div className="flex flex-col gap-4">
              <button
                onClick={() => setIsPaused(false)}
                className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xl rounded-xl border-2 border-emerald-400 hover:shadow-[0_0_25px_rgba(34,197,94,0.4)] transition-all cursor-pointer"
              >
                ▶ Resume
              </button>
              <button
                onClick={() => { setIsPaused(false); setGameState('macro'); }}
                className="px-8 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold text-base rounded-xl border border-slate-500 hover:border-slate-400 transition-all cursor-pointer"
              >
                🏠 Return to Village
              </button>
              <button
                onClick={() => { setIsPaused(false); setShowWebsite(true); setGameState('tutorial'); }}
                className="px-8 py-3 bg-red-900/60 hover:bg-red-800/80 text-red-200 font-bold text-base rounded-xl border border-red-700/50 hover:border-red-600 transition-all cursor-pointer"
              >
                ✕ Quit to Main Menu
              </button>
            </div>

            <p className="text-slate-600 text-xs mt-6 font-mono">Press ESC to resume</p>
          </div>
        </div>
      )}
    </div>
  );
}
