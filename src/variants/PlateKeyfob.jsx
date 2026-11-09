import { forwardRef, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Text3D } from '@react-three/drei'
import * as THREE from 'three'
import helvetiker from '../assets/helvetiker_bold.typeface.json'

// All dimensions are in millimetres so the exported STL slices at real-world scale.
const PLATE_THICKNESS = 3
const TEXT_DEPTH = 1.2
const HOLE_RADIUS = 3.5
const HOLE_ZONE = 16 // horizontal space reserved on the left for the keyring hole
const SIDE_PAD = 6 // padding to the right of the text
const V_PAD = 5 // vertical padding above/below the text

// Rounded-rectangle (stadium) plate with a circular hole punched on the left.
function buildPlateShape(width, height, holeX) {
  const r = Math.min(height / 2, width / 2)
  const x0 = -width / 2
  const y0 = -height / 2

  const shape = new THREE.Shape()
  shape.moveTo(x0 + r, y0)
  shape.lineTo(x0 + width - r, y0)
  shape.quadraticCurveTo(x0 + width, y0, x0 + width, y0 + r)
  shape.lineTo(x0 + width, y0 + height - r)
  shape.quadraticCurveTo(x0 + width, y0 + height, x0 + width - r, y0 + height)
  shape.lineTo(x0 + r, y0 + height)
  shape.quadraticCurveTo(x0, y0 + height, x0, y0 + height - r)
  shape.lineTo(x0, y0 + r)
  shape.quadraticCurveTo(x0, y0, x0 + r, y0)

  const hole = new THREE.Path()
  hole.absarc(holeX, 0, HOLE_RADIUS, 0, Math.PI * 2, true)
  shape.holes.push(hole)

  return shape
}

const PlateKeyfob = forwardRef(function PlateKeyfob(
  { text, textSize, plateColor, textColor },
  ref,
) {
  const textMeshRef = useRef()
  const [textBox, setTextBox] = useState(null)

  // Measure the generated text geometry so the plate can be sized to fit it.
  // Reading the bounding box is idempotent (we never mutate the geometry), so
  // this stays correct under React StrictMode's double-invoke in dev.
  useLayoutEffect(() => {
    const geo = textMeshRef.current?.geometry
    if (!geo) return
    geo.computeBoundingBox()
    const bb = geo.boundingBox
    if (!Number.isFinite(bb.min.x)) return
    setTextBox({
      width: bb.max.x - bb.min.x,
      height: bb.max.y - bb.min.y,
      offset: [
        -(bb.min.x + bb.max.x) / 2,
        -(bb.min.y + bb.max.y) / 2,
        -bb.min.z,
      ],
    })
  }, [text, textSize])

  const plate = useMemo(() => {
    if (!textBox) return null
    const width = HOLE_ZONE + textBox.width + SIDE_PAD
    const height = Math.max(textBox.height, textSize) + 2 * V_PAD
    const holeX = -width / 2 + HOLE_ZONE / 2
    const shape = buildPlateShape(width, height, holeX)
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: PLATE_THICKNESS,
      bevelEnabled: true,
      bevelThickness: 0.4,
      bevelSize: 0.4,
      bevelSegments: 2,
    })
    return { geometry, textCenterX: HOLE_ZONE / 2 }
  }, [textBox, textSize])

  return (
    // Lay the keyfob flat-ish for a pleasant default view; OrbitControls lets
    // the user spin it freely.
    <group ref={ref} rotation={[-Math.PI / 2.5, 0, 0]}>
      {plate && (
        <mesh geometry={plate.geometry} castShadow receiveShadow>
          <meshStandardMaterial
            color={plateColor}
            roughness={0.55}
            metalness={0.1}
          />
        </mesh>
      )}

      {/* Raised text, sitting on top of the plate. */}
      <group
        position={[plate?.textCenterX ?? 0, 0, PLATE_THICKNESS]}
        visible={!!textBox}
      >
        <Text3D
          ref={textMeshRef}
          font={helvetiker}
          size={textSize}
          height={TEXT_DEPTH}
          curveSegments={6}
          bevelEnabled
          bevelThickness={0.15}
          bevelSize={0.15}
          bevelSegments={2}
          position={textBox?.offset ?? [0, 0, 0]}
        >
          {text || ' '}
          <meshStandardMaterial
            color={textColor}
            roughness={0.4}
            metalness={0.15}
          />
        </Text3D>
      </group>
    </group>
  )
})

export default PlateKeyfob
