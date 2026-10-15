import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { audioManager } from './App';

// ============================================================================
// 1. TEARS OF IXCHEL — THE SACRED POLLINATION PATH
// ============================================================================

// Real Yucatán medicinal plants used with Melipona honey by the Maya
const SACRED_PLANTS = [
    {
        id: 0, name: 'Balché', scientific: 'Lonchocarpus violaceus',
        use: 'Sacred ceremonial bark — fermented with Melipona honey to create the ritual drink Balché, used in purification rites by the J-Men (Maya healer).',
        trunkColor: '#5C3317', crownColor: '#c77dba', glowColor: '#dda0dd',
        pos: [-12, 0, -12],
    },
    {
        id: 1, name: "K'uxub (Annatto)", scientific: 'Bixa orellana',
        use: 'Seeds mixed with Melipona honey as anti-inflammatory paste for wounds. The Maya also used Annatto as sacred red body paint (k\'uxub) in royal ceremonies.',
        trunkColor: '#6b3a2a', crownColor: '#e05533', glowColor: '#ff6644',
        pos: [12, 0, -12],
    },
    {
        id: 2, name: "Sak Nikte' (Plumeria)", scientific: 'Plumeria rubra',
        use: 'Flowers steeped in warm Melipona honey to reduce fevers. The Sak Nikte\' is the sacred flower of the Maya — a symbol of life, creation, and divine femininity.',
        trunkColor: '#8B7355', crownColor: '#fff0e0', glowColor: '#fff5ee',
        pos: [-12, 0, 12],
    },
    {
        id: 3, name: "Xa'an (Huano Palm)", scientific: 'Sabal yapa',
        use: "Young palm leaves combined with honey for wound poultices. The Xa'an palm's fronds also roof the traditional Jobón (log hive) houses that shelter the Melipona colonies.",
        trunkColor: '#3a5a2a', crownColor: '#66cc66', glowColor: '#90ee90',
        pos: [12, 0, 12],
    },
    {
        id: 4, name: 'Xunan Kab Honey', scientific: 'Melipona beecheii',
        use: 'The sacred stingless bee honey itself — applied directly to eyes for cataracts and conjunctivitis, and taken orally for respiratory ailments. The Maya consider it a divine gift from Ah Muzen Cab, the Bee God.',
        trunkColor: '#8B6914', crownColor: '#fbbf24', glowColor: '#ffdd44',
        pos: [0, 0, 0],
    },
];

const CEREMONY_ORDER = [0, 2, 1, 3, 4]; // Balché → Plumeria → Annatto → Xa'an → Honey

// Boundary stones generated once
const BOUNDARY_STONES = [...Array(16)].map((_, i) => {
    const angle = (i / 16) * Math.PI * 2;
    return { x: Math.cos(angle) * 19, z: Math.sin(angle) * 19, ry: Math.random() * 6 };
});

// Decorative grass patches generated once
const GRASS_PATCHES = [...Array(30)].map(() => ({
    x: (Math.random() - 0.5) * 36, z: (Math.random() - 0.5) * 36,
    s: 0.3 + Math.random() * 0.5, r: Math.random() * Math.PI
}));

function PollinationSimulation({ keysRef, onPollinate, currentStep, isWon }) {
    const beePos = useRef(new THREE.Vector3(0, 1.5, 15));
    const beeRef = useRef();
    const stunRef = useRef(0);
    const plantProgress = useRef(SACRED_PLANTS.map(() => 0));
    const targetRingRef = useRef();
    const enemiesRef = useRef([
        { x: -10, z: -10, tx: 10, tz: 10, speed: 4, phase: 0 },
        { x: 10, z: -10, tx: -10, tz: 10, speed: 5, phase: 0.5 },
        { x: 0, z: -15, tx: 0, tz: 15, speed: 3.5, phase: 0.25 },
    ]);
    const enemyGroupRefs = useRef([useRef(), useRef(), useRef()]);

    useFrame((state, delta) => {
        if (isWon) return;
        const t = state.clock.elapsedTime;

        // Stun
        if (stunRef.current > 0) {
            stunRef.current -= delta;
            if (beeRef.current) beeRef.current.scale.setScalar(0.6 + Math.sin(t * 25) * 0.3);
            return;
        }

        // Movement
        const speed = 16;
        if (keysRef.current['KeyW'] || keysRef.current['ArrowUp']) beePos.current.z -= speed * delta;
        if (keysRef.current['KeyS'] || keysRef.current['ArrowDown']) beePos.current.z += speed * delta;
        if (keysRef.current['KeyA'] || keysRef.current['ArrowLeft']) beePos.current.x -= speed * delta;
        if (keysRef.current['KeyD'] || keysRef.current['ArrowRight']) beePos.current.x += speed * delta;
        beePos.current.x = THREE.MathUtils.clamp(beePos.current.x, -18, 18);
        beePos.current.z = THREE.MathUtils.clamp(beePos.current.z, -18, 18);

        if (beeRef.current) {
            beeRef.current.position.lerp(beePos.current, 0.2);
            beeRef.current.scale.setScalar(1);
            // Gentle hover bob
            beeRef.current.position.y = 1.5 + Math.sin(t * 4) * 0.15;
        }

        // Check pollination proximity
        if (currentStep < CEREMONY_ORDER.length) {
            const targetPlant = SACRED_PLANTS[CEREMONY_ORDER[currentStep]];
            const dist = Math.sqrt(
                (beePos.current.x - targetPlant.pos[0]) ** 2 +
                (beePos.current.z - targetPlant.pos[2]) ** 2
            );
            if (dist < 4) {
                const idx = CEREMONY_ORDER[currentStep];
                plantProgress.current[idx] += delta * 28;
                if (plantProgress.current[idx] >= 100) {
                    plantProgress.current[idx] = 100;
                    onPollinate(idx);
                }
            }
        }

        // Animate target ring
        if (targetRingRef.current) {
            targetRingRef.current.material.opacity = 0.4 + Math.sin(t * 4) * 0.3;
            targetRingRef.current.rotation.z = t * 0.5;
        }

        // Move enemy patrols
        enemiesRef.current.forEach((e, i) => {
            const lerp = (Math.sin(t * (e.speed * 0.12) + e.phase * Math.PI * 2) + 1) / 2;
            e.currentX = e.x + (e.tx - e.x) * lerp;
            e.currentZ = e.z + (e.tz - e.z) * lerp;

            // Update mesh position directly
            const ref = enemyGroupRefs.current[i];
            if (ref && ref.current) {
                ref.current.position.x = e.currentX;
                ref.current.position.z = e.currentZ;
                ref.current.position.y = 1 + Math.sin(t * 3 + i) * 0.2;
            }

            // Collision
            const dist = Math.sqrt((beePos.current.x - e.currentX) ** 2 + (beePos.current.z - e.currentZ) ** 2);
            if (dist < 2.8 && stunRef.current <= 0) {
                stunRef.current = 1.2;
                if (currentStep < CEREMONY_ORDER.length) {
                    plantProgress.current[CEREMONY_ORDER[currentStep]] = 0;
                }
                try { audioManager.playHitSFX(); } catch (e2) { }
            }
        });

        // Update progress bar
        const bar = document.getElementById('ixchel-plant-progress');
        if (bar && currentStep < CEREMONY_ORDER.length) {
            bar.style.width = `${plantProgress.current[CEREMONY_ORDER[currentStep]]}%`;
        }
    });

    const currentTargetPlant = currentStep < CEREMONY_ORDER.length ? SACRED_PLANTS[CEREMONY_ORDER[currentStep]] : null;

    return (
        <>
            <color attach="background" args={['#071208']} />
            <fog attach="fog" args={['#071208', 25, 55]} />
            <Environment preset="forest" />
            <ambientLight intensity={0.35} color="#8fbc8f" />
            <directionalLight position={[10, 25, 10]} intensity={2.5} color="#fff8e1" castShadow shadow-mapSize={[1024, 1024]} shadow-camera-far={60} shadow-camera-left={-25} shadow-camera-right={25} shadow-camera-top={25} shadow-camera-bottom={-25} />
            <spotLight position={[5, 30, -10]} angle={0.2} penumbra={1} intensity={12} color="#fef3c7" />
            <spotLight position={[-8, 30, 10]} angle={0.15} penumbra={1} intensity={10} color="#d4edda" />
            <pointLight position={[0, 12, 0]} intensity={1.5} color="#ffdd99" distance={50} decay={1} />
            {/* Moonlight effect */}
            <pointLight position={[-15, 20, -15]} intensity={0.8} color="#aaccee" distance={60} decay={1} />

            {/* Rich jungle ground */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
                <planeGeometry args={[50, 50]} />
                <meshStandardMaterial color="#1a3812" roughness={0.95} />
            </mesh>
            {/* Lighter earth patches */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
                <circleGeometry args={[20, 48]} />
                <meshStandardMaterial color="#2a4a1e" roughness={0.9} transparent opacity={0.6} />
            </mesh>

            {/* Stone paths forming a cross */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
                <planeGeometry args={[1.8, 38]} />
                <meshStandardMaterial color="#6b6b5e" roughness={0.95} />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
                <planeGeometry args={[38, 1.8]} />
                <meshStandardMaterial color="#6b6b5e" roughness={0.95} />
            </mesh>
            {/* Path edges */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, 0.95]}>
                <planeGeometry args={[38, 0.15]} />
                <meshStandardMaterial color="#4a4a40" roughness={1} />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, -0.95]}>
                <planeGeometry args={[38, 0.15]} />
                <meshStandardMaterial color="#4a4a40" roughness={1} />
            </mesh>

            {/* Grass tufts */}
            {GRASS_PATCHES.map((g, i) => (
                <mesh key={`grass-${i}`} position={[g.x, g.s * 0.5, g.z]} rotation={[0, g.r, 0]}>
                    <coneGeometry args={[g.s * 0.3, g.s, 4]} />
                    <meshStandardMaterial color="#2e5a1a" roughness={0.9} />
                </mesh>
            ))}

            {/* Sacred Plants — richer 3D models */}
            {SACRED_PLANTS.map((plant) => {
                const isTarget = currentTargetPlant && currentTargetPlant.id === plant.id;
                const isCompleted = CEREMONY_ORDER.indexOf(plant.id) < currentStep;

                return (
                    <group key={`plant-${plant.id}`} position={plant.pos}>
                        {/* Root mound */}
                        <mesh position={[0, 0.15, 0]}>
                            <cylinderGeometry args={[0.8, 1.2, 0.3, 12]} />
                            <meshStandardMaterial color="#3a2a15" roughness={1} />
                        </mesh>
                        {/* Trunk */}
                        <mesh position={[0, 1.8, 0]} castShadow>
                            <cylinderGeometry args={[0.15, 0.4, 3.2, 8]} />
                            <meshStandardMaterial color={plant.trunkColor} roughness={0.85} />
                        </mesh>
                        {/* Branch 1 */}
                        <mesh position={[0.6, 2.8, 0.3]} rotation={[0.2, 0, 0.6]}>
                            <cylinderGeometry args={[0.06, 0.12, 1.5, 6]} />
                            <meshStandardMaterial color={plant.trunkColor} roughness={0.85} />
                        </mesh>
                        {/* Branch 2 */}
                        <mesh position={[-0.5, 2.6, -0.2]} rotation={[-0.2, 0, -0.5]}>
                            <cylinderGeometry args={[0.06, 0.12, 1.2, 6]} />
                            <meshStandardMaterial color={plant.trunkColor} roughness={0.85} />
                        </mesh>
                        {/* Flower crown — main */}
                        <mesh position={[0, 3.6, 0]}>
                            <dodecahedronGeometry args={[1.4, 1]} />
                            <meshStandardMaterial
                                color={isCompleted ? '#22c55e' : plant.crownColor}
                                emissive={isTarget ? plant.glowColor : (isCompleted ? '#22c55e' : '#111')}
                                emissiveIntensity={isTarget ? 0.8 : (isCompleted ? 0.4 : 0.05)}
                                roughness={0.35}
                            />
                        </mesh>
                        {/* Secondary flower clusters */}
                        <mesh position={[0.9, 3.2, 0.5]}>
                            <dodecahedronGeometry args={[0.7, 1]} />
                            <meshStandardMaterial
                                color={isCompleted ? '#22c55e' : plant.crownColor}
                                emissive={isTarget ? plant.glowColor : '#000'}
                                emissiveIntensity={isTarget ? 0.5 : 0}
                                roughness={0.4}
                            />
                        </mesh>
                        <mesh position={[-0.7, 3.0, -0.4]}>
                            <dodecahedronGeometry args={[0.6, 1]} />
                            <meshStandardMaterial
                                color={isCompleted ? '#22c55e' : plant.crownColor}
                                emissive={isTarget ? plant.glowColor : '#000'}
                                emissiveIntensity={isTarget ? 0.5 : 0}
                                roughness={0.4}
                            />
                        </mesh>

                        {/* Animated target ring */}
                        {isTarget && (
                            <mesh ref={targetRingRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.08, 0]}>
                                <ringGeometry args={[3.5, 4.2, 48]} />
                                <meshBasicMaterial color="#fbbf24" transparent opacity={0.6} side={THREE.DoubleSide} />
                            </mesh>
                        )}
                        {/* Completed ring */}
                        {isCompleted && (
                            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.07, 0]}>
                                <ringGeometry args={[3, 3.6, 32]} />
                                <meshBasicMaterial color="#22c55e" transparent opacity={0.5} side={THREE.DoubleSide} />
                            </mesh>
                        )}
                        {/* Strong target/ambient light */}
                        <pointLight
                            position={[0, 5, 0]}
                            color={isTarget ? '#fbbf24' : (isCompleted ? '#22c55e' : plant.glowColor)}
                            intensity={isTarget ? 5 : (isCompleted ? 2 : 0.8)}
                            distance={isTarget ? 15 : 10}
                            decay={2}
                        />
                    </group>
                );
            })}

            {/* Boundary stones */}
            {BOUNDARY_STONES.map((s, i) => (
                <mesh key={`stone-${i}`} position={[s.x, 0.25, s.z]} rotation={[0, s.ry, 0]} castShadow>
                    <boxGeometry args={[1.4, 0.5, 1.4]} />
                    <meshStandardMaterial color="#5e5e52" roughness={0.95} />
                </mesh>
            ))}

            {/* Player Melipona bee */}
            <group ref={beeRef} position={[0, 1.5, 15]}>
                {/* Body */}
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                    <capsuleGeometry args={[0.4, 1.0, 12, 12]} />
                    <meshStandardMaterial color="#1a1a1a" roughness={0.4} metalness={0.1} />
                </mesh>
                {/* Head */}
                <mesh position={[0, 0, -0.7]}>
                    <sphereGeometry args={[0.3, 10, 10]} />
                    <meshStandardMaterial color="#222" roughness={0.5} />
                </mesh>
                {/* Wings L */}
                <mesh position={[0.5, 0.3, 0]} rotation={[0.1, 0, 0.4]}>
                    <planeGeometry args={[0.8, 0.35]} />
                    <meshStandardMaterial color="#ccddff" transparent opacity={0.35} side={THREE.DoubleSide} />
                </mesh>
                {/* Wings R */}
                <mesh position={[-0.5, 0.3, 0]} rotation={[0.1, 0, -0.4]}>
                    <planeGeometry args={[0.8, 0.35]} />
                    <meshStandardMaterial color="#ccddff" transparent opacity={0.35} side={THREE.DoubleSide} />
                </mesh>
                {/* Player glow */}
                <pointLight color="#ffcc44" intensity={3} distance={6} decay={2} />
            </group>

            {/* Africanized bee patrols */}
            {enemiesRef.current.map((e, i) => (
                <group key={`enemy-${i}`} ref={enemyGroupRefs.current[i]} position={[e.x, 1, e.z]}>
                    <mesh rotation={[Math.PI / 2, 0, 0]}>
                        <capsuleGeometry args={[0.55, 1.2, 8, 12]} />
                        <meshStandardMaterial color="#cc8800" roughness={0.4} metalness={0.1} />
                    </mesh>
                    <mesh position={[0, 0.15, 0]}><cylinderGeometry args={[0.56, 0.56, 0.3, 12]} /><meshStandardMaterial color="#111" /></mesh>
                    <mesh position={[0, -0.25, 0]}><cylinderGeometry args={[0.56, 0.56, 0.3, 12]} /><meshStandardMaterial color="#111" /></mesh>
                    {/* Danger glow */}
                    <pointLight color="#ff3300" intensity={2} distance={6} decay={2} />
                    {/* Detection ring */}
                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.9, 0]}>
                        <ringGeometry args={[2.5, 2.8, 24]} />
                        <meshBasicMaterial color="#ff4444" transparent opacity={0.15} side={THREE.DoubleSide} />
                    </mesh>
                </group>
            ))}
        </>
    );
}

export function MiniIxchel({ setGameState, state, setState }) {
    const [timeLeft, setTimeLeft] = useState(90);
    const [currentStep, setCurrentStep] = useState(0);
    const [isWon, setIsWon] = useState(false);
    const [isLost, setIsLost] = useState(false);
    const [factText, setFactText] = useState('');
    const [showIntro, setShowIntro] = useState(true);
    const containerRef = useRef();
    const keysRef = useRef({});

    // Keyboard handler on the container div itself — guaranteed to work
    useEffect(() => {
        const down = (e) => {
            e.preventDefault();
            keysRef.current[e.code] = true;
        };
        const up = (e) => { keysRef.current[e.code] = false; };
        window.addEventListener('keydown', down);
        window.addEventListener('keyup', up);
        // Auto-focus the game
        if (containerRef.current) containerRef.current.focus();
        return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
    }, []);

    const handlePollinate = (plantId) => {
        const plant = SACRED_PLANTS.find(p => p.id === plantId);
        if (plant) setFactText(`🌿 ${plant.name} (${plant.scientific}): ${plant.use}`);
        try { audioManager.playCollectSFX(); } catch (e) { }

        setCurrentStep(prev => {
            const next = prev + 1;
            if (next >= CEREMONY_ORDER.length) {
                setIsWon(true);
                setTimeout(() => {
                    setState(s => ({ ...s, activeCrisis: null, population: { ...s.population, total: s.population.total + 200 } }));
                    setGameState('macro');
                }, 5000);
            }
            return next;
        });
    };

    useEffect(() => {
        if (isWon || showIntro) return;
        const t = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    setIsLost(true);
                    setState(s => ({ ...s, activeCrisis: null, villageRespect: Math.max(0, s.villageRespect - 40) }));
                    setTimeout(() => setGameState('macro'), 3000);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(t);
    }, [isWon, showIntro, setGameState, setState]);

    const targetPlant = currentStep < CEREMONY_ORDER.length ? SACRED_PLANTS[CEREMONY_ORDER[currentStep]] : null;

    // Intro screen
    if (showIntro) {
        return (
            <div ref={containerRef} tabIndex={0} className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #071208 0%, #0a1a0c 50%, #1a2e14 100%)' }}>
                <div className="bg-black/80 border-2 border-emerald-700 rounded-2xl p-10 max-w-xl text-center shadow-[0_0_60px_rgba(34,197,94,0.2)]">
                    <h1 className="text-4xl text-emerald-400 font-serif font-black mb-4">🌿 Tears of Ixchel</h1>
                    <h2 className="text-xl text-amber-300 font-serif mb-6">The Sacred Pollination Path</h2>

                    <div className="text-left space-y-3 mb-8 text-sm">
                        <p className="text-slate-300"><span className="text-emerald-400 font-bold">Mission:</span> A terrible infection blights the village elders. As the sacred Melipona bee, fly through the J-Men's medicinal garden and pollinate <span className="text-amber-300 font-bold">5 sacred healing plants</span> in the correct ceremonial order.</p>

                        <div className="bg-emerald-900/30 border border-emerald-800 rounded-lg p-3">
                            <p className="text-emerald-300 font-bold mb-2">📜 Controls:</p>
                            <p className="text-slate-300">• <span className="text-amber-200 font-mono font-bold">WASD</span> or <span className="text-amber-200 font-mono font-bold">Arrow Keys</span> — Fly your bee</p>
                            <p className="text-slate-300">• Hover near the <span className="text-amber-300">glowing golden plant</span> to pollinate it</p>
                            <p className="text-slate-300">• <span className="text-red-400">Avoid Africanized bee patrols</span> — they stun you and reset progress!</p>
                        </div>

                        <p className="text-slate-400 italic text-xs">Each pollinated plant reveals real Maya ethnobotanical knowledge.</p>
                    </div>

                    <button onClick={() => setShowIntro(false)} className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xl rounded-xl border-2 border-emerald-400 hover:shadow-[0_0_20px_rgba(34,197,94,0.5)] transition-all">
                        Begin the Ritual
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div ref={containerRef} tabIndex={0} className="w-full h-full relative bg-black outline-none" style={{ cursor: 'none' }}>
            <Canvas shadows camera={{ position: [0, 32, 20], fov: 48, near: 0.1, far: 200 }} gl={{ toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.3 }} dpr={[1, 2]}>
                <PollinationSimulation keysRef={keysRef} onPollinate={handlePollinate} currentStep={currentStep} isWon={isWon} />
            </Canvas>

            {/* HUD Panel */}
            <div className="absolute top-5 left-5 bg-black/90 px-5 py-4 rounded-xl border border-emerald-800 pointer-events-none max-w-sm shadow-[0_0_20px_rgba(0,0,0,0.8)]">
                <h2 className="text-xl text-emerald-400 font-serif font-black mb-2">🌿 Sacred Pollination</h2>

                <div className="flex items-center gap-4 mb-2">
                    <span className="text-lg text-red-400 font-mono font-bold">⏱ {timeLeft}s</span>
                    <span className="text-lg text-emerald-300 font-mono">Step {Math.min(currentStep + 1, CEREMONY_ORDER.length)}/{CEREMONY_ORDER.length}</span>
                </div>

                {targetPlant && (
                    <div className="bg-emerald-900/50 border border-emerald-700 rounded-lg px-3 py-2 mb-2">
                        <p className="text-amber-300 font-serif font-bold">▶ Fly to: {targetPlant.name}</p>
                        <p className="text-emerald-200/60 text-xs italic">{targetPlant.scientific}</p>
                    </div>
                )}

                <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
                    <div id="ixchel-plant-progress" className="h-full bg-gradient-to-r from-emerald-600 to-amber-400 transition-all duration-100" style={{ width: '0%' }}></div>
                </div>
                <p className="text-slate-500 text-xs mt-2 font-mono">WASD / Arrows to move • Hover near glowing plant</p>
            </div>

            {/* Controls reminder (right side) */}
            <div className="absolute top-5 right-5 bg-black/70 px-4 py-3 rounded-xl border border-slate-800 pointer-events-none">
                <div className="grid grid-cols-3 gap-1 w-20">
                    <div></div>
                    <div className="bg-slate-700 text-white text-center text-xs font-mono rounded py-1">W</div>
                    <div></div>
                    <div className="bg-slate-700 text-white text-center text-xs font-mono rounded py-1">A</div>
                    <div className="bg-slate-700 text-white text-center text-xs font-mono rounded py-1">S</div>
                    <div className="bg-slate-700 text-white text-center text-xs font-mono rounded py-1">D</div>
                </div>
            </div>

            {/* Educational Fact Panel */}
            {factText && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 max-w-2xl bg-black/95 border border-amber-600 rounded-xl px-8 py-4 pointer-events-none shadow-[0_0_30px_rgba(217,119,6,0.3)]">
                    <p className="text-amber-200 font-serif text-sm leading-relaxed">{factText}</p>
                </div>
            )}

            {isWon && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-emerald-900/20">
                    <div className="text-center">
                        <h2 className="text-5xl text-emerald-400 font-bold font-serif animate-bounce drop-shadow-[0_0_30px_rgba(34,197,94,0.8)]">The Salve is Complete!</h2>
                        <p className="text-xl text-emerald-200 mt-4 font-mono">Ixchel blesses the hive. +200 Population.</p>
                    </div>
                </div>
            )}

            {isLost && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-red-900/20">
                    <div className="text-center">
                        <h2 className="text-5xl text-red-500 font-bold font-serif animate-pulse">Time's Up!</h2>
                        <p className="text-xl text-red-300 mt-4 font-mono">The infection spreads. -40 Village Respect.</p>
                    </div>
                </div>
            )}
        </div>
    );
}


// ============================================================================
// 2. MINI SWARM (LARVA EVACUATION)
// ============================================================================

// Hive layout: rooms connected by corridors
const HIVE_WALLS = [
    // Outer boundary
    { x: 0, z: -25, w: 50, d: 1 },
    { x: 0, z: 25, w: 50, d: 1 },
    { x: -25, z: 0, w: 1, d: 50 },
    { x: 25, z: 0, w: 1, d: 50 },
    // Inner walls creating rooms/corridors
    { x: -10, z: -10, w: 1, d: 12 },
    { x: 10, z: -10, w: 1, d: 12 },
    { x: -10, z: 10, w: 1, d: 12 },
    { x: 10, z: 10, w: 1, d: 12 },
    // Horizontal dividers with gaps
    { x: -17, z: 0, w: 10, d: 0.8 },
    { x: 17, z: 0, w: 10, d: 0.8 },
    { x: 0, z: -16, w: 14, d: 0.8 },
    { x: 0, z: 16, w: 14, d: 0.8 },
];

const SAFE_ZONE = { x: 0, z: 0, radius: 4 };

function genLarvaePositions() {
    const spots = [
        [-18, -18], [18, -18], [-18, 18], [18, 18],
        [-20, 0], [20, 0], [0, -22], [0, 22],
        [-15, -15], [15, 15], [15, -15], [-15, 15],
        [-20, -10], [20, 10], [-10, -20], [10, 20],
    ];
    return spots.map((s, i) => ({ id: i, x: s[0], z: s[1], rescued: false }));
}

function genPatrols() {
    return [
        { x: -15, z: -15, tx: -15, tz: 15, speed: 6, phase: 0 },
        { x: 15, z: -15, tx: 15, tz: 15, speed: 5, phase: 0.3 },
        { x: -20, z: 0, tx: 20, tz: 0, speed: 7, phase: 0.5 },
        { x: 0, z: -20, tx: 0, tz: 20, speed: 6, phase: 0.7 },
        { x: -10, z: -10, tx: 10, tz: 10, speed: 8, phase: 0 },
        { x: 10, z: -10, tx: -10, tz: 10, speed: 7, phase: 0.4 },
    ];
}

function LarvaEvacSimulation({ onRescue, rescued, isLost }) {
    const keys = useRef({});
    const beePos = useRef(new THREE.Vector3(0, 0.5, 0));
    const beeRef = useRef();
    const carrying = useRef(null);
    const stunTimer = useRef(0);
    const larvaeRef = useRef(genLarvaePositions());
    const patrolsRef = useRef(genPatrols());
    const carriedLarvaRef = useRef();

    useEffect(() => {
        const down = (e) => { keys.current[e.code] = true; };
        const up = (e) => { keys.current[e.code] = false; };
        window.addEventListener('keydown', down);
        window.addEventListener('keyup', up);
        return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
    }, []);

    useFrame((state, delta) => {
        if (isLost) return;

        // Stun
        if (stunTimer.current > 0) {
            stunTimer.current -= delta;
            if (beeRef.current) {
                beeRef.current.scale.setScalar(0.4 + Math.sin(state.clock.elapsedTime * 25) * 0.3);
            }
            return;
        }

        // Movement
        const speed = 14;
        if (keys.current['KeyW']) beePos.current.z -= speed * delta;
        if (keys.current['KeyS']) beePos.current.z += speed * delta;
        if (keys.current['KeyA']) beePos.current.x -= speed * delta;
        if (keys.current['KeyD']) beePos.current.x += speed * delta;
        beePos.current.x = THREE.MathUtils.clamp(beePos.current.x, -24, 24);
        beePos.current.z = THREE.MathUtils.clamp(beePos.current.z, -24, 24);

        if (beeRef.current) {
            beeRef.current.position.lerp(beePos.current, 0.25);
            beeRef.current.scale.setScalar(1);
        }

        // Pick up larva
        if (carrying.current === null) {
            larvaeRef.current.forEach(larva => {
                if (larva.rescued) return;
                const dist = Math.sqrt((beePos.current.x - larva.x) ** 2 + (beePos.current.z - larva.z) ** 2);
                if (dist < 2) {
                    carrying.current = larva.id;
                    try { audioManager.playCollectSFX(); } catch (e) { }
                }
            });
        }

        // Deliver larva to safe zone
        if (carrying.current !== null) {
            const dist = Math.sqrt(beePos.current.x ** 2 + beePos.current.z ** 2);
            if (dist < SAFE_ZONE.radius) {
                larvaeRef.current[carrying.current].rescued = true;
                carrying.current = null;
                onRescue();
                try { audioManager.playCollectSFX(); } catch (e) { }
            }
        }

        // Update carried larva visual position
        if (carriedLarvaRef.current) {
            if (carrying.current !== null) {
                carriedLarvaRef.current.visible = true;
                carriedLarvaRef.current.position.set(beePos.current.x, 1.5, beePos.current.z);
            } else {
                carriedLarvaRef.current.visible = false;
            }
        }

        // Move patrols (ping-pong)
        const t = state.clock.elapsedTime;
        patrolsRef.current.forEach(p => {
            const lerp = (Math.sin(t * (p.speed * 0.15) + p.phase * Math.PI * 2) + 1) / 2;
            p.currentX = p.x + (p.tx - p.x) * lerp;
            p.currentZ = p.z + (p.tz - p.z) * lerp;
        });

        // Collision with patrols
        patrolsRef.current.forEach(p => {
            const dist = Math.sqrt((beePos.current.x - p.currentX) ** 2 + (beePos.current.z - p.currentZ) ** 2);
            if (dist < 2.5 && stunTimer.current <= 0) {
                // Drop larva
                if (carrying.current !== null) {
                    const larva = larvaeRef.current[carrying.current];
                    larva.x = beePos.current.x;
                    larva.z = beePos.current.z;
                    carrying.current = null;
                }
                stunTimer.current = 1.0;
                try { audioManager.playHitSFX(); } catch (e) { }
            }
        });

        // HUD
        const el = document.getElementById('swarm-rescued');
        if (el) el.innerText = `${rescued} / 10`;
    });

    return (
        <>
            <color attach="background" args={['#0d0804']} />
            <fog attach="fog" args={['#0d0804', 30, 60]} />
            <Environment preset="warehouse" />
            <ambientLight intensity={0.35} color="#ffcc88" />
            <directionalLight position={[8, 25, 8]} intensity={2.0} color="#ffe4b5" castShadow shadow-mapSize={[1024, 1024]} shadow-camera-far={60} shadow-camera-left={-25} shadow-camera-right={25} shadow-camera-top={25} shadow-camera-bottom={-25} />
            <spotLight position={[0, 30, 0]} angle={0.25} penumbra={1} intensity={15} color="#ffcc88" />
            <spotLight position={[-15, 25, 15]} angle={0.2} penumbra={1} intensity={8} color="#ffa040" />
            <pointLight position={[0, 15, 0]} intensity={2} color="#ffaa44" distance={60} decay={1} />

            {/* Hive floor (warm cerumen) */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
                <planeGeometry args={[50, 50]} />
                <meshStandardMaterial color="#3d2510" roughness={0.95} />
            </mesh>

            {/* Safe zone (center glow) */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
                <circleGeometry args={[SAFE_ZONE.radius, 32]} />
                <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.3} transparent opacity={0.4} />
            </mesh>
            <pointLight position={[0, 2, 0]} color="#22c55e" intensity={1.5} distance={8} decay={2} />

            {/* Walls */}
            {HIVE_WALLS.map((w, i) => (
                <mesh key={`wall-${i}`} position={[w.x, 1, w.z]} castShadow>
                    <boxGeometry args={[w.w, 2, w.d]} />
                    <meshStandardMaterial color="#5a3a1a" roughness={0.85} />
                </mesh>
            ))}

            {/* Larvae (white grubs on the floor) */}
            {larvaeRef.current.map(larva => !larva.rescued && (
                <group key={`larva-${larva.id}`} position={[larva.x, 0.3, larva.z]}>
                    <mesh rotation={[Math.PI / 2, 0, Math.random() * 3]}>
                        <capsuleGeometry args={[0.25, 0.6, 6, 8]} />
                        <meshStandardMaterial color="#fff8e7" roughness={0.3} emissive="#fff8e7" emissiveIntensity={0.15} />
                    </mesh>
                    {/* Pickup glow */}
                    <pointLight color="#ffe4b5" intensity={0.5} distance={3} decay={2} />
                </group>
            ))}

            {/* Carried larva (floats above bee) */}
            <mesh ref={carriedLarvaRef} visible={false} rotation={[Math.PI / 2, 0, 0]}>
                <capsuleGeometry args={[0.25, 0.6, 6, 8]} />
                <meshStandardMaterial color="#fff8e7" emissive="#fbbf24" emissiveIntensity={0.5} />
            </mesh>

            {/* Player nurse bee */}
            <group ref={beeRef} position={[0, 0.5, 0]}>
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                    <capsuleGeometry args={[0.4, 0.9, 12, 12]} />
                    <meshStandardMaterial color="#1a1a1a" roughness={0.5} />
                </mesh>
                {/* Wings */}
                <mesh position={[0.4, 0.3, 0]} rotation={[0, 0, 0.3]}>
                    <planeGeometry args={[0.6, 0.3]} />
                    <meshStandardMaterial color="#aaccff" transparent opacity={0.4} side={THREE.DoubleSide} />
                </mesh>
                <mesh position={[-0.4, 0.3, 0]} rotation={[0, 0, -0.3]}>
                    <planeGeometry args={[0.6, 0.3]} />
                    <meshStandardMaterial color="#aaccff" transparent opacity={0.4} side={THREE.DoubleSide} />
                </mesh>
                <pointLight color="#ffaa00" intensity={1} distance={4} decay={2} />
            </group>

            {/* Patrolling Apis mellifera */}
            {patrolsRef.current.map((p, i) => (
                <group key={`patrol-${i}`} position={[p.currentX || p.x, 0.5, p.currentZ || p.z]}>
                    <mesh rotation={[Math.PI / 2, 0, 0]}>
                        <capsuleGeometry args={[0.6, 1.4, 8, 12]} />
                        <meshStandardMaterial color="#eab308" roughness={0.5} />
                    </mesh>
                    {/* Black stripes */}
                    <mesh position={[0, 0.15, 0]}><cylinderGeometry args={[0.61, 0.61, 0.3, 12]} /><meshStandardMaterial color="#111" /></mesh>
                    <mesh position={[0, -0.25, 0]}><cylinderGeometry args={[0.61, 0.61, 0.3, 12]} /><meshStandardMaterial color="#111" /></mesh>
                    {/* Danger glow */}
                    <pointLight color="#ff4444" intensity={1} distance={5} decay={2} />
                    {/* Detection radius indicator */}
                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.4, 0]}>
                        <ringGeometry args={[2.3, 2.5, 24]} />
                        <meshBasicMaterial color="#ff4444" transparent opacity={0.15} side={THREE.DoubleSide} />
                    </mesh>
                </group>
            ))}
        </>
    );
}

export function MiniSwarm({ setGameState, state, setState }) {
    const [timeLeft, setTimeLeft] = useState(60);
    const [rescued, setRescued] = useState(0);
    const [isWon, setIsWon] = useState(false);
    const [isLost, setIsLost] = useState(false);

    const handleRescue = () => {
        setRescued(prev => {
            const next = prev + 1;
            if (next >= 10) {
                setIsWon(true);
                setTimeout(() => {
                    setState(s => ({ ...s, activeCrisis: null }));
                    setGameState('macro');
                }, 3000);
            }
            return next;
        });
    };

    useEffect(() => {
        if (isWon) return;
        const t = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    setIsLost(true);
                    setState(s => ({
                        ...s,
                        activeCrisis: null,
                        population: { ...s.population, total: Math.max(50, s.population.total - 100) }
                    }));
                    setTimeout(() => setGameState('macro'), 3000);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(t);
    }, [isWon, setGameState, setState]);

    return (
        <div className="w-full h-full relative bg-black">
            <Canvas shadows camera={{ position: [0, 40, 15], fov: 50, near: 0.1, far: 200 }} gl={{ toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }} dpr={[1, 2]}>
                <LarvaEvacSimulation onRescue={handleRescue} rescued={rescued} isLost={isLost} />
            </Canvas>

            {/* HUD */}
            <div className="absolute top-8 left-8 bg-black/80 px-8 py-4 rounded-xl border border-amber-900 pointer-events-none">
                <h2 className="text-3xl text-yellow-500 font-serif font-black mb-2">The Yellow Swarm</h2>
                <p className="text-slate-300 font-mono text-sm">WASD to move. Touch larvae to pick up. Deliver to green zone.</p>
                <p className="text-red-400 font-mono text-sm mt-1">Avoid yellow Apis patrols! Contact = drop larva + stun.</p>
                <div className="text-xl text-red-400 font-mono mt-4">Time Left: {timeLeft}s</div>
                <div className="text-2xl text-emerald-400 font-black font-mono mt-2">Rescued: <span id="swarm-rescued">{rescued} / 10</span></div>
            </div>

            {isWon && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                        <h2 className="text-6xl text-emerald-400 font-bold font-serif animate-bounce drop-shadow-[0_0_30px_rgba(34,197,94,0.8)]">Larvae Saved!</h2>
                        <p className="text-2xl text-emerald-200 mt-4 font-mono">The hive's future is secure.</p>
                    </div>
                </div>
            )}

            {isLost && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                        <h2 className="text-6xl text-red-500 font-bold font-serif animate-pulse drop-shadow-[0_0_30px_rgba(239,68,68,0.8)]">Time's Up!</h2>
                        <p className="text-2xl text-red-300 mt-4 font-mono">The swarm has taken its toll. -100 Population.</p>
                    </div>
                </div>
            )}
        </div>
    );
}



// ============================================================================
// 3. WRATH OF CHAAC — CLOUD SEEDING CHASE
// ============================================================================

// Pre-generated decorative elements
const EARTH_CRACKS = [...Array(25)].map(() => ({
    x: (Math.random() - 0.5) * 55, z: (Math.random() - 0.5) * 55,
    r: Math.random() * 6, w: 2 + Math.random() * 5, h: 0.12 + Math.random() * 0.2
}));

const DEAD_TREES = [...Array(10)].map(() => ({
    x: (Math.random() - 0.5) * 55, z: (Math.random() - 0.5) * 55,
    height: 2 + Math.random() * 2, r: Math.random() * 6
}));

const INIT_CLOUDS = [...Array(8)].map((_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 50, z: (Math.random() - 0.5) * 50, y: 8,
    vx: (Math.random() - 0.5) * 3, vz: (Math.random() - 0.5) * 3,
    scale: 2.5 + Math.random() * 2,
    seeded: false, seedProgress: 0,
}));

function RainParticles() {
    const count = 500;
    const meshRef = useRef();
    const positions = useMemo(() => {
        const arr = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            arr[i * 3] = (Math.random() - 0.5) * 80;
            arr[i * 3 + 1] = Math.random() * 35;
            arr[i * 3 + 2] = (Math.random() - 0.5) * 80;
        }
        return arr;
    }, []);

    useFrame((_, delta) => {
        if (!meshRef.current) return;
        const pos = meshRef.current.geometry.attributes.position;
        for (let i = 0; i < count; i++) {
            pos.array[i * 3 + 1] -= 45 * delta;
            if (pos.array[i * 3 + 1] < 0) pos.array[i * 3 + 1] = 35;
        }
        pos.needsUpdate = true;
    });

    return (
        <points ref={meshRef}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
            </bufferGeometry>
            <pointsMaterial color="#aaddff" size={0.2} transparent opacity={0.85} />
        </points>
    );
}

function ChaacSimulation({ keysRef, onSeed, seeded, isWon }) {
    const beePos = useRef(new THREE.Vector3(0, 1, 0));
    const beeRef = useRef();
    const cloudsRef = useRef(INIT_CLOUDS.map(c => ({ ...c })));
    const lightningRef = useRef([]);
    const stunRef = useRef(0);
    const skyColorRef = useRef(new THREE.Color('#6b3a10'));
    const bgRef = useRef();
    const lightningTimer = useRef(0);

    useFrame((state, delta) => {
        const t = state.clock.elapsedTime;

        if (isWon) {
            skyColorRef.current.lerp(new THREE.Color('#1e3a5f'), delta * 0.5);
            if (bgRef.current) bgRef.current.color.copy(skyColorRef.current);
            return;
        }

        // Stun
        if (stunRef.current > 0) stunRef.current -= delta;

        // Movement
        const speed = stunRef.current > 0 ? 5 : 18;
        if (keysRef.current['KeyW'] || keysRef.current['ArrowUp']) beePos.current.z -= speed * delta;
        if (keysRef.current['KeyS'] || keysRef.current['ArrowDown']) beePos.current.z += speed * delta;
        if (keysRef.current['KeyA'] || keysRef.current['ArrowLeft']) beePos.current.x -= speed * delta;
        if (keysRef.current['KeyD'] || keysRef.current['ArrowRight']) beePos.current.x += speed * delta;
        beePos.current.x = THREE.MathUtils.clamp(beePos.current.x, -30, 30);
        beePos.current.z = THREE.MathUtils.clamp(beePos.current.z, -30, 30);

        if (beeRef.current) {
            beeRef.current.position.lerp(beePos.current, 0.2);
            beeRef.current.position.y = 1 + Math.sin(t * 3.5) * 0.2;
            const s = stunRef.current > 0 ? 0.5 + Math.sin(t * 20) * 0.3 : 1;
            beeRef.current.scale.setScalar(s);
        }

        // Move clouds
        cloudsRef.current.forEach(cloud => {
            if (cloud.seeded) return;
            cloud.x += cloud.vx * delta;
            cloud.z += cloud.vz * delta;
            if (Math.abs(cloud.x) > 30) cloud.vx *= -1;
            if (Math.abs(cloud.z) > 30) cloud.vz *= -1;
        });

        // Cloud seeding
        cloudsRef.current.forEach(cloud => {
            if (cloud.seeded) return;
            const dist = Math.sqrt((beePos.current.x - cloud.x) ** 2 + (beePos.current.z - cloud.z) ** 2);
            if (dist < cloud.scale * 1.3) {
                cloud.seedProgress += delta * 22;
                if (cloud.seedProgress >= 100) {
                    cloud.seeded = true;
                    onSeed();
                    try { audioManager.playCollectSFX(); } catch (e) { }
                }
            } else {
                cloud.seedProgress = Math.max(0, cloud.seedProgress - delta * 8);
            }
        });

        // Spawn lightning
        lightningTimer.current -= delta;
        if (lightningTimer.current <= 0) {
            lightningTimer.current = 1.2 + Math.random() * 0.8;
            lightningRef.current.push({
                x: (Math.random() - 0.5) * 50,
                z: (Math.random() - 0.5) * 50,
                timer: 2.0, warned: false, struck: false
            });
            if (lightningRef.current.length > 12) {
                lightningRef.current = lightningRef.current.filter(l => l.timer > -0.5);
            }
        }

        // Lightning logic
        lightningRef.current.forEach(l => {
            l.timer -= delta;
            if (l.timer <= 0.8 && !l.warned) l.warned = true;
            if (l.timer <= 0 && !l.struck) {
                l.struck = true;
                const dist = Math.sqrt((beePos.current.x - l.x) ** 2 + (beePos.current.z - l.z) ** 2);
                if (dist < 4.5) {
                    stunRef.current = 1.5;
                    try { audioManager.playHitSFX(); } catch (e) { }
                }
            }
        });

        // HUD
        const el = document.getElementById('chaac-seeded');
        if (el) el.innerText = `${seeded} / 5`;
    });

    return (
        <>
            <color ref={bgRef} attach="background" args={['#6b3a10']} />
            <fog attach="fog" args={['#6b3a10', 35, 70]} />
            <Environment preset="sunset" />
            <ambientLight intensity={0.4} color="#ffa040" />
            <directionalLight position={[10, 25, 5]} intensity={2.5} color="#ff9933" castShadow shadow-mapSize={[1024, 1024]} shadow-camera-far={70} shadow-camera-left={-35} shadow-camera-right={35} shadow-camera-top={35} shadow-camera-bottom={-35} />
            <spotLight position={[15, 30, -20]} angle={0.2} penumbra={1} intensity={15} color="#ffaa44" />
            <spotLight position={[-10, 30, 20]} angle={0.18} penumbra={1} intensity={10} color="#ff8844" />
            <pointLight position={[0, 15, 0]} intensity={1.0} color="#ff8800" distance={50} decay={1} />

            {/* Dry parched ground */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[70, 70]} />
                <meshStandardMaterial color="#7a5a14" roughness={1.0} />
            </mesh>
            {/* Reddish earth overlay */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
                <circleGeometry args={[30, 48]} />
                <meshStandardMaterial color="#8B6914" roughness={0.95} transparent opacity={0.5} />
            </mesh>

            {/* Cracks */}
            {EARTH_CRACKS.map((c, i) => (
                <mesh key={`crack-${i}`} rotation={[-Math.PI / 2, 0, c.r]} position={[c.x, 0.02, c.z]}>
                    <planeGeometry args={[c.w, c.h]} />
                    <meshBasicMaterial color="#4a3010" />
                </mesh>
            ))}

            {/* Dead trees */}
            {DEAD_TREES.map((tr, i) => (
                <group key={`tree-${i}`} position={[tr.x, 0, tr.z]} rotation={[0, tr.r, 0]}>
                    <mesh position={[0, tr.height / 2, 0]} castShadow>
                        <cylinderGeometry args={[0.12, 0.35, tr.height, 6]} />
                        <meshStandardMaterial color="#3d2b1f" roughness={1.0} />
                    </mesh>
                    <mesh position={[0.5, tr.height * 0.75, 0]} rotation={[0, 0, 0.7]}>
                        <cylinderGeometry args={[0.05, 0.1, tr.height * 0.5, 5]} />
                        <meshStandardMaterial color="#3d2b1f" roughness={1.0} />
                    </mesh>
                    <mesh position={[-0.3, tr.height * 0.6, 0.2]} rotation={[0.3, 0, -0.6]}>
                        <cylinderGeometry args={[0.04, 0.08, tr.height * 0.35, 5]} />
                        <meshStandardMaterial color="#3d2b1f" roughness={1.0} />
                    </mesh>
                </group>
            ))}

            {/* Player bee swarm */}
            <group ref={beeRef} position={[0, 1, 0]}>
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                    <capsuleGeometry args={[0.4, 0.9, 10, 12]} />
                    <meshStandardMaterial color="#1a1a1a" roughness={0.4} metalness={0.1} />
                </mesh>
                <mesh position={[0, 0, -0.65]}>
                    <sphereGeometry args={[0.28, 8, 8]} />
                    <meshStandardMaterial color="#222" roughness={0.5} />
                </mesh>
                {/* Wings */}
                <mesh position={[0.5, 0.3, 0]} rotation={[0.1, 0, 0.4]}>
                    <planeGeometry args={[0.7, 0.3]} />
                    <meshStandardMaterial color="#ccddff" transparent opacity={0.35} side={THREE.DoubleSide} />
                </mesh>
                <mesh position={[-0.5, 0.3, 0]} rotation={[0.1, 0, -0.4]}>
                    <planeGeometry args={[0.7, 0.3]} />
                    <meshStandardMaterial color="#ccddff" transparent opacity={0.35} side={THREE.DoubleSide} />
                </mesh>
                {/* Swarm particles */}
                {[...Array(6)].map((_, i) => (
                    <mesh key={`sp-${i}`} position={[Math.sin(i * 1.05) * 0.9, Math.cos(i * 1.5) * 0.3, Math.cos(i * 1.05) * 0.9]}>
                        <sphereGeometry args={[0.12, 6, 6]} />
                        <meshStandardMaterial color="#111" />
                    </mesh>
                ))}
                <pointLight color="#ffaa00" intensity={3} distance={6} decay={2} />
            </group>

            {/* Clouds */}
            {cloudsRef.current.map((cloud) => (
                <group key={`cloud-${cloud.id}`} position={[cloud.x, cloud.y, cloud.z]}>
                    <mesh>
                        <sphereGeometry args={[cloud.scale, 14, 14]} />
                        <meshStandardMaterial color={cloud.seeded ? '#4488cc' : '#444'} transparent opacity={cloud.seeded ? 0.5 : 0.85} roughness={1} />
                    </mesh>
                    <mesh position={[cloud.scale * 0.6, -0.3, 0]}>
                        <sphereGeometry args={[cloud.scale * 0.7, 10, 10]} />
                        <meshStandardMaterial color={cloud.seeded ? '#4488cc' : '#555'} transparent opacity={cloud.seeded ? 0.5 : 0.8} roughness={1} />
                    </mesh>
                    <mesh position={[-cloud.scale * 0.5, -0.4, 0.3]}>
                        <sphereGeometry args={[cloud.scale * 0.8, 10, 10]} />
                        <meshStandardMaterial color={cloud.seeded ? '#4488cc' : '#4a4a4a'} transparent opacity={cloud.seeded ? 0.5 : 0.8} roughness={1} />
                    </mesh>
                    {/* Ground shadow */}
                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -cloud.y + 0.1, 0]}>
                        <circleGeometry args={[cloud.scale * 1.5, 16]} />
                        <meshBasicMaterial color="#000" transparent opacity={0.25} />
                    </mesh>
                    {/* Seed progress ring */}
                    {!cloud.seeded && cloud.seedProgress > 0 && (
                        <mesh position={[0, -cloud.y + 0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                            <ringGeometry args={[cloud.scale * 1.2, cloud.scale * 1.4, 32, 1, 0, (cloud.seedProgress / 100) * Math.PI * 2]} />
                            <meshBasicMaterial color="#00ff88" side={THREE.DoubleSide} />
                        </mesh>
                    )}
                    {cloud.seeded && (
                        <pointLight position={[0, -2, 0]} color="#4488cc" intensity={2} distance={10} decay={2} />
                    )}
                </group>
            ))}

            {/* Lightning */}
            {lightningRef.current.map((l, i) => (
                <group key={`lightning-${i}`}>
                    {l.warned && l.timer > 0 && (
                        <mesh position={[l.x, 0.1, l.z]} rotation={[-Math.PI / 2, 0, 0]}>
                            <circleGeometry args={[4.5, 24]} />
                            <meshBasicMaterial color="#ffff00" transparent opacity={0.35} />
                        </mesh>
                    )}
                    {l.struck && l.timer > -0.3 && (
                        <>
                            <mesh position={[l.x, 5, l.z]}>
                                <cylinderGeometry args={[0.08, 0.35, 10, 4]} />
                                <meshBasicMaterial color="#ffffff" />
                            </mesh>
                            <pointLight position={[l.x, 3, l.z]} color="#ffffff" intensity={25} distance={18} decay={2} />
                        </>
                    )}
                </group>
            ))}

            {/* Rain when won */}
            {isWon && <RainParticles />}
        </>
    );
}

export function MiniChaac({ setGameState, state, setState }) {
    const [seeded, setSeeded] = useState(0);
    const [timeLeft, setTimeLeft] = useState(75);
    const [isWon, setIsWon] = useState(false);
    const [isLost, setIsLost] = useState(false);
    const [showIntro, setShowIntro] = useState(true);
    const containerRef = useRef();
    const keysRef = useRef({});

    useEffect(() => {
        const down = (e) => { e.preventDefault(); keysRef.current[e.code] = true; };
        const up = (e) => { keysRef.current[e.code] = false; };
        window.addEventListener('keydown', down);
        window.addEventListener('keyup', up);
        if (containerRef.current) containerRef.current.focus();
        return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
    }, []);

    const handleSeed = () => {
        setSeeded(prev => {
            const next = prev + 1;
            if (next >= 5) {
                setIsWon(true);
                setTimeout(() => {
                    setState(st => ({ ...st, activeCrisis: null }));
                    setGameState('macro');
                }, 4000);
            }
            return next;
        });
    };

    useEffect(() => {
        if (isWon || showIntro) return;
        const t = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    setIsLost(true);
                    setState(s => ({
                        ...s,
                        activeCrisis: null,
                        resources: { ...s.resources, honey: Math.max(0, s.resources.honey - 50) }
                    }));
                    setTimeout(() => setGameState('macro'), 3000);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(t);
    }, [isWon, showIntro, setGameState, setState]);

    if (showIntro) {
        return (
            <div ref={containerRef} tabIndex={0} className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3d1a00 0%, #6b3a10 50%, #8B6914 100%)' }}>
                <div className="bg-black/80 border-2 border-amber-700 rounded-2xl p-10 max-w-xl text-center shadow-[0_0_60px_rgba(217,119,6,0.2)]">
                    <h1 className="text-4xl text-amber-400 font-serif font-black mb-4">⛈ Wrath of Chaac</h1>
                    <h2 className="text-xl text-blue-300 font-serif mb-6">Cloud Seeding Ritual</h2>

                    <div className="text-left space-y-3 mb-8 text-sm">
                        <p className="text-slate-300"><span className="text-amber-400 font-bold">The Lore:</span> Chaac, the Maya Rain God, has turned his face from the land. The crops wither, the cenotes dry, and the Melipona have no flowers to feed on. The J-Men calls upon the sacred bees to carry pollen into the storm clouds, seeding them to bring the life-giving rain.</p>

                        <div className="bg-amber-900/30 border border-amber-800 rounded-lg p-3">
                            <p className="text-amber-300 font-bold mb-2">📜 How to Play:</p>
                            <p className="text-slate-300">• <span className="text-amber-200 font-mono font-bold">WASD</span> or <span className="text-amber-200 font-mono font-bold">Arrow Keys</span> — Fly your bee swarm</p>
                            <p className="text-slate-300">• Fly <span className="text-blue-300">under the dark clouds</span> and stay there — a green progress ring fills up</p>
                            <p className="text-slate-300">• Seed <span className="text-emerald-400 font-bold">5 clouds</span> to cure the drought</p>
                            <p className="text-slate-300">• <span className="text-yellow-400">⚡ Yellow circles</span> = lightning incoming! <span className="text-red-400">Move away or get stunned</span></p>
                        </div>

                        <p className="text-slate-400 italic text-xs">In ancient Maya belief, Chaac struck his axe into the clouds to release rain. This game represents the symbiosis between pollinators and weather cycles that the Maya deeply understood.</p>
                    </div>

                    <button onClick={() => setShowIntro(false)} className="px-8 py-3 bg-amber-600 hover:bg-amber-500 text-white font-black text-xl rounded-xl border-2 border-amber-400 hover:shadow-[0_0_20px_rgba(217,119,6,0.5)] transition-all">
                        Invoke the Rain
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div ref={containerRef} tabIndex={0} className="w-full h-full relative bg-black outline-none" style={{ cursor: 'none' }}>
            <Canvas shadows camera={{ position: [0, 35, 22], fov: 52, near: 0.1, far: 200 }} gl={{ toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }} dpr={[1, 2]}>
                <ChaacSimulation keysRef={keysRef} onSeed={handleSeed} seeded={seeded} isWon={isWon} />
            </Canvas>

            {/* HUD */}
            <div className="absolute top-5 left-5 bg-black/90 px-5 py-4 rounded-xl border border-amber-800 pointer-events-none max-w-sm shadow-[0_0_20px_rgba(0,0,0,0.8)]">
                <h2 className="text-xl text-amber-400 font-serif font-black mb-2">⛈ Wrath of Chaac</h2>

                <div className="flex items-center gap-4 mb-2">
                    <span className="text-lg text-red-400 font-mono font-bold">⏱ {timeLeft}s</span>
                    <span className="text-lg text-emerald-300 font-mono">Seeded: <span id="chaac-seeded">{seeded}/5</span></span>
                </div>

                <p className="text-slate-500 text-xs font-mono">WASD / Arrows to fly • Stay under clouds to seed</p>
                <p className="text-yellow-400/60 text-xs font-mono mt-1">⚡ Avoid yellow lightning zones!</p>
            </div>

            {/* Controls reminder */}
            <div className="absolute top-5 right-5 bg-black/70 px-4 py-3 rounded-xl border border-slate-800 pointer-events-none">
                <div className="grid grid-cols-3 gap-1 w-20">
                    <div></div>
                    <div className="bg-slate-700 text-white text-center text-xs font-mono rounded py-1">W</div>
                    <div></div>
                    <div className="bg-slate-700 text-white text-center text-xs font-mono rounded py-1">A</div>
                    <div className="bg-slate-700 text-white text-center text-xs font-mono rounded py-1">S</div>
                    <div className="bg-slate-700 text-white text-center text-xs font-mono rounded py-1">D</div>
                </div>
            </div>

            {isWon && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-blue-900/20">
                    <div className="text-center">
                        <h2 className="text-5xl text-blue-300 font-bold font-serif animate-bounce drop-shadow-[0_0_30px_rgba(100,180,255,0.8)]">The Rain Returns!</h2>
                        <p className="text-xl text-blue-200 mt-4 font-mono">The drought is cured. Chaac is appeased.</p>
                    </div>
                </div>
            )}

            {isLost && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-red-900/20">
                    <div className="text-center">
                        <h2 className="text-5xl text-red-500 font-bold font-serif animate-pulse">The Drought Persists!</h2>
                        <p className="text-xl text-red-300 mt-4 font-mono">The flowers wilt. -50 Honey lost.</p>
                    </div>
                </div>
            )}
        </div>
    );
}

