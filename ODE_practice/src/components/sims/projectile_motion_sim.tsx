import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Html } from '@react-three/drei'
import { useRef, useState, useEffect, useMemo } from 'react'
import { useControls, Leva } from 'leva'
import * as THREE from 'three'
import Plotly from 'plotly.js-dist-min'
// import { LaTeXOverlay3D } from './LatexOverlay'
import sampleAudio from '../assets/sample-audio.mp3'

// Constants
const TIME_SCALE = 1
const DATA_COLLECTION_INTERVAL = 0.05 // Collect data every 0.05 seconds

interface BallType {
  id: string;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  acceleration: THREE.Vector3;
  color: string;
}

// Camera Controller Component
function CameraController({ 
  ballPosition, 
  isFollowing 
}: { 
  ballPosition: THREE.Vector3, 
  isFollowing: boolean 
}) {
  const { camera } = useThree()
  const { followDistance, followHeight, followAngle } = useControls('Camera Settings', {
    followDistance: { value: 10, min: 5, max: 30, step: 1 },
    followHeight: { value: 5, min: 0, max: 15, step: 1 },
    followAngle: { value: 0.5, min: 0, max: Math.PI, step: 0.1 },
  }, { collapsed: true })

  useFrame(() => {
    if (isFollowing) {
      // Calculate camera position based on ball position and follow parameters
      const angle = followAngle * Math.PI
      const cameraX = ballPosition.x + followDistance * Math.cos(angle)
      const cameraZ = ballPosition.z + followDistance * Math.sin(angle)
      const cameraY = ballPosition.y + followHeight
      
      camera.position.set(cameraX, cameraY, cameraZ)
      camera.lookAt(ballPosition.x, ballPosition.y, ballPosition.z)
      camera.updateProjectionMatrix()
    }
  })

  return null
}

function Ball({
  position,
  color,
  shapeParams,
  rotation,
  showVectorField,
}: {
  position: THREE.Vector3,
  color: string,
  shapeParams: any,
  rotation: THREE.Quaternion,
  showVectorField: boolean,
}) {
  const ref = useRef<THREE.Mesh>(null);
  const prevPosition = useRef(new THREE.Vector3());
  
  useFrame(() => {
    if (ref.current) {
      // Smooth interpolation between positions
      ref.current.position.lerpVectors(prevPosition.current, position, 0.2);
      prevPosition.current.copy(position);
      ref.current.quaternion.copy(rotation);
    }
  });

  return (
    <mesh ref={ref}>
      {shapeParams.shapeType === 'sphere' && <sphereGeometry args={[shapeParams.sphereRadius, 32, 32]} />}
      {shapeParams.shapeType === 'torus' && <torusGeometry args={[shapeParams.torusOuterRadius, shapeParams.torusInnerRadius, 16, 100]} />}
      {shapeParams.shapeType === 'cylinder' && <cylinderGeometry args={[shapeParams.cylinderRadius, shapeParams.cylinderRadius, shapeParams.cylinderHeight, 32]} />}
      {shapeParams.shapeType === 'plane' && <planeGeometry args={[shapeParams.sphereRadius * 3, shapeParams.sphereRadius * 3]} />}
      <meshStandardMaterial color={color} transparent={true} opacity={showVectorField ? 0.85 : 1}/>
    </mesh>
  );
}

function AxisLabels({ }: { isFullscreen: boolean }) {
  return (
    <group renderOrder={2}>
      <Html position={[100.5, 0, 0]} center>
        <div style={{ color: 'red', fontSize: '24px', fontWeight: 'bold', zIndex: 998 }}>+X</div>
      </Html>
      <Html position={[0, 100.5, 0]} center>
        <div style={{ color: 'green', fontSize: '24px', fontWeight: 'bold' }}>+Y</div>
      </Html>
      <Html position={[0, 0, 100.5]} center>
        <div style={{ color: 'blue', fontSize: '24px', fontWeight: 'bold' }}>+Z</div>
      </Html>
    </group>
  )
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function InfiniteXYGrid() {
  return (
    <gridHelper 
      args={[2000, 2000, '#444', '#888']} 
      rotation={[Math.PI/2, 0, 0]} 
      position={[0, 0, -0.01]}
      renderOrder={1}
    />
  )
}

interface PhysicsSimulationProps {
  isPaused: boolean;
  setBall: React.Dispatch<React.SetStateAction<BallType>>;
  setDisplayTime: React.Dispatch<React.SetStateAction<number>>;
  dataRef: React.MutableRefObject<{
    t: number[];
    x: number[]; y: number[]; z: number[];
    vx: number[]; vy: number[]; vz: number[];
    ax: number[]; ay: number[]; az: number[];
    flux: number[];
  }>;
  TIME_SCALE: number;
  displayTime: number;
  physicsControls: any;
  gravity: number;
  resetTrigger: number;
}

function PhysicsSimulation({
  isPaused,
  setBall,
  setDisplayTime,
  dataRef,
  TIME_SCALE,
  gravity: gravityValue,
  resetTrigger,
}: PhysicsSimulationProps) {
  const timeSinceLastCollection = useRef(0);
  const displayTimeRef = useRef(0);
  
  // Reset internal time reference when resetTrigger changes
  useEffect(() => {
    displayTimeRef.current = 0;
    timeSinceLastCollection.current = 0;
  }, [resetTrigger]);
  
  // Helper function to calculate acceleration
  const calculateAcceleration = (ball: BallType): THREE.Vector3 => {
    // Use configurable gravity
    const gravity = new THREE.Vector3(0, 0, gravityValue);
    
    // Add some drag force (optional)
    const dragCoefficient = 0;
    const dragForce = ball.velocity.clone().multiplyScalar(-dragCoefficient);
    
    return gravity.clone().add(dragForce);
  };
  
  // RK4 integration with smaller time steps
  useFrame((_, delta) => {
    if (isPaused) return;
    
    const dt = 0.00001; // Smaller fixed time step for RK4 stability
    const steps = Math.max(1, Math.floor(delta * TIME_SCALE / dt));
    timeSinceLastCollection.current += delta;
    displayTimeRef.current += delta;
    
    setBall((prevBall: BallType) => {
      let currentBall = { ...prevBall };
      
      for (let step = 0; step < steps; step++) {
        // RK4 integration
        const k1v = calculateAcceleration(currentBall);
        const k1p = currentBall.velocity.clone();
        
        const tempBall2 = {
          ...currentBall,
          velocity: currentBall.velocity.clone().add(k1v.clone().multiplyScalar(dt / 2)),
          position: currentBall.position.clone().add(k1p.clone().multiplyScalar(dt / 2))
        };
        
        const k2v = calculateAcceleration(tempBall2);
        const k2p = tempBall2.velocity.clone();
        
        const tempBall3 = {
          ...currentBall,
          velocity: currentBall.velocity.clone().add(k2v.clone().multiplyScalar(dt / 2)),
          position: currentBall.position.clone().add(k2p.clone().multiplyScalar(dt / 2))
        };
        
        const k3v = calculateAcceleration(tempBall3);
        const k3p = tempBall3.velocity.clone();
        
        const tempBall4 = {
          ...currentBall,
          velocity: currentBall.velocity.clone().add(k3v.clone().multiplyScalar(dt)),
          position: currentBall.position.clone().add(k3p.clone().multiplyScalar(dt))
        };
        
        const k4v = calculateAcceleration(tempBall4);
        const k4p = tempBall4.velocity.clone();
        
        // Final RK4 update
        const velocityDelta = k1v.clone()
          .add(k2v.clone().multiplyScalar(2))
          .add(k3v.clone().multiplyScalar(2))
          .add(k4v)
          .multiplyScalar(dt / 6);
        
        const positionDelta = k1p.clone()
          .add(k2p.clone().multiplyScalar(2))
          .add(k3p.clone().multiplyScalar(2))
          .add(k4p)
          .multiplyScalar(dt / 6);
        
        currentBall = {
          ...currentBall,
          velocity: currentBall.velocity.clone().add(velocityDelta),
          position: currentBall.position.clone().add(positionDelta),
          acceleration: calculateAcceleration(currentBall)
        };
        
        // COLLECT DATA HERE (only periodically to avoid too much data)
        if (timeSinceLastCollection.current >= DATA_COLLECTION_INTERVAL && step === steps - 1) {
          dataRef.current.x.push(currentBall.position.x);
          dataRef.current.y.push(currentBall.position.y);
          dataRef.current.z.push(currentBall.position.z);
          dataRef.current.vx.push(currentBall.velocity.x);
          dataRef.current.vy.push(currentBall.velocity.y);
          dataRef.current.vz.push(currentBall.velocity.z);
          dataRef.current.ax.push(currentBall.acceleration.x);
          dataRef.current.ay.push(currentBall.acceleration.y);
          dataRef.current.az.push(currentBall.acceleration.z);
          
          dataRef.current.t.push(displayTimeRef.current);
          timeSinceLastCollection.current = 0;
        }
      }
      
      return currentBall;
    });
    
    // Update display time less frequently to reduce state updates
    if (timeSinceLastCollection.current >= DATA_COLLECTION_INTERVAL) {
      setDisplayTime(displayTimeRef.current);
    }
  });
  
  return null;
}

export default function FluxVisualization() {
  // Shape controls organized under one panel
  const shapeControls = useControls('Shape Settings', {
    shapeType: { value: 'sphere', options: ['sphere', 'torus', 'cylinder', 'plane'] },
    sphereRadius: { value: 5, min: 0.1, max: 10, step: 0.1, render: get => get('Shape Settings.shapeType') === 'sphere' },
    torusOuterRadius: { value: 1.5, min: 0.5, max: 5, step: 0.1, render: get => get('Shape Settings.shapeType') === 'torus' },
    torusInnerRadius: { value: 0.3, min: 0.1, max: 2, step: 0.05, render: get => get('Shape Settings.shapeType') === 'torus' },
    cylinderRadius: { value: 0.7, min: 0.1, max: 3, step: 0.1, render: get => get('Shape Settings.shapeType') === 'cylinder' },
    cylinderHeight: { value: 2, min: 0.5, max: 10, step: 0.1, render: get => get('Shape Settings.shapeType') === 'cylinder' },
  }, { collapsed: true });

  const physicsControls = useControls('Initial Conditions', {
    ballPosition: { 
      value: { x: 0, y: 0, z: 100 }, 
      label: "Ball Position" 
    },
    ballVelocity: { 
      value: { x: 0, y: 0, z: 0 }, 
      label: "Ball Velocity" 
    },
    gravity: {
      value: -9.8,
      min: -50,
      max:-0.2,
      step: 0.1,
      label: "Gravity (m/s²)"
    }
  }, { collapsed: true });

  const { showVectorField } = useControls('Vector Field Settings', {
    showVectorField: { value: true },
  }, { collapsed: true });

  const { rotationX, rotationY, rotationZ } = useControls('Rotation', {
    rotationX: { value: 0, min: -Math.PI, max: Math.PI, step: 0.1 },
    rotationY: { value: 0, min: -Math.PI, max: Math.PI, step: 0.1 },
    rotationZ: { value: 0, min: -Math.PI, max: Math.PI, step: 0.1 }
  }, { collapsed: true });

  // Camera follow control
  const { cameraFollow } = useControls('Camera Settings', {
    cameraFollow: { value: false, label: 'Follow Ball' }
  }, { collapsed: true });

  // Single ball state
  const [ball, setBall] = useState<BallType>({
    id: 'ball',
    position: new THREE.Vector3(
      physicsControls.ballPosition.x, 
      physicsControls.ballPosition.y, 
      physicsControls.ballPosition.z
    ),
    velocity: new THREE.Vector3(
      physicsControls.ballVelocity.x, 
      physicsControls.ballVelocity.y, 
      physicsControls.ballVelocity.z
    ),
    acceleration: new THREE.Vector3(0, 0, 0),
    color: 'red'
  });
  
  const [resetTrigger, setResetTrigger] = useState(0)
  const [displayTime, setDisplayTime] = useState(0)
  const [isResetting, setIsResetting] = useState(false)
  const [isPaused, setIsPaused] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [maxReachedTime, setMaxReachedTime] = useState(0);
  

  const dataRef = useRef<{ 
    t: number[];
    x: number[]; y: number[]; z: number[]; 
    vx: number[]; vy: number[]; vz: number[]; 
    ax: number[]; ay: number[]; az: number[];
    flux: number[];
  }>({
    t: [],
    x: [], y: [], z: [], 
    vx: [], vy: [], vz: [], 
    ax: [], ay: [], az: [],
    flux: []
  });
  
  const rotation = useMemo(() => {
    return new THREE.Quaternion().setFromEuler(
      new THREE.Euler(rotationX, rotationY, rotationZ)
  )}, [rotationX, rotationY, rotationZ]);

  // Audio management
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [volume, setVolume] = useState(1)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)

  const [currentGraph, setCurrentGraph] = useState<'x'|'y'|'z'|'vx'|'vy'|'vz'|'ax'|'ay'|'az'|'flux'>('z');
  const [, setVisible] = useState(false)

  const updateGraph = (type: string) => {
    if (dataRef.current.t.length === 0) return;
    
    const THRESHOLD = 0.05;
    const filteredIndices = dataRef.current.t
      .map((t, i) => ({ t, i }))
      .filter(({ t }) => t >= THRESHOLD)
      .map(({ i }) => i);

    const yData = dataRef.current[type as keyof typeof dataRef.current] as number[];

    const trace = {
      x: filteredIndices.map(i => dataRef.current.t[i]),
      y: filteredIndices.map(i => yData[i] || 0),
      type: 'scatter',
      mode: 'lines',
      name: type,
    };

    Plotly.react('plot', [trace], {
      title: `${type}(t) in ground frame`,
      xaxis: { title: 'Time (s)' },
      yaxis: { title: `${type}(t)` },
    });
  };

  const resetSim = () => {
    setIsPaused(true);
    setIsResetting(true);
    setDisplayTime(0);
    
    // Reset ball with current control values
    setBall({
      id: 'ball',
      position: new THREE.Vector3(
        physicsControls.ballPosition.x, 
        physicsControls.ballPosition.y, 
        physicsControls.ballPosition.z
      ),
      velocity: new THREE.Vector3(
        physicsControls.ballVelocity.x, 
        physicsControls.ballVelocity.y, 
        physicsControls.ballVelocity.z
      ),
      acceleration: new THREE.Vector3(0, 0, 0),
      color: 'red'
    });
    
    // Clear data
    dataRef.current = { 
      t: [],
      x: [], y: [], z: [], 
      vx: [], vy: [], vz: [], 
      ax: [], ay: [], az: [],
      flux: []
    };
    
    Plotly.purge('plot');
    setResetTrigger(r => r + 1);
  };

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 2000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    updateGraph(currentGraph);
  }, [currentGraph]);

  useEffect(() => {
    if (isResetting) {
      const id = requestAnimationFrame(() => {
        setIsResetting(false)
      })
      return () => cancelAnimationFrame(id)
    }
  }, [resetTrigger])

  // Add this useEffect to automatically update the graph when new data arrives
  useEffect(() => {
    if (!isPaused && dataRef.current.t.length > 0) {
      updateGraph(currentGraph);
    }
  }, [dataRef.current.t.length, isPaused, currentGraph]);

  // Audio effects
  // Inside your audio useEffect
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      setCurrentTime(audio.currentTime);
      
      // Update max reached time if current time is greater
      if (audio.currentTime > maxReachedTime) {
        setMaxReachedTime(audio.currentTime);
      }
    };
    
    const updateDuration = () => setDuration(audio.duration);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
    };
  }, [maxReachedTime]); // Add maxReachedTime as dependency

  // Event handlers
  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return

    if (playing) {
      audio.pause()
    } else {
      audio.play()
    }
    setPlaying(!playing)
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = pos * duration;
    
    // Don't allow seeking beyond max reached time (if maxReachedTime > 0)
    if ((maxReachedTime === 0 || newTime <= maxReachedTime) && audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime); // Add this line to update the visual indicator
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value)
    setVolume(vol)
    if (audioRef.current) {
      audioRef.current.volume = vol
    }
  }

  const toggleFullScreen = () => {
    const element = document.getElementById("sim-container")
    if (!element) return

    if (!document.fullscreenElement) {
      element.requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(err => console.error("Fullscreen error:", err))
    } else {
      document.exitFullscreen()
        .then(() => setIsFullscreen(false))
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const buttonStyle: React.CSSProperties = {
    padding: '10px 20px',
    fontSize: '16px',
    minWidth: '140px',
    background: '#222',
    color: 'white',
    border: '1px solid white',
    borderRadius: 6,
    margin: '5px',
  }

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: 1000,
  }

  const uiContainerStyle: React.CSSProperties = {
    position: 'absolute',
    top: 20,
    left: 20,
    pointerEvents: 'auto',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: '10px',
    borderRadius: '8px',
    display: isFullscreen ? 'block' : 'none',
    zIndex: 999
  }

  const graphContainerStyle: React.CSSProperties = {
    position: 'absolute',
    top: 140,
    left: 20,
    pointerEvents: 'auto',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: '10px',
    borderRadius: '8px',
    display: isFullscreen ? 'block' : 'none',
    zIndex: 999
  }

  const fullscreenButtonStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: 10,
    right: 10,
    pointerEvents: 'auto',
    ...buttonStyle,
  }

  const levaContainerStyle: React.CSSProperties = {
    position: 'absolute',
    top: 20,
    right: 20,
    pointerEvents: 'auto',
    display: isFullscreen ? 'block' : 'none',
  }

  return (
    <div id="sim-container" style={{
      position: 'relative',
      width: '100%',
      height: '90vh',
      margin: '0 auto',
      border: '2px solid black',
      overflow: 'hidden',
    }}>
      <Canvas
        camera={{ position: [100, 100, 50], up: [0, 0, 1], near: 0.1, far: 1000 }}
        gl={{ antialias: true }}
      >

        <PhysicsSimulation 
          isPaused={isPaused} 
          setBall={setBall}
          setDisplayTime={setDisplayTime}
          dataRef={dataRef}
          TIME_SCALE={TIME_SCALE}
          displayTime={displayTime}
          physicsControls={physicsControls}
          gravity={physicsControls.gravity}
          resetTrigger={resetTrigger}
        />
        
        {/* Camera controller */}
        <CameraController 
          ballPosition={ball.position} 
          isFollowing={cameraFollow} 
        />
        
        <ambientLight intensity={0.5} />
        <pointLight position={[50, 50, 50]} />
        <axesHelper args={[100]} />
        <InfiniteXYGrid />
        <AxisLabels isFullscreen={isFullscreen}/>
        
        <Ball
          position={ball.position}
          color={ball.color}
          shapeParams={shapeControls}
          rotation={rotation}
          showVectorField={showVectorField}
        />

        <OrbitControls 
          makeDefault
          target={[0,0,50]}
          minDistance={5}
          enabled={!cameraFollow} // Disable orbit controls when camera is following
        />
      </Canvas>

      {/* {visible && isFullscreen && (
        <LaTeXOverlay3D 
          position={{ top: '525px', left: '20px' }} 
          currentTime={currentTime} 
          visible={true}
        />
      )} */}

      <audio ref={audioRef} src={sampleAudio} preload="metadata" />
      
      {!isFullscreen && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10,
          color: 'white',
          fontSize: '24px',
          flexDirection: 'column'
        }}>
          <div style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            border: '2px solid white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '40px',
          }}>
            ⛶
          </div>
          <p style={{ marginTop: '20px' }}>Click Fullscreen to start the simulation</p>
        </div>
      )}

      <div style={overlayStyle}>
        <div style={uiContainerStyle}>
          <button style={{
            ...buttonStyle,
            background: isPaused ? '#a00' : '#222',
          }} onClick={() => setIsPaused(p => !p)}>
            {isPaused ? (currentTime == 0.00 ? 'Start' : 'Resume') : 'Stop'}
          </button>
          <button style={buttonStyle} onClick={resetSim}>Reset Ball</button>
          <button style={buttonStyle} onClick={() => {
            dataRef.current = { 
              t: [], x: [], y: [], z: [], vx: [], vy: [], vz: [], ax: [], ay: [], az: [], flux: []
            }
            Plotly.purge('plot')
          }}>
            Clear Graphs
          </button>
          <div style={{
            color: 'white',
            fontSize: '18px',
            marginTop: '10px'
          }}>
            Time: {displayTime.toFixed(2)} s
          </div>
        </div>
        
        <div style={graphContainerStyle}>
          <select 
            value={currentGraph}
            onChange={(e) => {
              const newGraph = e.target.value as typeof currentGraph;
              setCurrentGraph(newGraph);
              updateGraph(newGraph);
            }}
            style={{
              padding: '8px',
              borderRadius: '4px',
              backgroundColor: '#222',
              color: 'white',
              border: '1px solid #555',
              marginBottom: '15px',
              width: '100%',
              fontFamily: 'inherit',
              fontSize: '16px',
              fontWeight: 'normal'
            }}
          >
            <option value="x">Position X</option>
            <option value="y">Position Y</option>
            <option value="z">Position Z</option>
            <option value="vx">Velocity X</option>
            <option value="vy">Velocity Y</option>
            <option value="vz">Velocity Z</option>
            <option value="ax">Acceleration X</option>
            <option value="ay">Acceleration Y</option>
            <option value="az">Acceleration Z</option>
            <option value="flux">Flux</option>
          </select>
          <div id="plot" style={{ width: 450, height: 300, top: 290, zIndex: 1000}}></div>
        </div>

        <div style={levaContainerStyle}>
          <Leva fill flat hideCopyButton collapsed oneLineLabels />
        </div>

        <button
          style={fullscreenButtonStyle}
          onClick={toggleFullScreen}
        >
          {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        </button>
      </div>

      {/* Audio controls */}
      <div style={{ 
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'linear-gradient(to right, #222, #444)',
        color: 'white',
        padding: '15px 20px',
        zIndex: 999,
        display: isFullscreen ? 'flex' : 'none',
        flexDirection: 'column',
        gap: '10px',
        borderTop: '1px solid #555',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.5)'
      }}>
        {/* Progress bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
          width: '100%'
        }}>
          <div style={{ 
            flex: 1,
            height: '4px',
            background: '#555',
            borderRadius: '2px',
            overflow: 'hidden',
            cursor: 'pointer',
            position: 'relative'
          }}
            onClick={handleProgressClick}
          >
            {/* Watched portion - only show if maxReachedTime > 0 */}
            {maxReachedTime > 0 && (
              <div style={{
                height: '100%',
                width: `${(maxReachedTime / duration) * 100}%`,
                background: '#666',
                position: 'absolute',
                left: 0,
                top: 0
              }} />
            )}
            
            {/* Current progress - only show if maxReachedTime > 0 */}
            {maxReachedTime > 0 && (
              <div style={{
                height: '100%',
                width: `${(currentTime / maxReachedTime) * 100}%`,
                background: '#00ffc8',
                position: 'absolute',
                left: 0,
                top: 0,
                maxWidth: `${(maxReachedTime / duration) * 100}%`
              }} />
            )}
          </div>
          <div style={{
            display: 'flex',
            gap: '5px',
            fontSize: '12px',
            color: '#aaa',
            minWidth: '100px'
          }}>
            <span>{formatTime(currentTime)}</span>
            <span>/</span>
            <span>{duration > 0 ? formatTime(duration) : '0:00'}</span>
          </div>
        </div>

        {/* Controls row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          width: '100%'
        }}>
          <button 
            onClick={togglePlay}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '5px 10px',
              borderRadius: '4px',
              transition: 'all 0.2s'
            }}
          >
            {playing ? '⏸' : '▶'}
          </button>

          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            style={{
              flex: 1,
              maxWidth: '100px',
              height: '4px',
              accentColor: '#00ffc8'
            }}
          />

          <div style={{ marginLeft: 'auto' }}>
            {/* Additional controls can go here */}
          </div>
        </div>
      </div>
    </div>
  )
}