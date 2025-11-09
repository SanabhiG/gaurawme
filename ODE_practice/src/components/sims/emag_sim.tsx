// import { Canvas, useFrame } from '@react-three/fiber'
// import { OrbitControls, Html } from '@react-three/drei'
// import { useRef, useState, useEffect, useMemo, useCallback} from 'react'
// import { useControls, Leva } from 'leva'
// import * as THREE from 'three'
// import Plotly from 'plotly.js-dist-min'
// import sampleAudio from '../assets/drag-force-simulation.wav'
// import { LaTeXOverlay3D } from './LatexOverlay'
// import { useDebounce } from 'use-debounce';

// // Constants
// const TIME_SCALE = 1

// // ==============================================
// // Enhanced Vector Field Component
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

// interface ArrowProps {
//   position: THREE.Vector3
//   direction: THREE.Vector3
//   length?: number
//   color?: THREE.Color | string
//   onPointerOver?: () => void;
//   onPointerOut?: () => void;
// }

// const Arrow = ({ position, direction, length = 1, color = 'white', onPointerOver, onPointerOut}: ArrowProps) => {
//   const ref = useRef<THREE.ArrowHelper>(null)
//   const actualLength = direction.length() * length;
//   const headLength = Math.min(actualLength * 0.025, 0.5);
//   const headWidth = Math.min(actualLength * 0.025, 0.2);

//   useMemo(() => {
//     if (ref.current) {
//       ref.current.position.copy(position)
//       ref.current.setDirection(direction.clone().normalize())
//       ref.current.setLength(length, length * 0.3, length * 0.1)
//       ref.current.setColor(new THREE.Color(color as THREE.ColorRepresentation))
//     }
//   }, [position, direction, length, color])
  
//   return (
//     <group onPointerOver={onPointerOver} onPointerOut={onPointerOut}>
//       <primitive 
//         object={new THREE.ArrowHelper(
//           direction.clone().normalize(),
//           position,
//           actualLength,
//           new THREE.Color(color as THREE.ColorRepresentation),
//           headLength,
//           headWidth
//         )}
//       />
//     </group>
//   );
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
//   isFullScreen?: boolean;
// }

// const VectorField = ({
//   position = new THREE.Vector3(0, 0, 0),
//   shapeType = 'sphere',
//   sphereRadius = 1,
//   torusOuterRadius = 1,
//   torusInnerRadius = 0.3,
//   cylinderRadius = 1,
//   cylinderHeight = 2,
//   rotation = new THREE.Quaternion(),
// }: VectorFieldProps) => {
//   const { fieldResolution, electricFieldFunction, magneticFieldFunction, vectorScale, showElectricField, showMagneticField} = useControls('Vector Field', {
//     fieldResolution: { value: 18, min: 2, max: 45, step: 1 },
//     arrowSize: { value: 0.3, min: 0.1, max: 2, step: 0.1 },
//     vectorScale: { 
//       value: 1, 
//       min: 0.01, 
//       max: 10, 
//       step: 0.01,
//       label: 'Vector Scale Factor'
//     },
//     electricFieldFunction: { 
//       value: "(r, t) => {\n  // r is position vector [x,y,z]\n  // t is time\n  return [0, 0, 2]; // Example: linear field in z-direction\n}",
//       rows: 5,
//       label: 'Electric Field Function Input'
//     },
//     showElectricField: {value: true},
//     magneticFieldFunction: { 
//       value: "(r, t) => {\n  // r is position vector [x,y,z]\n  // t is time\n  return [0, 2, 0]; // Example: linear field in z-direction\n}",
//       rows: 5,
//       label: 'Magnetic Field Function Input'
//     },
//     showMagneticField: {value: true},

//   }, { collapsed: true });
//   const [debouncedResolution] = useDebounce(fieldResolution, 300);
  
//   const getElectricFieldAtPoint = useMemo(() => {
//     return parseVectorFieldFunction(electricFieldFunction);
//   }, [electricFieldFunction]);

//   const getMagneticFieldAtPoint = useMemo(() => {
//     return parseVectorFieldFunction(magneticFieldFunction);
//   }, [magneticFieldFunction]);
  
//   const arrows = useMemo(() => {
//     const arr = [];
//     const step = 1 / fieldResolution;
//     const currentTime = performance.now() / 1000;

//     for (let u = 0; u < 1; u += step) {
//       for (let v = 0; v < 1; v += step) {
//         const surfacePos = getShapePosition({ 
//           u, v, shapeType,
//           sphereRadius,
//           torusOuterRadius,
//           torusInnerRadius,
//           cylinderRadius,
//           cylinderHeight
//         }).applyQuaternion(rotation).add(position);
        
//         // Electric field (blue)
//         if (showElectricField) {
//           const E = getElectricFieldAtPoint(surfacePos, currentTime).multiplyScalar(vectorScale);
//           const eMagnitude = E.length();
//           const eColor = new THREE.Color().setHSL(0.6, 0.5 + 0.5 * Math.min(eMagnitude / vectorScale, 1), 0.7);
//           arr.push(
//             <Arrow
//               key={`e-arrow-${u}-${v}`}
//               position={surfacePos}
//               direction={E}
//               length={eMagnitude * 0.5}
//               color={eColor}
//             />
//           );
//         }

//         // Magnetic field (red)
//         if (showMagneticField) {
//           const B = getMagneticFieldAtPoint(surfacePos, currentTime).multiplyScalar(vectorScale);
//           const bMagnitude = B.length();
//           const bColor = new THREE.Color().setHSL(0.0, 0.5 + 0.5 * Math.min(bMagnitude / vectorScale, 1), 0.7);
//           arr.push(
//             <Arrow 
//               key={`b-arrow-${u}-${v}`}
//               position={surfacePos}
//               direction={B}
//               length={bMagnitude * 0.5}
//               color={bColor}
//             />
//           );
//         }
//       }
//     }
//     return arr;
//   }, [fieldResolution, shapeType, position, rotation, showElectricField, showMagneticField,
//       sphereRadius, torusOuterRadius, torusInnerRadius, cylinderRadius, cylinderHeight, debouncedResolution]);

//   return (
//     <group>
//       {arrows}
//     </group>
//   );
// };

// function parseVectorFieldFunction(code: string): (position: THREE.Vector3, time: number) => THREE.Vector3 {
//   if (typeof code !== 'string') return () => new THREE.Vector3();
//   try {
//     const func = new Function(`return ${code}`)();
//     return (position: THREE.Vector3, time: number) => {
//       try {
//         const result = func([position.x, position.y, position.z], time);
//         if (Array.isArray(result) && result.length >= 3) {
//           return new THREE.Vector3(result[0], result[1], result[2]);
//         }
//         console.error("Function must return an array of 3 numbers");
//         return new THREE.Vector3();
//       } catch (e) {
//         console.error("Error executing vector field function:", e);
//         return new THREE.Vector3();
//       }
//     };
//   } catch (e) {
//     console.error("Error parsing vector field function:", e);
//     return () => new THREE.Vector3();
//   }
// }

// interface ShapeParams {
//   shapeType: 'sphere' | 'torus' | 'cylinder' | 'plane';
//   sphereRadius?: number;
//   torusOuterRadius?: number;
//   torusInnerRadius?: number;
//   cylinderRadius?: number;
//   cylinderHeight?: number;
// }

// interface BallProps {
//   initPos: number[];
//   initVel: number[];
//   resetTrigger: any;
//   onUpdate: (data: {
//     time: number;
//     position: THREE.Vector3;
//     velocity: THREE.Vector3;
//     acceleration: THREE.Vector3;
//   }) => void;
//   paused: boolean;
//   shapeParams: ShapeParams;
//   rotation: THREE.Quaternion;
//   showVectorField: boolean;
//   mass: number;
//   charge: number;
//   electricFieldFunction: string;  // Add this
//   magneticFieldFunction: string; // Add this
// }

// function Ball({
//   initPos,
//   initVel,
//   resetTrigger,
//   onUpdate,
//   paused,
//   shapeParams,
//   rotation,
//   showVectorField,
//   mass,
//   charge,
//   electricFieldFunction,
//   magneticFieldFunction
// }: BallProps) {
//   const ref = useRef<THREE.Mesh>(null);
//   const [pos, setPos] = useState(new THREE.Vector3(...initPos));
//   const [vel, setVel] = useState(new THREE.Vector3(...initVel));
//   const time = useRef(0);
//   const ready = useRef(false);
//   const lastUpdateTime = useRef(0);
//   const updateInterval = useRef(0.016); // ~60fps

//   // Memoized field evaluators
//   const getElectricField = useMemo(() => 
//     parseVectorFieldFunction(electricFieldFunction), 
//     [electricFieldFunction]
//   );
//   const getMagneticField = useMemo(() => 
//     parseVectorFieldFunction(magneticFieldFunction), 
//     [magneticFieldFunction]
//   );

//   // Lorentz force acceleration calculation
//   const acceleration = useCallback((vel: THREE.Vector3, pos: THREE.Vector3, time: number) => {
//     const E = getElectricField(pos, time);
//     const B = getMagneticField(pos, time);
    
//     const vCrossB = new THREE.Vector3().crossVectors(vel, B);
//     return new THREE.Vector3()
//       .addVectors(E, vCrossB)
//       .multiplyScalar(charge / mass);
//   }, [getElectricField, getMagneticField, charge, mass]);

//   // Reset logic
//   useEffect(() => {
//     const newPos = new THREE.Vector3(...initPos);
//     const newVel = new THREE.Vector3(...initVel);
//     time.current = 0;
//     lastUpdateTime.current = 0;
//     setPos(newPos);
//     setVel(newVel);
    
//     if (ref.current) {
//       ref.current.position.copy(newPos);
//     }

//     const initialAccel = acceleration(newVel, newPos, 0);
//     onUpdate({
//       time: 0,
//       position: newPos,
//       velocity: newVel,
//       acceleration: initialAccel
//     });

//     ready.current = false;
//     requestAnimationFrame(() => {
//       ready.current = true;
//     });
//   }, [resetTrigger, acceleration, onUpdate, initPos, initVel]);

//   // Animation frame update
//   useFrame((_, delta) => {
//     if (paused || !ready.current) return;
    
//     const h = 0.01; // Fixed timestep
//     const steps = Math.max(1, Math.floor(delta * TIME_SCALE / h));
//     let v = vel.clone();
//     let p = pos.clone();

//     // RK4 integration
//   // More precise RK4 implementation
//   for (let i = 0; i < steps; i++) {
//     const pos = p.clone();
//     const vel = v.clone();
    
//     const k1v = acceleration(vel, pos, time.current);
//     const k1x = vel.clone();
    
//     const k2v = acceleration(
//       vel.clone().add(k1v.clone().multiplyScalar(h/2)),
//       pos.clone().add(k1x.clone().multiplyScalar(h/2)),
//       time.current + h/2
//     );
//     const k2x = vel.clone().add(k1v.clone().multiplyScalar(h/2));
    
//     const k3v = acceleration(
//       vel.clone().add(k2v.clone().multiplyScalar(h/2)),
//       pos.clone().add(k2x.clone().multiplyScalar(h/2)),
//       time.current + h/2
//     );
//     const k3x = vel.clone().add(k2v.clone().multiplyScalar(h/2));
    
//     const k4v = acceleration(
//       vel.clone().add(k3v.clone().multiplyScalar(h)),
//       pos.clone().add(k3x.clone().multiplyScalar(h)),
//       time.current + h
//     );
//     const k4x = vel.clone().add(k3v.clone().multiplyScalar(h));

//     v.add(
//       k1v.clone().add(k2v.clone().multiplyScalar(2))
//       .add(k3v.clone().multiplyScalar(2))
//       .add(k4v)
//       .multiplyScalar(h/6)
//     );
    
//     p.add(
//       k1x.clone().add(k2x.clone().multiplyScalar(2))
//       .add(k3x.clone().multiplyScalar(2))
//       .add(k4x)
//       .multiplyScalar(h/6)
//     );
    
//     time.current += h;
//   }

//     setVel(v);
//     setPos(p);
//     if (ref.current) ref.current.position.copy(p);

//     // Only update data at a controlled rate
//     if (time.current - lastUpdateTime.current >= updateInterval.current) {
//       const currentAccel = acceleration(v, p, time.current);
//       onUpdate({
//         time: time.current,
//         position: p,
//         velocity: v,
//         acceleration: currentAccel
//       });
//       lastUpdateTime.current = time.current;
//     }
//   });

//   // Apply rotation every frame
//   useFrame(() => {
//     if (ref.current) {
//       ref.current.quaternion.copy(rotation);
//     }
//   });

//   return (
//     <mesh ref={ref}>
//       {shapeParams.shapeType === 'sphere' && (
//         <sphereGeometry args={[shapeParams.sphereRadius ?? 1, 32, 32]} />
//       )}
//       {shapeParams.shapeType === 'torus' && (
//         <torusGeometry args={[
//           shapeParams.torusOuterRadius ?? 1, 
//           shapeParams.torusInnerRadius ?? 0.3, 
//           16, 100
//         ]} />
//       )}
//       {shapeParams.shapeType === 'cylinder' && (
//         <cylinderGeometry args={[
//           shapeParams.cylinderRadius ?? 0.5, 
//           shapeParams.cylinderRadius ?? 0.5, 
//           shapeParams.cylinderHeight ?? 2, 
//           32
//         ]} />
//       )}
//       {shapeParams.shapeType === 'plane' && (
//         <planeGeometry args={[5, 5]} />
//       )}
//       <meshStandardMaterial 
//         color="orange" 
//         transparent={true} 
//         opacity={showVectorField ? 0.85 : 1}
//       />
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

// function formatTime(seconds: number): string {
//   const mins = Math.floor(seconds / 60);
//   const secs = Math.floor(seconds % 60);
//   return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
// }

// export default function FluxVisualization() {
  
//   const { electricFieldFunction, magneticFieldFunction } = useControls('Vector Field', {
//     fieldResolution: { value: 18, min: 2, max: 45, step: 1 },
//     arrowSize: { value: 0.3, min: 0.1, max: 2, step: 0.1 },
//     vectorScale: { 
//       value: 1, 
//       min: 0.01, 
//       max: 10, 
//       step: 0.01,
//       label: 'Vector Scale Factor'
//     },
//     electricFieldFunction: { 
//       value: "(r, t) => {\n  // r is position vector [x,y,z]\n  // t is time\n  return [0, 0, 2]; // Example: linear field in z-direction\n}",
//       rows: 5,
//       label: 'Electric Field Function Input'
//     },
//     showElectricField: {value: true},
//     magneticFieldFunction: { 
//       value: "(r, t) => {\n  // r is position vector [x,y,z]\n  // t is time\n  return [0, 2, 0]; // Example: linear field in z-direction\n}",
//       rows: 5,
//       label: 'Magnetic Field Function Input'
//     },
//     showMagneticField: {value: true},
//   }, { collapsed: true });
//   // Shape controls organized under one panel
//   const shapeControls = useControls('Shape Settings', {
//     shapeType: { value: 'sphere', options: ['sphere', 'torus', 'cylinder', 'plane'] },
//     sphereRadius: { 
//       value: 1, 
//       min: 0.1, 
//       max: 5, 
//       step: 0.1, 
//       render: get => get('Shape Settings.shapeType') === 'sphere' 
//     },
//     torusOuterRadius: { 
//       value: 1.5, 
//       min: 0.5, 
//       max: 5, 
//       step: 0.1, 
//       render: get => get('Shape Settings.shapeType') === 'torus' 
//     },
//     torusInnerRadius: { 
//       value: 0.3, 
//       min: 0.1, 
//       max: 2, 
//       step: 0.05, 
//       render: get => get('Shape Settings.shapeType') === 'torus' 
//     },
//     cylinderRadius: { 
//       value: 0.7, 
//       min: 0.1, 
//       max: 3, 
//       step: 0.1, 
//       render: get => get('Shape Settings.shapeType') === 'cylinder' 
//     },
//     cylinderHeight: { 
//       value: 2, 
//       min: 0.5, 
//       max: 10, 
//       step: 0.1, 
//       render: get => get('Shape Settings.shapeType') === 'cylinder' 
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

//   const { px, py, pz, vx, vy, vz, mass, charge} = useControls('Initial Conditions', {
//     px: { value: 0, min: -10, max: 10, step: 0.1 },
//     py: { value: 0, min: -10, max: 10, step: 0.1 },
//     pz: { value: 10, min: 0, max: 20, step: 0.1 },
//     vx: { value: 0, min: -200, max: 200, step: 0.5 },
//     vy: { value: 0, min: -200, max: 200, step: 0.5 },
//     vz: { value: 0, min: -200, max: 200, step: 0.5 },
//     mass: {value: 1, min: 0, max: 100, step: 0.01 },
//     charge: { value: 1, min: -10, max: 10, step: 0.01 }
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
//   }>({
//     t: [], x: [], y: [], z: [], 
//     vx: [], vy: [], vz: [], 
//     ax: [], ay: [], az: [],
//   })
  
//   const rotation = useMemo(() => {
//     return new THREE.Quaternion().setFromEuler(
//       new THREE.Euler(rotationX, rotationY, rotationZ)
//   )}, [rotationX, rotationY, rotationZ]);

//   const audioRef = useRef<HTMLAudioElement>(null)
//   const [playing, setPlaying] = useState(false)
//   const [volume, setVolume] = useState(1)
//   const [duration, setDuration] = useState(0)
//   const [currentTime, setCurrentTime] = useState(0)
//   const [ballPos, setBallPos] = useState(new THREE.Vector3(px, py, pz));
//   const [currentGraph, setCurrentGraph] = useState<'x'|'y'|'z'|'vx'|'vy'|'vz'|'ax'|'ay'|'az'>('z');
//   const [visible, setVisible] = useState(false)
  

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

//     // Define axis labels for each type of graph
//     const axisLabels: Record<string, {y: string, x?: string}> = {
//       x: { y: 'X Position (m)', x: 'Time (s)' },
//       y: { y: 'Y Position (m)', x: 'Time (s)' },
//       z: { y: 'Z Position (m)', x: 'Time (s)' },
//       vx: { y: 'X Velocity (m/s)', x: 'Time (s)' },
//       vy: { y: 'Y Velocity (m/s)', x: 'Time (s)' },
//       vz: { y: 'Z Velocity (m/s)', x: 'Time (s)' },
//       ax: { y: 'X Acceleration (m/s²)', x: 'Time (s)' },
//       ay: { y: 'Y Acceleration (m/s²)', x: 'Time (s)' },
//       az: { y: 'Z Acceleration (m/s²)', x: 'Time (s)' },
//     };

//     Plotly.react('plot', [trace], {
//       title: `${type.toUpperCase()} vs Time`,
//       xaxis: { 
//         title: axisLabels[type].x || 'Time (s)',
//         titlefont: { size: 14 },
//         showgrid: true,
//         gridcolor: '#eee',
//       },
//       yaxis: { 
//         title: axisLabels[type].y,
//         titlefont: { size: 14 },
//         showgrid: true,
//         gridcolor: '#eee',
//       },
//       margin: { t: 40, b: 60, l: 80, r: 40 },
//       plot_bgcolor: 'rgba(255,255,255,0.9)',
//       paper_bgcolor: 'rgba(255,255,255,0.9)',
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
//     }
//     Plotly.purge('plot')
//     setResetTrigger(r => r + 1)
//     setBallPos(new THREE.Vector3(px, py, pz));
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
//           initPos={[px, py, pz]}
//           initVel={[vx, vy, vz]}
//           resetTrigger={resetTrigger}
//           paused={isPaused}
//           onUpdate={handleUpdate}
//           shapeParams={shapeControls as ShapeParams}
//           rotation={rotation}
//           showVectorField={showVectorField}
//           mass={mass}
//           charge={charge}
//           electricFieldFunction={electricFieldFunction}  // Pass the functions
//           magneticFieldFunction={magneticFieldFunction} 
//         />

//         {showVectorField && (
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
//         )}

//         {visible && (
//           <LaTeXOverlay3D position={[0, 5, 5]} currentTime={currentTime} visible={isFullscreen}/>
//         )}
        
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