// import { Canvas, useFrame } from '@react-three/fiber'
// import { OrbitControls, Html } from '@react-three/drei'
// import { useRef, useState, useEffect, useMemo } from 'react'
// import { useControls, Leva } from 'leva'
// import * as THREE from 'three'
// import Plotly from 'plotly.js-dist-min'
// import sampleAudio from '../assets/drag-force-simulation.wav'
// import { LaTeXOverlay3D } from './LatexOverlay'

// // Constants
// const TIME_SCALE = 1

// // ==============================================
// // Enhanced Vector Field Component
// // ==============================================

// // interface ArrowProps {
// //   position: THREE.Vector3
// //   direction: THREE.Vector3
// //   length?: number
// //   color?: THREE.Color | string
// //   onPointerOver?: () => void;
// //   onPointerOut?: () => void;
// // }

// // const Arrow = ({ position, direction, length = 1, color = 'white', onPointerOver, onPointerOut}: ArrowProps) => {
// //   const ref = useRef<THREE.ArrowHelper>(null)
// //   const actualLength = direction.length() * length;
// //   const headLength = Math.min(actualLength * 0.025, 0.5);
// //   const headWidth = Math.min(actualLength * 0.025, 0.2);

// //   useMemo(() => {
// //     if (ref.current) {
// //       ref.current.position.copy(position)
// //       ref.current.setDirection(direction.clone().normalize())
// //       ref.current.setLength(length, length * 0.3, length * 0.1)
// //       ref.current.setColor(new THREE.Color(color as THREE.ColorRepresentation))
// //     }
// //   }, [position, direction, length, color])
  
// //   return (
// //     <group onPointerOver={onPointerOver} onPointerOut={onPointerOut}>
// //       <primitive 
// //         object={new THREE.ArrowHelper(
// //           direction.clone().normalize(),
// //           position,
// //           actualLength,
// //           new THREE.Color(color as THREE.ColorRepresentation),
// //           headLength,
// //           headWidth
// //         )}
// //       />
// //     </group>
// //   );
// // }

// // interface VectorFieldProps {
// //   position?: THREE.Vector3;
// //   shapeType?: string;
// //   sphereRadius?: number;
// //   torusOuterRadius?: number;
// //   torusInnerRadius?: number;
// //   cylinderRadius?: number;
// //   cylinderHeight?: number;
// //   rotation?: THREE.Quaternion;
// //   isFullScreen?: boolean
// // }

// // const VectorField = ({
// //   position = new THREE.Vector3(0, 0, 0),
// //   sphereRadius = 1,
// //   rotation = new THREE.Quaternion(),
// //   isFullScreen = true
// // }: VectorFieldProps) => {
// //   const [flux, setFlux] = useState(0);
// //   const [hoveredArrow, setHoveredArrow] = useState<{pos: THREE.Vector3, flux: number, magnitude: number} | null>(null);
  
// //   const { fieldResolution, arrowSize, showFlux, fieldFunction, vectorScale } = useControls('Vector Field', {
// //     fieldResolution: { value: 18, min: 2, max: 100, step: 1 },
// //     arrowSize: { value: 0.3, min: 0.1, max: 2, step: 0.1 },
// //     showFlux: { value: true },
// //     vectorScale: { 
// //       value: 1, 
// //       min: 0.01, 
// //       max: 10, 
// //       step: 0.01,
// //       label: 'Vector Scale Factor'
// //     },
// //     fieldFunction: { 
// //       value: "(r, t) => {\n  // r is position vector [x,y,z]\n  // t is time\n  return [0, 0, r[2]]; // Example: linear field in z-direction\n}",
// //       rows: 5,
// //       label: 'Field Function (JS)'
// //     }
// //   }, { collapsed: true });

// //   const getFieldAtPoint = useMemo(() => {
// //     return parseVectorFieldFunction(fieldFunction);
// //   }, [fieldFunction]);
    
// //   const arrows = useMemo(() => {
// //     let totalFlux = 0;
// //     const arr = [];
// //     const currentTime = performance.now() / 1000;
    
// //     // Use spherical coordinates with equal area partitioning
// //     const thetaSteps = fieldResolution;
// //     const phiSteps = fieldResolution * 2; // More samples in azimuthal direction
    
// //     const dTheta = Math.PI / thetaSteps;
// //     const dPhi = 2 * Math.PI / phiSteps;
    
// //     for (let i = 0; i < thetaSteps; i++) {
// //       const theta = (i + 0.5) * dTheta; // Midpoint sampling for better accuracy
      
// //       for (let j = 0; j < phiSteps; j++) {
// //         const phi = j * dPhi;
        
// //         // Convert to Cartesian coordinates on unit sphere
// //         const x = Math.sin(theta) * Math.cos(phi);
// //         const y = Math.sin(theta) * Math.sin(phi);
// //         const z = Math.cos(theta);
        
// //         // Scale by radius and position
// //         const surfacePos = new THREE.Vector3(x, y, z)
// //           .multiplyScalar(sphereRadius)
// //           .applyQuaternion(rotation)
// //           .add(position);
        
// //         // Normal is just normalized position vector for sphere
// //         const normal = new THREE.Vector3(x, y, z)
// //           .applyQuaternion(rotation);
        
// //         // Evaluate vector field at this point
// //         const rawB = getFieldAtPoint(surfacePos, currentTime);
        
// //         // Area element for this patch (dA = r² sinθ dθ dφ)
// //         const dA = sphereRadius * sphereRadius * Math.sin(theta) * dTheta * dPhi;
        
// //         // Flux contribution for this patch
// //         const fluxContribution = rawB.dot(normal) * dA;
// //         totalFlux += fluxContribution;
        
// //         // Visualization - only show every Nth arrow for clarity
// //         if (i % 2 === 0 && j % 4 === 0) {
// //           const B = rawB.clone().multiplyScalar(vectorScale * 0.5);
// //           const magnitude = B.length();
          
// //           // Color based on flux contribution
// //           const normalizedFlux = Math.min(Math.abs(fluxContribution / dA) / vectorScale, 1);
// //           const hue = fluxContribution > 0 ? 0.6 : 0.0; // Blue for positive, red for negative
// //           const saturation = 0.7 + 0.3 * normalizedFlux;
// //           const lightness = 0.5;
// //           const color = new THREE.Color().setHSL(hue, saturation, lightness);
          
// //           arr.push(
// //             <Arrow
// //               key={`arrow-${i}-${j}`}
// //               position={surfacePos}
// //               direction={B}
// //               length={arrowSize * Math.min(magnitude / vectorScale, 1)}
// //               color={color}
// //               onPointerOver={() => setHoveredArrow({
// //                 pos: surfacePos.clone(),
// //                 flux: fluxContribution,
// //                 magnitude: magnitude
// //               })}
// //               onPointerOut={() => setHoveredArrow(null)}
// //             />
// //           );
// //         }
// //       }
// //     }

// //     setFlux(totalFlux);
// //     return arr;
// //   }, [fieldResolution, arrowSize, position, rotation, sphereRadius, vectorScale, fieldFunction]);

// //   return (
// //     <group>
// //       {arrows}
// //       {hoveredArrow && (
// //         <Html position={hoveredArrow.pos.clone().add(new THREE.Vector3(0, 0.5, 0))} center>
// //           <div style={{
// //             background: 'rgba(0,0,0,0.85)',
// //             color: 'white',
// //             padding: '10px',
// //             borderRadius: '5px',
// //             fontSize: '14px',
// //             width: '250px',
// //             pointerEvents: 'none',
// //             boxShadow: '0 0 15px rgba(0,0,0,0.5)',
// //             backdropFilter: 'blur(4px)'
// //           }}>
// //             <div style={{ display: 'flex', justifyContent: 'space-between' }}>
// //               <span>Flux Contribution:</span>
// //               <span style={{ fontFamily: 'monospace' }}>
// //                 {hoveredArrow.flux.toExponential(2)}
// //               </span>
// //             </div>
// //             <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
// //               <span>Flux Density:</span>
// //               <span style={{ fontFamily: 'monospace' }}>
// //                 {(hoveredArrow.flux > 0 ? '+' : '') + (hoveredArrow.flux / (sphereRadius * sphereRadius * Math.PI * 4 / (fieldResolution * fieldResolution * 2))).toExponential(2)}
// //               </span>
// //             </div>
// //             <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
// //               <span>Magnitude:</span>
// //               <span style={{ fontFamily: 'monospace' }}>
// //                 {hoveredArrow.magnitude.toExponential(2)}
// //               </span>
// //             </div>
// //           </div>
// //         </Html>
// //       )}
// //       {showFlux && <FluxDisplay value={flux} position={position} isFullScreen={isFullScreen}/>}
// //     </group>
// //   );
// // };

// // function parseVectorFieldFunction(code: string): (position: THREE.Vector3, time: number) => THREE.Vector3 {
// //   try {
// //     const func = new Function(`return ${code}`)();
// //     return (position: THREE.Vector3, time: number) => {
// //       try {
// //         const result = func([position.x, position.y, position.z], time);
// //         if (Array.isArray(result) && result.length >= 3) {
// //           return new THREE.Vector3(result[0], result[1], result[2]);
// //         }
// //         console.error("Function must return an array of 3 numbers");
// //         return new THREE.Vector3();
// //       } catch (e) {
// //         console.error("Error executing vector field function:", e);
// //         return new THREE.Vector3();
// //       }
// //     };
// //   } catch (e) {
// //     console.error("Error parsing vector field function:", e);
// //     return () => new THREE.Vector3();
// //   }
// // }

// // interface FluxDisplayProps {
// //   value: number;
// //   position: THREE.Vector3;
// //   isFullScreen: boolean;
// // }

// // function FluxDisplay({ value, position, isFullScreen }: FluxDisplayProps) {
// //   // Round to zero if flux is effectively zero
// //   const displayValue = Math.abs(value) < 1e-10 ? 0 : value;
  
// //   return (
// //     <Html position={position.clone().add(new THREE.Vector3(0, -3, 0))} center>
// //       <div style={{
// //         background: 'rgba(0,0,0,0.7)',
// //         padding: '10px',
// //         borderRadius: '5px',
// //         fontSize: '16px',
// //         minWidth: '200px',
// //         textAlign: 'center',
// //         pointerEvents: 'none',
// //         display: isFullScreen ? 'block' : 'none'
// //       }}>
// //         Total Flux: <br />
// //         {displayValue === 0 ? "0.000" : displayValue.toExponential(4)}
// //       </div>
// //     </Html>
// //   );
// // }

// function Ball({
//   initPos,
//   initVel,
//   resetTrigger,
//   onUpdate,
//   paused,
//   shapeParams,
//   rotation,
//   showVectorField,
//   physicsParams,
// }: {
//   initPos: number[],
//   initVel: number[],
//   resetTrigger: any,
//   onUpdate: any,
//   paused: boolean,
//   shapeParams: any,
//   rotation: THREE.Quaternion,
//   showVectorField: boolean,
//   physicsParams: { k: number, b: number, mass: number },
// }) {
//   const ref = useRef<THREE.Mesh>(null)
//   const [pos, setPos] = useState(new THREE.Vector3(...initPos))
//   const [vel, setVel] = useState(new THREE.Vector3(...initVel))
//   const time = useRef(0)
//   const ready = useRef(false)
  
//   useFrame(() => {
//     if (ref.current) {
//       ref.current.quaternion.copy(rotation);
//     }
//   });

//   useEffect(() => {
//     const newPos = new THREE.Vector3(...initPos)
//     const newVel = new THREE.Vector3(...initVel)
//     time.current = 0
//     setPos(newPos)
//     setVel(newVel)
//     if (ref.current) ref.current.position.copy(newPos)
//     onUpdate({
//       time: time.current,
//       z: initPos[2],
//       vz: initVel[2],
//       az: acceleration(new THREE.Vector3(...initVel)).z,
//       position: new THREE.Vector3(...initPos)
//     })
//     ready.current = false

//     requestAnimationFrame(() => {
//       ready.current = true
//     })
//   }, [resetTrigger])

// function acceleration(position: THREE.Vector3) {
//   // F(x) = -kx - bx³
//   const force = -physicsParams.k * position.x - physicsParams.b * Math.pow(position.x, 3);
  
//   // a = F/m
//   return new THREE.Vector3(force / physicsParams.mass, 0, 0);
// }

// useFrame((_, delta) => {
//   if (paused || !ready.current) return

//   const h = 0.01
//   const steps = Math.floor(delta * TIME_SCALE / h)

//   let v = vel.clone()
//   let p = pos.clone()

//   for (let i = 0; i < steps; i++) {
//     // RK4 implementation for position and velocity
//     const k1v = acceleration(p);
//     const k1x = v.clone();
    
//     const k2v = acceleration(p.clone().add(k1x.clone().multiplyScalar(h/2)));
//     const k2x = v.clone().add(k1v.clone().multiplyScalar(h/2));
    
//     const k3v = acceleration(p.clone().add(k2x.clone().multiplyScalar(h/2)));
//     const k3x = v.clone().add(k2v.clone().multiplyScalar(h/2));
    
//     const k4v = acceleration(p.clone().add(k3x.clone().multiplyScalar(h)));
//     const k4x = v.clone().add(k3v.clone().multiplyScalar(h));

//     // Update velocity and position
//     v.add(
//       k1v.clone().add(k2v.clone().multiplyScalar(2))
//         .add(k3v.clone().multiplyScalar(2))
//         .add(k4v)
//         .multiplyScalar(h/6)
//     );
    
//     p.add(
//       k1x.clone().add(k2x.clone().multiplyScalar(2))
//         .add(k3x.clone().multiplyScalar(2))
//         .add(k4x)
//         .multiplyScalar(h/6)
//     );
    
//     time.current += h
//   }

//   setVel(v)
//   setPos(p)
//   if (ref.current) ref.current.position.copy(p)
//   onUpdate({ 
//     time: time.current, 
//     position: p.clone(),
//     velocity: v.clone(),
//     acceleration: acceleration(p)
//   })
// })

//   return (
//     <mesh ref={ref}>
//       {shapeParams.shapeType === 'sphere' && <sphereGeometry args={[shapeParams.sphereRadius, 32, 32]} />}
//       {shapeParams.shapeType === 'torus' && <torusGeometry args={[shapeParams.torusOuterRadius, shapeParams.torusInnerRadius, 16, 100]} />}
//       {shapeParams.shapeType === 'cylinder' && <cylinderGeometry args={[shapeParams.cylinderRadius, shapeParams.cylinderRadius, shapeParams.cylinderHeight, 32]} />}
//       {shapeParams.shapeType === 'plane' && <planeGeometry args={[shapeParams.sphereRadius * 3, shapeParams.sphereRadius * 3]} />}
//       <meshStandardMaterial color="orange" transparent={true} opacity={showVectorField ? 0.85 : 1}/>
//     </mesh>
//   )
// }

// function AxisLabels({ }: { isFullscreen: boolean }) {
//   return (
//     <group renderOrder={2}>
//       <Html position={[10.5, 0, 0]} center>
//         <div style={{ color: 'red', fontSize: '24px', fontWeight: 'bold', zIndex: 998 }}>+X</div>
//       </Html>
//       <Html position={[0, 10.5, 0]} center>
//         <div style={{ color: 'green', fontSize: '24px', fontWeight: 'bold' }}>+Y</div>
//       </Html>
//       <Html position={[0, 0, 10.5]} center>
//         <div style={{ color: 'blue', fontSize: '24px', fontWeight: 'bold' }}>+Z</div>
//       </Html>
//     </group>
//   )
// }

// function formatTime(seconds: number): string {
//   const mins = Math.floor(seconds / 60);
//   const secs = Math.floor(seconds % 60);
//   return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
// }

// function InfiniteXYGrid() {
//   return (
//     <gridHelper 
//       args={[1000, 1000, '#444', '#888']} 
//       rotation={[Math.PI/2, 0, 0]} 
//       position={[0, 0, -0.01]}
//       renderOrder={1}
//     />
//   )
// }

// export default function FluxVisualization() {
//   // Shape controls organized under one panel
//   const shapeControls = useControls('Shape Settings', {
//     shapeType: { value: 'sphere', options: ['sphere', 'torus', 'cylinder', 'plane'] },
//     sphereRadius: { value: 1, min: 0.1, max: 5, step: 0.1, render: get => get('Shape Settings.shapeType') === 'sphere' },
//     torusOuterRadius: { value: 1.5, min: 0.5, max: 5, step: 0.1, render: get => get('Shape Settings.shapeType') === 'torus' },
//     torusInnerRadius: { value: 0.3, min: 0.1, max: 2, step: 0.05, render: get => get('Shape Settings.shapeType') === 'torus' },
//     cylinderRadius: { value: 0.7, min: 0.1, max: 3, step: 0.1, render: get => get('Shape Settings.shapeType') === 'cylinder' },
//     cylinderHeight: { value: 2, min: 0.5, max: 10, step: 0.1, render: get => get('Shape Settings.shapeType') === 'cylinder' },
//   }, { collapsed: true });

//     const physicsControls = useControls('Initial Conditions', {
//     k: { value: 1, min: 0.1, max: 10, step: 0.1 },
//     b: { value: 0.1, min: 0, max: 5, step: 0.1 },
//     mass: { value: 1, min: 0.1, max: 10, step: 0.1 },
//     // Add these for individual position controls
//     x0: { value: 5, min: -10, max: 10, step: 0.1 },
//     y0: { value: 0, min: -10, max: 10, step: 0.1 },
//     z0: { value: 0, min: -10, max: 10, step: 0.1 },
//     // Add these for individual velocity controls
//     vx0: { value: 0, min: -10, max: 10, step: 0.1 },
//     vy0: { value: 0, min: -10, max: 10, step: 0.1 },
//     vz0: { value: 0, min: -10, max: 10, step: 0.1 },
//     }, { collapsed: true });

//   const { showVectorField } = useControls('Vector Field Settings', {
//     showVectorField: { value: true },
//   }, { collapsed: true });

//   const { rotationX, rotationY, rotationZ } = useControls('Rotation', {
//     rotationX: { value: 0, min: -Math.PI, max: Math.PI, step: 0.1 },
//     rotationY: { value: 0, min: -Math.PI, max: Math.PI, step: 0.1 },
//     rotationZ: { value: 0, min: -Math.PI, max: Math.PI, step: 0.1 }
//   }, { collapsed: true });

//   const [resetTrigger, setResetTrigger] = useState(0)
//   const [displayTime, setDisplayTime] = useState(0)
//   const [isResetting, setIsResetting] = useState(false)
//   const [isPaused, setIsPaused] = useState(true)
//   const [isFullscreen, setIsFullscreen] = useState(false)
//   const dataRef = useRef<{ 
//     t: number[]; 
//     x: number[]; y: number[]; z: number[]; 
//     vx: number[]; vy: number[]; vz: number[]; 
//     ax: number[]; ay: number[]; az: number[];
//     flux: number[];
//   }>({
//     t: [], x: [], y: [], z: [], 
//     vx: [], vy: [], vz: [], 
//     ax: [], ay: [], az: [],
//     flux: []
//   })
  
//   const rotation = useMemo(() => {
//     return new THREE.Quaternion().setFromEuler(
//       new THREE.Euler(rotationX, rotationY, rotationZ)
//   )}, [rotationX, rotationY, rotationZ]);

//   // Audio management
//   const audioRef = useRef<HTMLAudioElement>(null)
//   const [playing, setPlaying] = useState(false)
//   const [volume, setVolume] = useState(1)
//   const [duration, setDuration] = useState(0)
//   const [currentTime, setCurrentTime] = useState(0)


//   const [ballPos, setBallPos] = useState(new THREE.Vector3(0, 0, 0));
//   const [currentGraph, setCurrentGraph] = useState<'x'|'y'|'z'|'vx'|'vy'|'vz'|'ax'|'ay'|'az'|'flux'>('z');
//   const [visible, setVisible] = useState(false)
//   const [currentFlux, setCurrentFlux] = useState(0);

//   const handleUpdate = ({ time, position, velocity, acceleration }: { 
//     time: number; 
//     position: THREE.Vector3;
//     velocity: THREE.Vector3;
//     acceleration: THREE.Vector3;
//   }) => {
//     if (isResetting) return;
//     if (time < 0.01) return;
    
//     setDisplayTime(time);
//     setBallPos(position);
    
//     dataRef.current.t.push(time);
//     dataRef.current.x.push(position.x);
//     dataRef.current.y.push(position.y);
//     dataRef.current.z.push(position.z);
//     dataRef.current.vx.push(velocity.x);
//     dataRef.current.vy.push(velocity.y);
//     dataRef.current.vz.push(velocity.z);
//     dataRef.current.ax.push(acceleration.x);
//     dataRef.current.ay.push(acceleration.y);
//     dataRef.current.az.push(acceleration.z);
//     dataRef.current.flux.push(currentFlux);

//     updateGraph(currentGraph);
//   };

//   type DataKey = 't' | 'x' | 'y' | 'z' | 'vx' | 'vy' | 'vz' | 'ax' | 'ay' | 'az' | 'flux';
//   const updateGraph = (type: string) => {
//     const THRESHOLD = 0.05;
//     const filteredIndices = dataRef.current.t
//       .map((t, i) => ({ t, i }))
//       .filter(({ t }) => t >= THRESHOLD)
//       .map(({ i }) => i);

//     const trace = {
//       x: filteredIndices.map(i => dataRef.current.t[i]),
//       y: filteredIndices.map(i => dataRef.current[type as DataKey][i]),
//       type: 'scatter',
//       mode: 'lines',
//       name: type,
//     };

//     Plotly.react('plot', [trace], {
//       title: `${type}(t)`,
//       xaxis: { title: 'Time (s)' },
//       yaxis: { title: `${type}(t)` },
//     });
//   };

//   const resetSim = () => {
//     setIsPaused(true)
//     setIsResetting(true)
//     setDisplayTime(0)
//     dataRef.current = { 
//       t: [], x: [], y: [], z: [], 
//       vx: [], vy: [], vz: [], 
//       ax: [], ay: [], az: [],
//       flux: []
//     }
//     Plotly.purge('plot')
//     setResetTrigger(r => r + 1)
//     setBallPos(new THREE.Vector3(0, 0, 0));
//     setCurrentFlux(0);
//   }

//   useEffect(() => {
//     const timer = setTimeout(() => setVisible(true), 2000)
//     return () => clearTimeout(timer)
//   }, [])

//   useEffect(() => {
//     updateGraph('z');
//   }, []);

//   useEffect(() => {
//     if (isResetting) {
//       const id = requestAnimationFrame(() => {
//         setIsResetting(false)
//       })
//       return () => cancelAnimationFrame(id)
//     }
//   }, [resetTrigger])

//     // Audio effects
//   useEffect(() => {
//     const audio = audioRef.current
//     if (!audio) return

//     const updateTime = () => setCurrentTime(audio.currentTime)
//     const updateDuration = () => setDuration(audio.duration)

//     audio.addEventListener('timeupdate', updateTime)
//     audio.addEventListener('loadedmetadata', updateDuration)

//     return () => {
//       audio.removeEventListener('timeupdate', updateTime)
//       audio.removeEventListener('loadedmetadata', updateDuration)
//     }
//   }, [])

//   // Event handlers
//   const togglePlay = () => {
//     const audio = audioRef.current
//     if (!audio) return

//     if (playing) {
//       audio.pause()
//     } else {
//       audio.play()
//     }
//     setPlaying(!playing)
//   }

//   const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
//     const rect = e.currentTarget.getBoundingClientRect();
//     const pos = (e.clientX - rect.left) / rect.width;
//     if (audioRef.current) {
//       audioRef.current.currentTime = pos * audioRef.current.duration;
//     }
//   };

//   const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const vol = parseFloat(e.target.value)
//     setVolume(vol)
//     if (audioRef.current) {
//       audioRef.current.volume = vol
//     }
//   }

//   const toggleFullScreen = () => {
//     const element = document.getElementById("sim-container")
//     if (!element) return

//     if (!document.fullscreenElement) {
//       element.requestFullscreen()
//         .then(() => setIsFullscreen(true))
//         .catch(err => console.error("Fullscreen error:", err))
//     } else {
//       document.exitFullscreen()
//         .then(() => setIsFullscreen(false))
//     }
//   }

//   useEffect(() => {
//     const handleFullscreenChange = () => {
//       setIsFullscreen(!!document.fullscreenElement)
//     }

//     document.addEventListener('fullscreenchange', handleFullscreenChange)
//     return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
//   }, [])

//   const buttonStyle: React.CSSProperties = {
//     padding: '10px 20px',
//     fontSize: '16px',
//     minWidth: '140px',
//     background: '#222',
//     color: 'white',
//     border: '1px solid white',
//     borderRadius: 6,
//     margin: '5px',
//   }

//   const overlayStyle: React.CSSProperties = {
//     position: 'fixed',
//     top: 0,
//     left: 0,
//     width: '100%',
//     height: '100%',
//     pointerEvents: 'none',
//     zIndex: 1000,
//   }

//   const uiContainerStyle: React.CSSProperties = {
//     position: 'absolute',
//     top: 20,
//     left: 20,
//     pointerEvents: 'auto',
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     padding: '10px',
//     borderRadius: '8px',
//     display: isFullscreen ? 'block' : 'none',
//     zIndex: 999
//   }

//   const graphContainerStyle: React.CSSProperties = {
//     position: 'absolute',
//     top: 120,
//     left: 20,
//     pointerEvents: 'auto',
//     backgroundColor: 'rgba(255, 255, 255, 0.9)',
//     padding: '10px',
//     borderRadius: '8px',
//     display: isFullscreen ? 'block' : 'none',
//     zIndex: 999
//   }

//   const fullscreenButtonStyle: React.CSSProperties = {
//     position: 'absolute',
//     bottom: 10,
//     right: 10,
//     pointerEvents: 'auto',
//     ...buttonStyle,
//   }

//   const levaContainerStyle: React.CSSProperties = {
//     position: 'absolute',
//     top: 20,
//     right: 20,
//     pointerEvents: 'auto',
//     display: isFullscreen ? 'block' : 'none',
//   }

//   return (
//     <div id="sim-container" style={{
//       position: 'relative',
//       width: '100%',
//       height: '90vh',
//       margin: '0 auto',
//       border: '2px solid black',
//       overflow: 'hidden',
//     }}>
//       <Canvas
//         camera={{ position: [10, 10, 10], up: [0, 0, 1], near: 0.1, far: 1000 }}
//         gl={{ antialias: true }}
//       >
//         <ambientLight intensity={0.5} />
//         <pointLight position={[50, 50, 50]} />
//         <axesHelper args={[10]} />
//         <InfiniteXYGrid />
//         <AxisLabels isFullscreen={isFullscreen}/>
//         <Ball
//         initPos={[physicsControls.x0, physicsControls.y0, physicsControls.z0]}
//         initVel={[physicsControls.vx0, physicsControls.vy0, physicsControls.vz0]}
//         resetTrigger={resetTrigger}
//         paused={isPaused}
//         onUpdate={handleUpdate}
//         shapeParams={shapeControls}
//         rotation={rotation}
//         showVectorField={showVectorField}
//         physicsParams={physicsControls}
//         />

//         {/* {showVectorField && (
//           <group renderOrder={1}>
//             <VectorField
//               shapeType={shapeControls.shapeType}
//               position={ballPos}
//               sphereRadius={shapeControls.sphereRadius}
//               torusOuterRadius={shapeControls.torusOuterRadius}
//               torusInnerRadius={shapeControls.torusInnerRadius}
//               cylinderRadius={shapeControls.cylinderRadius}
//               cylinderHeight={shapeControls.cylinderHeight}
//               rotation={rotation}
//             />
//           </group>
//         )} */}

//       {visible && isFullscreen && (
//         <LaTeXOverlay3D 
//           position={{ top: '525px', left: '20px' }} 
//           currentTime={currentTime} 
//           visible={true}
//         />
//       )}
        
//         <OrbitControls makeDefault />
//       </Canvas>

//       <audio ref={audioRef} src={sampleAudio} preload="metadata" />
      
//       {!isFullscreen && (
//         <div style={{
//           position: 'absolute',
//           top: 0, left: 0, right: 0, bottom: 0,
//           background: 'rgba(0, 0, 0, 0.7)',
//           display: 'flex',
//           justifyContent: 'center',
//           alignItems: 'center',
//           zIndex: 10,
//           color: 'white',
//           fontSize: '24px',
//           flexDirection: 'column'
//         }}>
//           <div style={{
//             width: '100px',
//             height: '100px',
//             borderRadius: '50%',
//             border: '2px solid white',
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center',
//             fontSize: '40px',
//           }}>
//             ⛶
//           </div>
//           <p style={{ marginTop: '20px' }}>Click Fullscreen to start the simulation</p>
//         </div>
//       )}

//       <div style={overlayStyle}>
//         <div style={uiContainerStyle}>
//           <button style={{
//             ...buttonStyle,
//             background: isPaused ? '#a00' : '#222',
//           }} onClick={() => setIsPaused(p => !p)}>
//             {isPaused ? 'Resume' : 'Stop'}
//           </button>
//           <button style={buttonStyle} onClick={resetSim}>Reset Ball</button>
//           <button style={buttonStyle} onClick={() => {
//             dataRef.current = { 
//               t: [], x: [], y: [], z: [], 
//               vx: [], vy: [], vz: [], 
//               ax: [], ay: [], az: [],
//               flux: []
//             }
//             Plotly.purge('plot')
//           }}>
//             Clear Graphs
//           </button>
//           <div style={{
//             color: 'white',
//             fontSize: '18px',
//             marginTop: '10px'
//           }}>
//             Time: {displayTime.toFixed(2)} s
//           </div>
//         </div>
        
//         <div style={graphContainerStyle}>
//           <select 
//             value={currentGraph}
//             onChange={(e) => {
//               const newGraph = e.target.value as typeof currentGraph;
//               setCurrentGraph(newGraph);
//               updateGraph(newGraph);
//             }}
//             style={{
//               padding: '8px',
//               borderRadius: '4px',
//               backgroundColor: '#222',
//               color: 'white',
//               border: '1px solid #555',
//               marginBottom: '15px',
//               width: '100%',
//               fontFamily: 'inherit',
//               fontSize: '16px',
//               fontWeight: 'normal'
//             }}
//           >
//             <option value="x">Position X</option>
//             <option value="y">Position Y</option>
//             <option value="z">Position Z</option>
//             <option value="vx">Velocity X</option>
//             <option value="vy">Velocity Y</option>
//             <option value="vz">Velocity Z</option>
//             <option value="ax">Acceleration X</option>
//             <option value="ay">Acceleration Y</option>
//             <option value="az">Acceleration Z</option>
//             <option value="flux">Flux</option>
//           </select>
//           <div id="plot" style={{ width: 450, height: 300, top: 290, zIndex: 1000}}></div>
//         </div>

//         <div style={levaContainerStyle}>
//           <Leva fill flat hideCopyButton collapsed oneLineLabels />
//         </div>

//         <button
//           style={fullscreenButtonStyle}
//           onClick={toggleFullScreen}
//         >
//           {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
//         </button>
//       </div>

//             {/* Audio controls */}
//       <div style={{ 
//         position: 'fixed',
//         bottom: 0,
//         left: 0,
//         right: 0,
//         background: 'linear-gradient(to right, #222, #444)',
//         color: 'white',
//         padding: '15px 20px',
//         zIndex: 999,
//         display: isFullscreen ? 'flex' : 'none',
//         flexDirection: 'column',
//         gap: '10px',
//         borderTop: '1px solid #555',
//         boxShadow: '0 -2px 10px rgba(0,0,0,0.5)'
//       }}>
//         {/* Progress bar */}
//         <div style={{
//           display: 'flex',
//           alignItems: 'center',
//           gap: '15px',
//           width: '100%'
//         }}>
//           <div 
//             style={{ 
//               flex: 1,
//               height: '4px',
//               background: '#555',
//               borderRadius: '2px',
//               overflow: 'hidden',
//               cursor: 'pointer'
//             }}
//             onClick={handleProgressClick}
//           >
//             <div 
//               style={{
//                 height: '100%',
//                 width: `${(currentTime / duration) * 100}%`,
//                 background: '#00ffc8',
//                 transition: 'width 0.1s linear'
//               }} 
//             />
//           </div>
//           <div style={{
//             display: 'flex',
//             gap: '5px',
//             fontSize: '12px',
//             color: '#aaa',
//             minWidth: '100px'
//           }}>
//             <span>{formatTime(currentTime)}</span>
//             <span>/</span>
//             <span>{formatTime(duration)}</span>
//           </div>
//         </div>

//         {/* Controls row */}
//         <div style={{
//           display: 'flex',
//           alignItems: 'center',
//           gap: '20px',
//           width: '100%'
//         }}>
//           <button 
//             onClick={togglePlay}
//             style={{
//               background: 'none',
//               border: 'none',
//               color: 'white',
//               fontSize: '24px',
//               cursor: 'pointer',
//               padding: '5px 10px',
//               borderRadius: '4px',
//               transition: 'all 0.2s'
//             }}
//           >
//             {playing ? '⏸' : '▶'}
//           </button>

//           <input
//             type="range"
//             min="0"
//             max="1"
//             step="0.01"
//             value={volume}
//             onChange={handleVolumeChange}
//             style={{
//               flex: 1,
//               maxWidth: '100px',
//               height: '4px',
//               accentColor: '#00ffc8'
//             }}
//           />

//           <div style={{ marginLeft: 'auto' }}>
//             {/* Additional controls can go here */}
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }