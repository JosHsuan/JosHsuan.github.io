type ScrollContext = {
  delta: number
  inTerminal: boolean
  contentTop: number
  completed: boolean
  sceneGesture: boolean
  reduced: boolean
}

// Read first inside the window. At its top, upward input returns to the opening.
// A gesture started on the background keeps control as the window grows under it.
export function scrollDestination({ delta, inTerminal, contentTop, completed, sceneGesture, reduced }: ScrollContext): 'opening' | 'content' | 'native' {
  if (reduced) return inTerminal ? 'native' : 'content'
  if (completed) {
    if (delta < 0 && (!inTerminal || contentTop <= 1)) return 'opening'
    return inTerminal ? 'native' : 'content'
  }
  if (sceneGesture || !inTerminal || (delta < 0 && contentTop <= 1)) return 'opening'
  return 'native'
}
