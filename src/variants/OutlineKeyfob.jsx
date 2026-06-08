import { forwardRef, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Text3D } from '@react-three/drei'
import * as THREE from 'three'
import helvetiker from 'three/examples/fonts/helvetiker_bold.typeface.json'

// All dimensions are in millimetres.
const BASE_DEPTH = 2 // thickness of the fat "merged" backing text
const TOP_DEPTH = 1.2 // thickness of the crisp readable text on top
const RING_INNER = 3.5 // keyring hole radius
const RING_WALL = 3 // wall thickness of the ring loop
const RING_OVERLAP = 3.5 // how far the ring bites into the text so it stays connected

// A flat annulus (ring) extruded straight along Z, centred on the origin.
// No bevel, so the underside stays flat against the print bed.
function buildRingGeometry(outer, inner, depth) {
  const shape = new THREE.Shape()
  shape.absarc(0, 0, outer, 0, Math.PI * 2, false)
  const hole = new THREE.Path()
  hole.absarc(0, 0, inner, 0, Math.PI * 2, true)
  shape.holes.push(hole)
  return new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false })
}

function measure(geo) {
  geo.computeBoundingBox()
  const bb = geo.boundingBox
  if (!Number.isFinite(bb.min.x)) return null
  return {
    width: bb.max.x - bb.min.x,
    height: bb.max.y - bb.min.y,
    centerX: (bb.min.x + bb.max.x) / 2,
    centerY: (bb.min.y + bb.max.y) / 2,
    minZ: bb.min.z,
    maxZ: bb.max.z,
  }
}

const OutlineKeyfob = forwardRef(function OutlineKeyfob(
  { text, textSize, plateColor, textColor, merge },
  ref,
) {
  const baseMeshRef = useRef()
  const topMeshRef = useRef()
  const [boxes, setBoxes] = useState(null)

  // Measure both text layers so we can centre them and attach the keyring loop
  // to the left edge of the (fatter) base layer.
  useLayoutEffect(() => {
    const baseGeo = baseMeshRef.current?.geometry
    const topGeo = topMeshRef.current?.geometry
    if (!baseGeo || !topGeo) return
    const base = measure(baseGeo)
    const top = measure(topGeo)
    if (!base || !top) return
    setBoxes({ base, top })
  }, [text, textSize, merge])

  const ring = useMemo(() => {
    if (!boxes) return null
    const outer = RING_INNER + RING_WALL
    const geometry = buildRingGeometry(outer, RING_INNER, BASE_DEPTH)
    // Sit just left of the text and bite into it by RING_OVERLAP so the meshes fuse.
    const x = -boxes.base.width / 2 - outer + RING_OVERLAP
    return { geometry, x }
  }, [boxes])

  const baseTotalDepth = boxes ? boxes.base.maxZ - boxes.base.minZ : BASE_DEPTH

  return (
    <group ref={ref} rotation={[-Math.PI / 2.5, 0, 0]} visible={!!boxes}>
      {/* Keyring loop — connected to the leftmost letter. */}
      {ring && (
        <mesh
          geometry={ring.geometry}
          position={[ring.x, 0, 0]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial
            color={plateColor}
            roughness={0.55}
            metalness={0.1}
          />
        </mesh>
      )}

      {/* Fat, dilated base text. bevelSize fattens each glyph outward so
          neighbours collide and merge; bevelThickness=0 keeps the extrusion
          flat-faced, so the dilated silhouette reaches all the way down to a
          flat z=0 underside (solid first layer, good bed adhesion). */}
      <group
        position={
          boxes
            ? [-boxes.base.centerX, -boxes.base.centerY, -boxes.base.minZ]
            : [0, 0, 0]
        }
      >
        <Text3D
          ref={baseMeshRef}
          font={helvetiker}
          size={textSize}
          height={BASE_DEPTH}
          curveSegments={6}
          bevelEnabled
          bevelThickness={0}
          bevelSize={merge}
          bevelOffset={0}
          bevelSegments={1}
        >
          {text || ' '}
          <meshStandardMaterial
            color={plateColor}
            roughness={0.55}
            metalness={0.1}
          />
        </Text3D>
      </group>

      {/* Crisp readable text, raised on top of the base. */}
      <group
        position={
          boxes
            ? [-boxes.top.centerX, -boxes.top.centerY, baseTotalDepth - boxes.top.minZ]
            : [0, 0, 0]
        }
      >
        <Text3D
          ref={topMeshRef}
          font={helvetiker}
          size={textSize}
          height={TOP_DEPTH}
          curveSegments={6}
          bevelEnabled
          bevelThickness={0.1}
          bevelSize={0.1}
          bevelSegments={2}
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

export default OutlineKeyfob
