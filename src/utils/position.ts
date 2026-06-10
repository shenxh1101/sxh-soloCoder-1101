export function getRelativePosition(
  clientX: number,
  clientY: number,
  container: HTMLElement
): { x: number; y: number } {
  const rect = container.getBoundingClientRect()
  return {
    x: ((clientX - rect.left) / rect.width) * 100,
    y: ((clientY - rect.top) / rect.height) * 100,
  }
}

export function getAbsolutePosition(
  percentX: number,
  percentY: number,
  container: HTMLElement
): { x: number; y: number } {
  const rect = container.getBoundingClientRect()
  return {
    x: (percentX / 100) * rect.width,
    y: (percentY / 100) * rect.height,
  }
}

export function scrollToElement(selector: string): boolean {
  const element = document.querySelector(selector)
  if (!element) return false
  element.scrollIntoView({ behavior: 'smooth', block: 'center' })
  return true
}