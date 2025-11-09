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

// interface BallType {
//   id: string;
//   position: THREE.Vector3;
//   velocity: THREE.Vector3;
//   acceleration: THREE.Vector3;
//   color: string;
// }

// function Ball({
//   position,
//   color,
//   shapeParams,
//   rotation,
//   showVectorField,
// }: {
//   position: THREE.Vector3,
//   color: string,
//   shapeParams: any,
//   rotation: THREE.Quaternion,
//   showVectorField: boolean,
// }) {
//   const ref = useRef<THREE.Mesh>(null);
  
//   useFrame(() => {
//     if (ref.current) {
//       ref.current.position.copy(position);
//       ref.current.quaternion.copy(rotation);
//     }
//   });

//   return (
//     <mesh ref={ref}>
//       {shapeParams.shapeType === 'sphere' && <sphereGeometry args={[shapeParams.sphereRadius, 32, 32]} />}
//       {shapeParams.shapeType === 'torus' && <torusGeometry args={[shapeParams.torusOuterRadius, shapeParams.torusInnerRadius, 16, 100]} />}
//       {shapeParams.shapeType === 'cylinder' && <cylinderGeometry args={[shapeParams.cylinderRadius, shapeParams.cylinderRadius, shapeParams.cylinderHeight, 32]} />}
//       {shapeParams.shapeType === 'plane' && <planeGeometry args={[shapeParams.sphereRadius * 3, shapeParams.sphereRadius * 3]} />}
//       <meshStandardMaterial color={color} transparent={true} opacity={showVectorField ? 0.85 : 1}/>
//     </mesh>
//   );
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

// interface PhysicsSimulationProps {
//   isPaused: boolean;
//   setBalls: React.Dispatch<React.SetStateAction<BallType[]>>;
//   setDisplayTime: React.Dispatch<React.SetStateAction<number>>;
//   dataRef: React.MutableRefObject<{
//     t: number[];
//     xA: number[]; yA: number[]; zA: number[];
//     vxA: number[]; vyA: number[]; vzA: number[];
//     axA: number[]; ayA: number[]; azA: number[];
//     xB: number[]; yB: number[]; zB: number[];
//     vxB: number[]; vyB: number[]; vzB: number[];
//     axB: number[]; ayB: number[]; azB: number[];
//     xRelative: number[]; yRelative: number[]; zRelative: number[];
//     vxRelative: number[]; vyRelative: number[]; vzRelative: number[];
//     axRelative: number[]; ayRelative: number[]; azRelative: number[];
//     flux: number[];
//   }>;
//   TIME_SCALE: number;
//   displayTime: number; // Add this missing prop
// }
// function PhysicsSimulation({
//   isPaused,
//   setBalls,
//   setDisplayTime,
//   dataRef,
//   TIME_SCALE,
//   displayTime,
//   physicsControls
// }: PhysicsSimulationProps & { physicsControls: any }) {
  
//   useFrame((_, delta) => {
//     if (isPaused) return;
    
//     setBalls((prevBalls: BallType[]) => {
//       const updatedBalls = prevBalls.map(ball => {
//         // Calculate spring force between balls
//         const otherBall = prevBalls.find(b => b.id !== ball.id);
        
//         if (otherBall) {
//           // Direction vector from this ball to the other ball
//           const direction = new THREE.Vector3()
//             .subVectors(otherBall.position, ball.position)
//             .normalize();
          
//           // Distance between balls
//           const distance = ball.position.distanceTo(otherBall.position);
          
//           // Spring force (F = -k * x)
//           const springMagnitude = physicsControls.k * (distance - 5); // 5 is rest length
//           const springForce = direction.multiplyScalar(springMagnitude);
          
//           // Damping force (F = -b * v)
//           const dampingForce = ball.velocity.clone().multiplyScalar(-physicsControls.b);
          
//           // Total acceleration (a = F/m)
//           const acceleration = new THREE.Vector3(0,0,0)
          
//           // Simple Euler integration
//           const newVelocity = ball.velocity.clone().add(
//             acceleration.multiplyScalar(delta * TIME_SCALE)
//           );
          
//           const newPosition = ball.position.clone().add(
//             newVelocity.clone().multiplyScalar(delta * TIME_SCALE)
//           );
          
//           // COLLECT DATA HERE
//           if (ball.id === 'ballA') {
//             dataRef.current.xA.push(newPosition.x);
//             dataRef.current.yA.push(newPosition.y);
//             dataRef.current.zA.push(newPosition.z);
//             dataRef.current.vxA.push(newVelocity.x);
//             dataRef.current.vyA.push(newVelocity.y);
//             dataRef.current.vzA.push(newVelocity.z);
//             dataRef.current.axA.push(acceleration.x);
//             dataRef.current.ayA.push(acceleration.y);
//             dataRef.current.azA.push(acceleration.z);
//           } else if (ball.id === 'ballB') {
//             dataRef.current.xB.push(newPosition.x);
//             dataRef.current.yB.push(newPosition.y);
//             dataRef.current.zB.push(newPosition.z);
//             dataRef.current.vxB.push(newVelocity.x);
//             dataRef.current.vyB.push(newVelocity.y);
//             dataRef.current.vzB.push(newVelocity.z);
//             dataRef.current.axB.push(acceleration.x);
//             dataRef.current.ayB.push(acceleration.y);
//             dataRef.current.azB.push(acceleration.z);
//           }
          
//           return {
//             ...ball,
//             position: newPosition,
//             velocity: newVelocity,
//             acceleration: acceleration
//           };
//         }
        
//         return ball;
//       });
      
//       // Calculate relative data after updating both balls
//       if (dataRef.current.xA.length > 0 && dataRef.current.xB.length > 0) {
//         const lastIndex = dataRef.current.xA.length - 1;
//         dataRef.current.xRelative.push(dataRef.current.xB[lastIndex] - dataRef.current.xA[lastIndex]);
//         dataRef.current.yRelative.push(dataRef.current.yB[lastIndex] - dataRef.current.yA[lastIndex]);
//         dataRef.current.zRelative.push(dataRef.current.zB[lastIndex] - dataRef.current.zA[lastIndex]);
//         dataRef.current.vxRelative.push(dataRef.current.vxB[lastIndex] - dataRef.current.vxA[lastIndex]);
//         dataRef.current.vyRelative.push(dataRef.current.vyB[lastIndex] - dataRef.current.vyA[lastIndex]);
//         dataRef.current.vzRelative.push(dataRef.current.vzB[lastIndex] - dataRef.current.vzA[lastIndex]);
//       }
      
//       dataRef.current.t.push(displayTime + delta);
//       setDisplayTime(displayTime + delta);
      
//       return updatedBalls;
//     });
//   });
  
//   return null;
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

//   // In your Leva controls or custom UI
//   const { referenceFrame, trackedBall } = useControls('Reference Frame', {
//     referenceFrame: { 
//       value: 'ground', 
//       options: ['ground', 'ballA', 'ballB'] 
//     },
//     trackedBall: { 
//       value: 'ballA', 
//       options: ['ballA', 'ballB'],
//       render: get => get('Reference Frame.referenceFrame') === 'ground'
//     }
//   }, { collapsed: true });

//   const physicsControls = useControls('Initial Conditions', {
//     // Ball A
//     ballAPosition: { 
//       value: { x: -3, y: 0, z: 0 }, 
//       label: "Ball A Position" 
//     },
//     ballAVelocity: { 
//       value: { x: 0, y: 0, z: 0 }, 
//       label: "Ball A Velocity" 
//     },
    
//     // Ball B
//     ballBPosition: { 
//       value: { x: 3, y: 0, z: 0 }, 
//       label: "Ball B Position" 
//     },
//     ballBVelocity: { 
//       value: { x: 0, y: 0, z: 0 }, 
//       label: "Ball B Velocity" 
//     },
//   }, { collapsed: true });

//   const { showVectorField } = useControls('Vector Field Settings', {
//     showVectorField: { value: true },
//   }, { collapsed: true });

//   const { rotationX, rotationY, rotationZ } = useControls('Rotation', {
//     rotationX: { value: 0, min: -Math.PI, max: Math.PI, step: 0.1 },
//     rotationY: { value: 0, min: -Math.PI, max: Math.PI, step: 0.1 },
//     rotationZ: { value: 0, min: -Math.PI, max: Math.PI, step: 0.1 }
//   }, { collapsed: true });

//   // Add to your component state
//   const [balls, setBalls] = useState<BallType[]>([
//     {
//       id: 'ballA',
//       position: new THREE.Vector3(
//         physicsControls.ballAPosition.x, 
//         physicsControls.ballAPosition.y, 
//         physicsControls.ballAPosition.z
//       ),
//       velocity: new THREE.Vector3(
//         physicsControls.ballAVelocity.x, 
//         physicsControls.ballAVelocity.y, 
//         physicsControls.ballAVelocity.z
//       ),
//       acceleration: new THREE.Vector3(0, 0, 0),
//       color: 'red'
//     },
//     {
//       id: 'ballB',
//       position: new THREE.Vector3(
//         physicsControls.ballBPosition.x,
//         physicsControls.ballBPosition.y,
//         physicsControls.ballBPosition.z
//       ),
//       velocity: new THREE.Vector3(
//         physicsControls.ballBVelocity.x, 
//         physicsControls.ballBVelocity.y, 
//         physicsControls.ballBVelocity.z
//       ),
//       acceleration: new THREE.Vector3(0, 0, 0),
//       color: 'blue'
//     }
//   ]);
  
//   const [resetTrigger, setResetTrigger] = useState(0)
//   const [displayTime, setDisplayTime] = useState(0)
//   const [isResetting, setIsResetting] = useState(false)
//   const [isPaused, setIsPaused] = useState(true)
//   const [isFullscreen, setIsFullscreen] = useState(false)
//   const dataRef = useRef<{ 
//     t: number[];
//     // Ball A data
//     xA: number[]; yA: number[]; zA: number[]; 
//     vxA: number[]; vyA: number[]; vzA: number[]; 
//     axA: number[]; ayA: number[]; azA: number[];
//     // Ball B data
//     xB: number[]; yB: number[]; zB: number[]; 
//     vxB: number[]; vyB: number[]; vzB: number[]; 
//     axB: number[]; ayB: number[]; azB: number[];
//     // Relative data
//     xRelative: number[]; yRelative: number[]; zRelative: number[];
//     vxRelative: number[]; vyRelative: number[]; vzRelative: number[];
//     axRelative: number[]; ayRelative: number[]; azRelative: number[];
//     flux: number[];
//   }>({
//     t: [],
//     xA: [], yA: [], zA: [], 
//     vxA: [], vyA: [], vzA: [], 
//     axA: [], ayA: [], azA: [],
//     xB: [], yB: [], zB: [], 
//     vxB: [], vyB: [], vzB: [], 
//     axB: [], ayB: [], azB: [],
//     xRelative: [], yRelative: [], zRelative: [],
//     vxRelative: [], vyRelative: [], vzRelative: [],
//     axRelative: [], ayRelative: [], azRelative: [],
//     flux: []
//   });
  
//   // Helper functions for frame transformations
//   const getPositionInFrame = (ballId: string, frame: string) => {
//     const ballA = balls.find(b => b.id === 'ballA');
//     const ballB = balls.find(b => b.id === 'ballB');
    
//     if (!ballA || !ballB) return new THREE.Vector3(0, 0, 0);
    
//     switch(frame) {
//       case 'ground':
//         return balls.find(b => b.id === ballId)?.position.clone() || new THREE.Vector3(0, 0, 0);
      
//       case 'ballA':
//         if (ballId === 'ballA') return new THREE.Vector3(0, 0, 0);
//         return ballB.position.clone().sub(ballA.position);
      
//       case 'ballB':
//         if (ballId === 'ballB') return new THREE.Vector3(0, 0, 0);
//         return ballA.position.clone().sub(ballB.position);
      
//       default:
//         return new THREE.Vector3(0, 0, 0);
//     }
//   };

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

//   type DataKey = 't' | 'x' | 'y' | 'z' | 'vx' | 'vy' | 'vz' | 'ax' | 'ay' | 'az' | 'flux';
//   const updateGraph = (type: string) => {
//     if (dataRef.current.t.length === 0) return;
    
//     const THRESHOLD = 0.05;
//     const filteredIndices = dataRef.current.t
//       .map((t, i) => ({ t, i }))
//       .filter(({ t }) => t >= THRESHOLD)
//       .map(({ i }) => i);

//     // Determine which ball's data to show based on reference frame
//     let yData: number[] = [];
//     if (referenceFrame === 'ground') {
//       const dataKey = `${type}${trackedBall === 'ballA' ? 'A' : 'B'}` as keyof typeof dataRef.current;
//       yData = dataRef.current[dataKey] as number[];
//     } else {
//       const dataKey = `${type}Relative` as keyof typeof dataRef.current;
//       yData = dataRef.current[dataKey] as number[];
//     }

//     const trace = {
//       x: filteredIndices.map(i => dataRef.current.t[i]),
//       y: filteredIndices.map(i => yData[i] || 0),
//       type: 'scatter',
//       mode: 'lines',
//       name: type,
//     };

//     Plotly.react('plot', [trace], {
//       title: `${type}(t) in ${referenceFrame} frame`,
//       xaxis: { title: 'Time (s)' },
//       yaxis: { title: `${type}(t)` },
//     });
//   };

//   const resetSim = () => {
//     setIsPaused(true);
//     setIsResetting(true);
//     setDisplayTime(0);
    
//     // Reset balls with current control values
//     setBalls([
//       {
//         id: 'ballA',
//         position: new THREE.Vector3(
//           physicsControls.ballAPosition.x, 
//           physicsControls.ballAPosition.y, 
//           physicsControls.ballAPosition.z
//         ),
//         velocity: new THREE.Vector3(
//           physicsControls.ballAVelocity.x, 
//           physicsControls.ballAVelocity.y, 
//           physicsControls.ballAVelocity.z
//         ),
//         acceleration: new THREE.Vector3(0, 0, 0),
//         color: 'red'
//       },
//       {
//         id: 'ballB',
//         position: new THREE.Vector3(
//           physicsControls.ballBPosition.x,
//           physicsControls.ballBPosition.y,
//           physicsControls.ballBPosition.z
//         ),
//         velocity: new THREE.Vector3(
//           physicsControls.ballBVelocity.x, 
//           physicsControls.ballBVelocity.y, 
//           physicsControls.ballBVelocity.z
//         ),
//         acceleration: new THREE.Vector3(0, 0, 0),
//         color: 'blue'
//       }
//     ]);
    
//     // Clear data
//     dataRef.current = { 
//       t: [],
//       xA: [], yA: [], zA: [], 
//       vxA: [], vyA: [], vzA: [], 
//       axA: [], ayA: [], azA: [],
//       xB: [], yB: [], zB: [], 
//       vxB: [], vyB: [], vzB: [], 
//       axB: [], ayB: [], azB: [],
//       xRelative: [], yRelative: [], zRelative: [],
//       vxRelative: [], vyRelative: [], vzRelative: [],
//       axRelative: [], ayRelative: [], azRelative: [],
//       flux: []
//     };
    
//     Plotly.purge('plot');
//     setResetTrigger(r => r + 1);
//   };

//   useEffect(() => {
//     if (dataRef.current.xA.length > 0 && dataRef.current.xB.length > 0) {
//       const lastIndex = dataRef.current.xA.length - 1;
      
//       // Calculate relative position, velocity, and acceleration
//       dataRef.current.xRelative.push(dataRef.current.xB[lastIndex] - dataRef.current.xA[lastIndex]);
//       dataRef.current.yRelative.push(dataRef.current.yB[lastIndex] - dataRef.current.yA[lastIndex]);
//       dataRef.current.zRelative.push(dataRef.current.zB[lastIndex] - dataRef.current.zA[lastIndex]);
      
//       dataRef.current.vxRelative.push(dataRef.current.vxB[lastIndex] - dataRef.current.vxA[lastIndex]);
//       dataRef.current.vyRelative.push(dataRef.current.vyB[lastIndex] - dataRef.current.vyA[lastIndex]);
//       dataRef.current.vzRelative.push(dataRef.current.vzB[lastIndex] - dataRef.current.vzA[lastIndex]);
      
//       dataRef.current.axRelative.push(dataRef.current.axB[lastIndex] - dataRef.current.axA[lastIndex]);
//       dataRef.current.ayRelative.push(dataRef.current.ayB[lastIndex] - dataRef.current.ayA[lastIndex]);
//       dataRef.current.azRelative.push(dataRef.current.azB[lastIndex] - dataRef.current.azA[lastIndex]);
//     }
//   }, [balls]); // Run this when balls update

//   useEffect(() => {
//     const timer = setTimeout(() => setVisible(true), 2000)
//     return () => clearTimeout(timer)
//   }, [])

//   useEffect(() => {
//     updateGraph(currentGraph);
//   }, [currentGraph, referenceFrame, trackedBall]); // Add proper dependencies

//   useEffect(() => {
//     if (isResetting) {
//       const id = requestAnimationFrame(() => {
//         setIsResetting(false)
//       })
//       return () => cancelAnimationFrame(id)
//     }
//   }, [resetTrigger])

//   // Add this useEffect to automatically update the graph when new data arrives
//   useEffect(() => {
//     if (!isPaused && dataRef.current.t.length > 0) {
//       updateGraph(currentGraph);
//     }
//   }, [dataRef.current.t.length, isPaused, currentGraph, referenceFrame, trackedBall]);

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
//     top: 140,
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

//         <PhysicsSimulation 
//           isPaused={isPaused} 
//           setBalls={setBalls}
//           setDisplayTime={setDisplayTime}
//           dataRef={dataRef}
//           TIME_SCALE={TIME_SCALE}
//           displayTime={displayTime}
//           physicsControls={physicsControls}
//         />
//         <ambientLight intensity={0.5} />
//         <pointLight position={[50, 50, 50]} />
//         <axesHelper args={[10]} />
//         <InfiniteXYGrid />
//         <AxisLabels isFullscreen={isFullscreen}/>
//         {balls.map(ball => {
//           const transformedPos = getPositionInFrame(ball.id, referenceFrame);
//           return (
//             <Ball
//               key={ball.id}
//               position={transformedPos}
//               color={ball.color}
//               shapeParams={shapeControls}
//               rotation={rotation}
//               showVectorField={showVectorField}
//             />
//           );
//         })}

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

        
//         <OrbitControls makeDefault />
//       </Canvas>

//       {visible && isFullscreen && (
//         <LaTeXOverlay3D 
//           position={{ top: '525px', left: '20px' }} 
//           currentTime={currentTime} 
//           visible={true}
//         />
//       )}

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
//               t: [], xA: [], yA: [], zA: [], vxA: [], vyA: [], vzA: [], axA: [], ayA: [], azA: [],
//               xB: [], yB: [], zB: [], vxB: [], vyB: [], vzB: [], axB: [], ayB: [], azB: [],
//               xRelative: [], yRelative: [], zRelative: [], vxRelative: [], vyRelative: [], vzRelative: [],
//               axRelative: [], ayRelative: [], azRelative: [], flux: []
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