import { useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import Keyfob, { VARIANTS } from './Keyfob.jsx'
import { exportStl } from './exportStl.js'

export default function App() {
  const [variant, setVariant] = useState('plate')
  const [text, setText] = useState('HELLO')
  const [textSize, setTextSize] = useState(10)
  const [merge, setMerge] = useState(1.6)
  const [plateColor, setPlateColor] = useState('#4f46e5')
  const [textColor, setTextColor] = useState('#f8fafc')
  const keyfobRef = useRef()

  const handleExport = () => {
    const safe = text.trim().replace(/[^a-z0-9]+/gi, '-').toLowerCase()
    exportStl(keyfobRef.current, `keyfob-${safe || 'tag'}.stl`)
  }

  const isOutline = variant === 'outline'

  return (
    <div className="app">
      <aside className="sidebar">
        <h1>
          <img src="/keyfob.svg" alt="" />
          Keyfob Generator
        </h1>
        <p className="tagline">
          Type your text, preview it in 3D, and download a print-ready STL.
          Dimensions are in millimetres.
        </p>

        <div className="field">
          <label>Style</label>
          <div className="variants">
            {VARIANTS.map((v) => (
              <button
                key={v.id}
                type="button"
                className={`variant-btn${variant === v.id ? ' active' : ''}`}
                onClick={() => setVariant(v.id)}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label htmlFor="text">Text</label>
          <input
            id="text"
            type="text"
            value={text}
            maxLength={24}
            placeholder="Your text…"
            onChange={(e) => setText(e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="size">
            Text size <span>{textSize} mm</span>
          </label>
          <input
            id="size"
            type="range"
            min="6"
            max="18"
            step="1"
            value={textSize}
            onChange={(e) => setTextSize(Number(e.target.value))}
          />
        </div>

        {isOutline && (
          <div className="field">
            <label htmlFor="merge">
              Letter merge <span>{merge.toFixed(1)} mm</span>
            </label>
            <input
              id="merge"
              type="range"
              min="0.4"
              max="4"
              step="0.1"
              value={merge}
              onChange={(e) => setMerge(Number(e.target.value))}
            />
          </div>
        )}

        <div className="field">
          <label htmlFor="plateColor">
            {isOutline ? 'Base colour' : 'Plate colour'}
          </label>
          <input
            id="plateColor"
            type="color"
            value={plateColor}
            onChange={(e) => setPlateColor(e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="textColor">Text colour</label>
          <input
            id="textColor"
            type="color"
            value={textColor}
            onChange={(e) => setTextColor(e.target.value)}
          />
        </div>

        <button className="btn" onClick={handleExport} disabled={!text.trim()}>
          Download STL
        </button>
      </aside>

      <main className="viewport">
        <Canvas shadows camera={{ position: [0, 30, 70], fov: 45 }} dpr={[1, 2]}>
          <color attach="background" args={['#0f1117']} />
          <ambientLight intensity={0.6} />
          <directionalLight position={[20, 40, 30]} intensity={1.4} castShadow />
          <directionalLight position={[-30, 10, -20]} intensity={0.5} />

          <Keyfob
            ref={keyfobRef}
            variant={variant}
            text={text}
            textSize={textSize}
            merge={merge}
            plateColor={plateColor}
            textColor={textColor}
          />

          <OrbitControls enablePan={false} minDistance={30} maxDistance={140} />
        </Canvas>
        <div className="hint">Drag to rotate · scroll to zoom</div>
      </main>
    </div>
  )
}
