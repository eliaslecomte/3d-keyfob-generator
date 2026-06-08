import { forwardRef } from 'react'
import PlateKeyfob from './variants/PlateKeyfob.jsx'
import OutlineKeyfob from './variants/OutlineKeyfob.jsx'

export const VARIANTS = [
  { id: 'plate', label: 'Plate' },
  { id: 'outline', label: 'Outline' },
]

// Picks the geometry for the chosen variant and forwards the ref so the parent
// can hand the resulting group to the STL exporter.
const Keyfob = forwardRef(function Keyfob({ variant, ...props }, ref) {
  switch (variant) {
    case 'outline':
      return <OutlineKeyfob ref={ref} {...props} />
    case 'plate':
    default:
      return <PlateKeyfob ref={ref} {...props} />
  }
})

export default Keyfob
