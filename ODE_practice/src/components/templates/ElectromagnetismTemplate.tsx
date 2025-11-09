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
// const MAX_ARROWS = 100000 // Performance safeguard

// // ==============================================
// // Enhanced Vector Field Component with Flux Integration
// // ==============================================

// const getShapePosition = ({
//   u, v, shapeType,
//   sphereRadius = 1,
//   torusOuterRadius = 1,
//   torusInnerRadius = 0.3,
//   cylinderRadius = 1,
//   cylinderHeight = 2
// }: any): THREE.Vector3 => {
//   u *= Math.PI * 2
//   v *= Math.PI

//   switch (shapeType) {
//     case 'sphere':
//       return new THREE.Vector3(
//         Math.sin(v) * Math.cos(u),
//         Math.sin(v) * Math.sin(u),
//         Math.cos(v)
//       ).multiplyScalar(sphereRadius)

//     case 'torus':
//       return new THREE.Vector3(
//         (torusOuterRadius + torusInnerRadius * Math.cos(v)) * Math.cos(u),
//         (torusOuterRadius + torusInnerRadius * Math.cos(v)) * Math.sin(u),
//         torusInnerRadius * Math.sin(v)
//       )

//     case 'cylinder':
//       return new THREE.Vector3(
//         cylinderRadius * Math.cos(u),
//         cylinderRadius * Math.sin(u),
//         (v / Math.PI - 0.5) * cylinderHeight
//       )

//     default:
//       return new THREE.Vector3(u, v, 0)
//   }
// }

// interface FluxResult {
//   totalFlux: number;
//   positiveFlux: number;
//   negativeFlux: number;
// }

// const calculateFlux = (
//   shapeType: string,
//   position: THREE.Vector3,
//   rotation: THREE.Quaternion,
//   params: {
//     sphereRadius?: number;
//     torusOuterRadius?: number;
//     torusInnerRadius?: number;
//     cylinderRadius?: number;
//     cylinderHeight?: number;
//   },
//   resolution: number = 100
// ): FluxResult => {
//   const { sphereRadius = 1, torusOuterRadius = 1, torusInnerRadius = 0.3, cylinderRadius = 1, cylinderHeight = 2 } = params;
  
//   let totalFlux = 0;
//   let positiveFlux = 0;
//   let negativeFlux = 0;
//   const step = 1 / resolution;
  
//   // Numerical integration using midpoint rule
//   for (let u = 0; u < 1; u += step) {
//     for (let v = 0; v < 1; v += step) {
//       // Calculate position on surface
//       const surfacePos = getShapePosition({ 
//         u: u + step/2, 
//         v: v + step/2, 
//         shapeType,
//         sphereRadius,
//         torusOuterRadius,
//         torusInnerRadius,
//         cylinderRadius,
//         cylinderHeight
//       });
      
//       // Calculate normal vector (outward pointing)
//       let normal: THREE.Vector3;
//       switch (shapeType) {
//         case 'sphere':
//           normal = surfacePos.clone().normalize();
//           break;
//         case 'torus':
//           // More complex normal calculation for torus
//           const uAngle = (u + step/2) * Math.PI * 2;
//           const vAngle = (v + step/2) * Math.PI * 2;
//           normal = new THREE.Vector3(
//             Math.cos(uAngle) * Math.cos(vAngle),
//             Math.sin(uAngle) * Math.cos(vAngle),
//             Math.sin(vAngle)
//           ).normalize();
//           break;
//         case 'cylinder':
//           normal = new THREE.Vector3(
//             surfacePos.x,
//             surfacePos.y,
//             0
//           ).normalize();
//           break;
//         default: // plane
//           normal = new THREE.Vector3(0, 0, 1);
//       }
      
//       // Apply rotation to normal
//       normal.applyQuaternion(rotation);
      
//       // Calculate vector field at this point
//       const fieldValue = new THREE.Vector3(
//         -surfacePos.x * surfacePos.x, 
//         surfacePos.y * surfacePos.y, 
//         -surfacePos.z * surfacePos.z
//       ).normalize();
      
//       // Apply rotation to field value
//       fieldValue.applyQuaternion(rotation);
      
//       // Dot product gives flux through this patch
//       const flux = fieldValue.dot(normal);
      
//       // Calculate area element
//       let area = 1;
//       switch (shapeType) {
//         case 'sphere':
//           area = sphereRadius * sphereRadius * Math.sin((v + step/2) * Math.PI) * step * step * Math.PI * Math.PI;
//           break;
//         case 'torus':
//           area = torusInnerRadius * (torusOuterRadius + torusInnerRadius * Math.cos((v + step/2) * Math.PI * 2)) * 
//                  step * step * 4 * Math.PI * Math.PI;
//           break;
//         case 'cylinder':
//           area = cylinderRadius * step * step * 2 * Math.PI * cylinderHeight;
//           break;
//         case 'plane':
//           area = step * step;
//           break;
//       }
      
//       // Add to totals
//       totalFlux += flux * area;
//       if (flux > 0) positiveFlux += flux * area;
//       else negativeFlux += flux * area;
//     }
//   }
  
//   return { totalFlux, positiveFlux, negativeFlux };
// };

// interface ArrowProps {
//   position: THREE.Vector3
//   direction: THREE.Vector3
//   length?: number
//   color?: THREE.Color | string
// }

// const Arrow = ({ position, direction, length = 1, color = 'white' }: ArrowProps) => {
//   const ref = useRef<THREE.ArrowHelper>(null)
  
//   useMemo(() => {
//     if (ref.current) {
//       ref.current.position.copy(position)
//       ref.current.setDirection(direction.clone().normalize())
//       ref.current.setLength(length, length * 0.3, length * 0.1)
//       ref.current.setColor(new THREE.Color(color as THREE.ColorRepresentation))
//     }
//   }, [position, direction, length, color])
  
//   return <primitive 
//     object={new THREE.ArrowHelper(
//       direction.clone().normalize(),
//       position,
//       length,
//       new THREE.Color(color as THREE.ColorRepresentation),
//       length * 0.3,
//       length * 0.1
//     )}
//     ref={ref}
//   />
// }

// interface VectorFieldProps {
//   position?: THREE.Vector3;
//   shapeType?: string;
//   sphereRadius?: number;
//   torusOuterRadius?: number;
//   torusInnerRadius?: number;
//   cylinderRadius?: number;
//   cylinderHeight?: number;
//   rotation?: THREE.Quaternion;
// }

// const VectorField = (props: VectorFieldProps) => {
//   const {
//     position = new THREE.Vector3(10, 0, 0),
//     shapeType = 'sphere',
//     sphereRadius = 1,
//     torusOuterRadius = 1,
//     torusInnerRadius = 0.3,
//     cylinderRadius = 1,
//     cylinderHeight = 2,
//     rotation = new THREE.Quaternion()
//   } = props;

//   const { 
//     fieldResolution = 12,
//     arrowSize = 0.5,
//     vectorFieldOpacity = 0.8
//   } = useControls('Vector Field', {
//     fieldResolution: { value: 12, min: 5, max: 30, step: 1 },
//     arrowSize: { value: 0.5, min: 0.1, max: 2, step: 0.1 },
//     vectorFieldOpacity: { value: 0.8, min: 0.1, max: 1, step: 0.1 }
//   });

//   const [flux, setFlux] = useState<FluxResult>({ totalFlux: 0, positiveFlux: 0, negativeFlux: 0 });
  
//   useEffect(() => {
//     const newFlux = calculateFlux(
//       shapeType,
//       position,
//       rotation,
//       {
//         sphereRadius,
//         torusOuterRadius,
//         torusInnerRadius,
//         cylinderRadius,
//         cylinderHeight
//       },
//       fieldResolution * 2
//     );
//     setFlux(newFlux);
//   }, [
//     shapeType, 
//     position, 
//     rotation,
//     sphereRadius,
//     torusOuterRadius,
//     torusInnerRadius,
//     cylinderRadius,
//     cylinderHeight,
//     fieldResolution
//   ]);

//   const arrows = useMemo(() => {
//     const arr = [];
//     const step = 1 / fieldResolution;
//     let count = 0;
//     const magnitudes: number[] = [];
//     const positions: THREE.Vector3[] = [];
//     const directions: THREE.Vector3[] = [];

//     // First pass: collect all positions, directions and magnitudes
//     for (let u = 0; u < 1 && count < MAX_ARROWS; u += step) {
//       for (let v = 0; v < 1 && count < MAX_ARROWS; v += step) {
//         const surfacePos = getShapePosition({ 
//           u, v, shapeType,
//           sphereRadius,
//           torusOuterRadius,
//           torusInnerRadius,
//           cylinderRadius,
//           cylinderHeight
//         });

//         const dir = new THREE.Vector3(
//           -surfacePos.x * surfacePos.x, 
//           surfacePos.y * surfacePos.y, 
//           -surfacePos.z * surfacePos.z
//         ).normalize();

//         const finalPos = surfacePos.clone()
//           .applyQuaternion(rotation)
//           .add(position);

//         const finalDir = dir.clone().applyQuaternion(rotation);
        
//         magnitudes.push(finalDir.length());
//         positions.push(finalPos);
//         directions.push(finalDir);
//         count++;
//       }
//     }

//     // Find min and max magnitude for normalization
//     const maxMagnitude = Math.max(...magnitudes);
//     const minMagnitude = Math.min(...magnitudes);
//     const magnitudeRange = maxMagnitude - minMagnitude;

//     // Second pass: create arrows with normalized colors
//     for (let i = 0; i < positions.length; i++) {
//       const pos = positions[i];
//       const dir = directions[i];
//       const mag = magnitudes[i];
      
//       // Normalize magnitude (0 to 1) based on min/max
//       const normalizedMag = magnitudeRange > 0 
//         ? (mag - minMagnitude) / magnitudeRange 
//         : 0.5;

//       // Enhanced color spectrum (blue -> cyan -> green -> yellow -> red)
//       const color = new THREE.Color();
//       if (normalizedMag < 0.25) {
//         color.lerpColors(
//           new THREE.Color(0x0000FF), 
//           new THREE.Color(0x00FFFF),
//           normalizedMag / 0.25
//         );
//       } else if (normalizedMag < 0.5) {
//         color.lerpColors(
//           new THREE.Color(0x00FFFF),
//           new THREE.Color(0x00FF00),
//           (normalizedMag - 0.25) / 0.25
//         );
//       } else if (normalizedMag < 0.75) {
//         color.lerpColors(
//           new THREE.Color(0x00FF00),
//           new THREE.Color(0xFFFF00),
//           (normalizedMag - 0.5) / 0.25
//         );
//       } else {
//         color.lerpColors(
//           new THREE.Color(0xFFFF00),
//           new THREE.Color(0xFF0000),
//           (normalizedMag - 0.75) / 0.25
//         );
//       }

//       arr.push(
//         <Arrow
//           key={`arrow-${i}`}
//           position={pos}
//           direction={dir}
//           length={arrowSize * (0.5 + 0.5 * normalizedMag)}
//           color={color}
//         />
//       );
//     }

//     return arr;
//   }, [
//     shapeType, 
//     position, 
//     fieldResolution, 
//     arrowSize,
//     vectorFieldOpacity,
//     sphereRadius,
//     torusOuterRadius,
//     torusInnerRadius,
//     cylinderRadius,
//     cylinderHeight, 
//     rotation
//   ]);

//   return (
//     <group>
//       {arrows}
//       <Html position={[0, 0, 0]} center>
//         <div style={{
//           background: 'rgba(0, 0, 0, 0.7)',
//           color: 'white',
//           padding: '10px',
//           borderRadius: '5px',
//           pointerEvents: 'none',
//           minWidth: '200px',
//           textAlign: 'center'
//         }}>
//           <div>Total Flux: {flux.totalFlux.toFixed(4)}</div>
//           <div>Positive Flux: {flux.positiveFlux.toFixed(4)}</div>
//           <div>Negative Flux: {flux.negativeFlux.toFixed(4)}</div>
//         </div>
//       </Html>
//     </group>
//   );
// };

// function VectorMagnitudeLegend({}: {visible : boolean}) {
//   return (
//     <Html
//       position={[0, -5, 0]}
//       center
//       transform
//       style={{
//         pointerEvents: 'none',
//         width: '300px'
//       }}
//     >
//       <div style={{
//         background: 'linear-gradient(to right, #0000FF, #FF0000)',
//         padding: '6px 0',
//         color: 'white',
//         textAlign: 'center',
//         fontSize: '12px',
//         borderRadius: '4px',
//         opacity: 0.9
//       }}>
//         Low ← Magnitude → High
//       </div>
//     </Html>
//   )
// }

// // ==============================================
// // Ball Physics Component
// // ==============================================
// function Ball({
//   initPos,
//   initVel,
//   resetTrigger,
//   onUpdate,
//   paused,
//   mass,
//   C_d,
//   rho,
//   sphereRadius,
//   torusOuterRadius,
//   torusInnerRadius,
//   cylinderRadius,
//   cylinderHeight,
//   shapeType,
//   rotation
// }: {
//   initPos: number[],
//   initVel: number[],
//   resetTrigger: any,
//   onUpdate: any,
//   paused: boolean,
//   mass: number,
//   C_d: number,
//   rho: number,
//   sphereRadius: number,
//   torusOuterRadius: number,
//   torusInnerRadius: number,
//   cylinderRadius: number,
//   cylinderHeight: number,
//   shapeType: string,
//   rotation: THREE.Quaternion
// }) {
//   const ref = useRef<THREE.Mesh>(null)
//   const [pos, setPos] = useState(new THREE.Vector3(...initPos))
//   const [vel, setVel] = useState(new THREE.Vector3(...initVel))
//   const time = useRef(0)
//   const ready = useRef(false)
  

//   const g = new THREE.Vector3(0, 0, -9.8)
//   const A = Math.PI * sphereRadius * sphereRadius

//   useFrame(() => {
//     if (ref.current) {
//       ref.current.quaternion.copy(rotation);
//     }
//   });

//   function acceleration(v: THREE.Vector3) {
//     const drag = v.clone().multiplyScalar(-0.5 * rho * C_d * A * v.length() / mass)
//     return g.clone().add(drag)
//   }

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

//   useFrame((_, delta) => {
//     if (paused || !ready.current) return

//     const h = 0.01
//     const steps = Math.floor(delta * TIME_SCALE / h)

//     let v = vel.clone()
//     let p = pos.clone()

//     for (let i = 0; i < steps; i++) {
//       const a1 = acceleration(v)
//       const a2 = acceleration(v.clone().add(a1.clone().multiplyScalar(h / 2)))
//       const a3 = acceleration(v.clone().add(a2.clone().multiplyScalar(h / 2)))
//       const a4 = acceleration(v.clone().add(a3.clone().multiplyScalar(h)))

//       const avgA = a1.clone().add(a2.clone().multiplyScalar(2)).add(a3.clone().multiplyScalar(2)).add(a4).multiplyScalar(1 / 6)
//       v.add(avgA.clone().multiplyScalar(h))
//       p.add(v.clone().multiplyScalar(h))
//       time.current += h
//     }

//     setVel(v)
//     setPos(p)
//     if (ref.current) ref.current.position.copy(p)
//     onUpdate({ 
//       time: time.current, 
//       position: p.clone(),
//       velocity: v.clone(),
//       acceleration: acceleration(v)
//     })
//   })

//   return (
//     <mesh ref={ref}>
//       {shapeType === 'sphere' && <sphereGeometry args={[sphereRadius, 32, 32]} />}
//       {shapeType === 'torus' && <torusGeometry args={[torusOuterRadius, torusInnerRadius, 16, 100]} />}
//       {shapeType === 'cylinder' && <cylinderGeometry args={[cylinderRadius, cylinderRadius, cylinderHeight, 32]} />}
//       {shapeType === 'plane' && <planeGeometry args={[sphereRadius * 3, sphereRadius * 3]} />}
//       <meshStandardMaterial color="orange" />
//     </mesh>
//   )
// }

// // ==============================================
// // Scene Components
// // ==============================================
// function AxisLabels() {
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

// // ==============================================
// // Helper Functions
// // ==============================================
// function formatTime(seconds: number): string {
//   const mins = Math.floor(seconds / 60);
//   const secs = Math.floor(seconds % 60);
//   return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
// }

// // ==============================================
// // Main Simulation Component
// // ==============================================
// export default function Electromagnetism() {
//   // State and ref management
//   const { showVectorField} = useControls('Vector Field Settings', {
//     showVectorField: { value: false },
//   }, { collapsed: true } )

//   const { shapeType } = useControls('Shape Settings', {
//     shapeType: { value: 'sphere', options: ['sphere', 'torus', 'cylinder', 'plane'] }
//   }, { collapsed: true })

//   const sphereControls = useControls('Sphere', {
//     sphereRadius: { value: 1, min: 0.1, max: 5, step: 0.1 }
//   }, { collapsed: true })

//   const torusControls = useControls('Torus', {
//     torusOuterRadius: { value: 1.5, min: 0.5, max: 5, step: 0.1 },
//     torusInnerRadius: { value: 0.3, min: 0.1, max: 2, step: 0.05 }
//   }, { collapsed: true})

//   const cylinderControls = useControls('Cylinder', {
//     cylinderRadius: { value: 0.7, min: 0.1, max: 3, step: 0.1 },
//     cylinderHeight: { value: 2, min: 0.5, max: 10, step: 0.1 }
//   }, { collapsed: true},)

//   const { rotationX, rotationY, rotationZ } = useControls('Rotation', {
//     rotationX: { value: 0, min: -Math.PI, max: Math.PI, step: 0.1 },
//     rotationY: { value: 0, min: -Math.PI, max: Math.PI, step: 0.1 },
//     rotationZ: { value: 0, min: -Math.PI, max: Math.PI, step: 0.1 }
//   }, { collapsed: true })

//   const rotation = useMemo(() => {
//     return new THREE.Quaternion().setFromEuler(
//       new THREE.Euler(rotationX, rotationY, rotationZ)
//   )}, [rotationX, rotationY, rotationZ]);

//   const { px, py, pz, vx, vy, vz, mass, C_d, rho} = useControls('Initial Conditions', {
//     px: { value: 0, min: -10, max: 10, step: 0.1 },
//     py: { value: 0, min: -10, max: 10, step: 0.1 },
//     pz: { value: 10, min: 0, max: 20, step: 0.1 },
//     vx: { value: 0, min: -200, max: 200, step: 0.5 },
//     vy: { value: 0, min: -200, max: 200, step: 0.5 },
//     vz: { value: 0, min: -200, max: 200, step: 0.5 },
//     mass: {value: 1444, min: 0, max: 10000, step: 1},
//     C_d: {value: 0.47, min: 0, max: 1, step: 0.01},
//     rho: {value: 1.23, min: 0, max: 10, step: 0.01},
//   }, { collapsed: true })

//   const [resetTrigger, setResetTrigger] = useState(0)
//   const [displayTime, setDisplayTime] = useState(0)
//   const [isResetting, setIsResetting] = useState(false)
//   const [isPaused, setIsPaused] = useState(true)
//   const [isFullscreen, setIsFullscreen] = useState(false)
//   const dataRef = useRef<{ 
//     t: number[]; 
//     x: number[]; y: number[]; z: number[]; 
//     vx: number[]; vy: number[]; vz: number[]; 
//     ax: number[]; ay: number[]; az: number[] 
//   }>({
//     t: [], x: [], y: [], z: [], 
//     vx: [], vy: [], vz: [], 
//     ax: [], ay: [], az: []
//   })

//   // Audio management
//   const audioRef = useRef<HTMLAudioElement>(null)
//   const [playing, setPlaying] = useState(false)
//   const [volume, setVolume] = useState(1)
//   const [duration, setDuration] = useState(0)
//   const [currentTime, setCurrentTime] = useState(0)

//   const [ballPos, setBallPos] = useState(new THREE.Vector3(px, py, pz));

//   const [currentGraph, setCurrentGraph] = useState<'x'|'y'|'z'|'vx'|'vy'|'vz'|'ax'|'ay'|'az'>('z');

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
    
//     // Update data storage
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

//     // Auto-update the current graph
//     updateGraph(currentGraph);
//   };
  
//   type DataKey = 't' | 'x' | 'y' | 'z' | 'vx' | 'vy' | 'vz' | 'ax' | 'ay' | 'az';

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

//   // Simulation control
//   const resetSim = () => {
//     setIsPaused(true)
//     setIsResetting(true)
//     setDisplayTime(0)
//     dataRef.current = { 
//       t: [], x: [], y: [], z: [], 
//       vx: [], vy: [], vz: [], 
//       ax: [], ay: [], az: [] 
//     }
//     Plotly.purge('plot')
//     setResetTrigger(r => r + 1)
//   }

//   // UI state management
//   const [visible, setVisible] = useState(false)
//   useEffect(() => {
//     const timer = setTimeout(() => setVisible(true), 2000)
//     return () => clearTimeout(timer)
//   }, [])

//   useEffect(() => {
//     // Initialize with z-position graph
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

//   // Audio effects
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

//   // UI Styles
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

//   // Main render
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
//         <AxisLabels />
//         <VectorMagnitudeLegend visible={isFullscreen}/>
//         <Ball
//           initPos={[px, py, pz]}
//           initVel={[vx, vy, vz]}
//           resetTrigger={resetTrigger}
//           paused={isPaused}
//           onUpdate={handleUpdate}
//           mass={mass}
//           C_d={C_d}
//           rho={rho}
//           shapeType={shapeType}
//           sphereRadius={sphereControls.sphereRadius}
//           torusOuterRadius={torusControls.torusOuterRadius}
//           torusInnerRadius={torusControls.torusInnerRadius}
//           cylinderRadius={cylinderControls.cylinderRadius}
//           cylinderHeight={cylinderControls.cylinderHeight}
//           rotation={rotation}
//         />

//         {showVectorField && (
//           <group renderOrder={1}>
//             <VectorField
//               shapeType={shapeType}
//               position={ballPos}
//               sphereRadius={sphereControls.sphereRadius}
//               torusOuterRadius={torusControls.torusOuterRadius}
//               torusInnerRadius={torusControls.torusInnerRadius}
//               cylinderRadius={cylinderControls.cylinderRadius}
//               cylinderHeight={cylinderControls.cylinderHeight}
//               rotation={rotation}
//             />
//           </group>
//         )}

//         {visible && (
//           <LaTeXOverlay3D position={[0, 5, 5]} currentTime={currentTime} visible={isFullscreen}/>
//         )}
        
//         <OrbitControls makeDefault />
//       </Canvas>
      
//       <audio ref={audioRef} src={sampleAudio} preload="metadata" />

//       {/* Fullscreen prompt overlay */}
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

//       {/* Fullscreen overlay UI */}
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
//               ax: [], ay: [], az: [] 
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
//           </select>
//           <div id="plot" style={{ width: 450, height: 300, top: 290 }}></div>
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

//       {/* Audio controls */}
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