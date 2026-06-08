import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js'

// Export a THREE.Object3D (and all its mesh descendants) to a binary STL file
// and trigger a browser download.
export function exportStl(object, filename = 'keyfob.stl') {
  if (!object) return

  // Make sure world matrices are current so the exporter bakes the right
  // positions/rotations into the vertices.
  object.updateWorldMatrix(true, true)

  const exporter = new STLExporter()
  const data = exporter.parse(object, { binary: true })

  const blob = new Blob([data], { type: 'application/octet-stream' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
