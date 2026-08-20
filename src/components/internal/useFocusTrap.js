import { useEffect, useRef } from 'react'

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Traps focus within the returned ref's subtree while `active` is true,
 * moves focus into the subtree on activation, and restores focus to the
 * previously-focused element on deactivation. Shared by Drawer and Modal.
 */
export default function useFocusTrap(active) {
  const containerRef = useRef(null)
  const previouslyFocused = useRef(null)

  useEffect(() => {
    if (!active) return undefined

    previouslyFocused.current = document.activeElement

    const container = containerRef.current
    // Focus synchronously once the panel has committed to the DOM -- do not
    // defer via requestAnimationFrame, which browsers throttle heavily in
    // backgrounded/inactive tabs and would leave focus stranded on body.
    if (container) {
      const focusable = container.querySelectorAll(FOCUSABLE_SELECTOR)
      if (focusable.length > 0) {
        focusable[0].focus()
      } else {
        container.focus()
      }
    }

    const handleKeyDown = (e) => {
      if (e.key !== 'Tab' || !container) return
      const focusable = Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (e.shiftKey) {
        if (document.activeElement === first || !container.contains(document.activeElement)) {
          e.preventDefault()
          last.focus()
        }
      } else if (document.activeElement === last || !container.contains(document.activeElement)) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown, true)

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true)
      const toRestore = previouslyFocused.current
      if (toRestore && typeof toRestore.focus === 'function') {
        toRestore.focus()
      }
    }
  }, [active])

  return containerRef
}
