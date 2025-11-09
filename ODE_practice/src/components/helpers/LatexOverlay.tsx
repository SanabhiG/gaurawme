// import { BlockMath } from 'react-katex'
// import 'katex/dist/katex.min.css'
// import { useEffect, useState } from 'react'

// interface Equation {
//   time: number
//   latex: string
//   label: string
// }

// interface LaTeXOverlay3DProps {
//   position?: { top?: string; right?: string; bottom?: string; left?: string }
//   currentTime: number // This should be the AUDIO currentTime, not simulation time
//   visible?: boolean
// }

// export function LaTeXOverlay3D({ 
//   position = { top: '20px', right: '20px' }, 
//   currentTime, // Make sure this is the audio currentTime
//   visible = true 
// }: LaTeXOverlay3DProps) {
//   const [currentIndex, setCurrentIndex] = useState(0)

//   const equations: Equation[] = [
//     { time: 5, label: "Gravity Force", latex: String.raw`F_{\text{gravity}} = mg` },
//     { time: 15, label: "Drag Force", latex: String.raw`F_{\text{drag}} = \frac{1}{2} \rho C_d A v^2` },
//     { time: 55, label: "Cross-Sectional Area", latex: String.raw`A = \pi r^2` },
//     { time: 71, label: "Newton's Second Law", latex: String.raw`ma = mg - \frac{1}{2} \rho C_d A v^2` },
//     { time: 73, label: "Acceleration", latex: String.raw`a = \frac{dv}{dt} = g - kv^2 \quad \text{where} \quad k = \frac{1}{2m} \rho C_d A` },
//     { time: 94, label: "Solution", latex: String.raw`\int \frac{1}{g - kv^2} \, dv = \int dt \quad \Rightarrow \quad v(t) = \sqrt{\frac{g}{k}} \tanh\left(\sqrt{gk} \, t\right)` },
//     { time: 102, label: "Terminal Velocity", latex: String.raw`0 = g - kv^2 \quad \Rightarrow \quad v_{\text{term}} = \sqrt{\frac{g}{k}} = \sqrt{\frac{2mg}{\rho C_d A}}` },
//     { time: 144, label: "Lagrangian", latex: String.raw`L = T - U = \frac{1}{2} m \dot{z}^2 - mgz` },
//     { time: 193, label: "Euler-Lagrange", latex: String.raw`\frac{d}{dt} \left( \frac{\partial L}{\partial \dot{z}} \right) - \frac{\partial L}{\partial z} = -\frac{1}{2} \rho C_d A \dot{z} |\dot{z}|` }
//   ]

//   useEffect(() => {
//     let newIndex = 0
//     for (let i = equations.length - 1; i >= 0; i--) {
//       if (equations[i].time <= currentTime) {
//         newIndex = i
//         break
//       }
//     }
//     setCurrentIndex(newIndex)
//   }, [currentTime])

//   if (!visible) return null

//   return (
//     <div style={{
//       position: 'fixed',
//       ...position,
//       backgroundColor: 'rgba(0, 0, 0, 0.7)',
//       padding: '20px',
//       borderRadius: '10px',
//       maxWidth: '500px',
//       color: 'white',
//       zIndex: 1000,
//       pointerEvents: 'none'
//     }}>
//       <h3 style={{ marginTop: 0 }}>
//         {equations[currentIndex].label}
//       </h3>
//       <BlockMath>{equations[currentIndex].latex}</BlockMath>
//     </div>
//   )
// }