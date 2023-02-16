export const LEFT_SWIPE_WIDTH = 75

export default class SwipeEvents {
  startX: number | null = null

  startY: number | null = null

  xDiff = 0

  yDiff = 0

  $element: HTMLElement

  onLeft: (() => void) | undefined

  onRight: (() => void) | undefined

  onUp: (() => void) | undefined

  onDown: (() => void) | undefined

  onMove: ((xDiff: number, yDiff: number) => void) | undefined

  onEnd: ((xDiff: number, yDiff: number) => void) | undefined

  constructor($element: HTMLElement) {
    this.$element = $element

    this.$element.addEventListener('touchstart', (event: Event) => {
      const firstTouch = (event as TouchEvent).touches[0]
      this.startX = firstTouch.clientX
      this.startY = firstTouch.clientY
    })

    this.$element.addEventListener('touchmove', (event: Event) => {
      this.handleTouchMove(event)
    })

    this.$element.addEventListener('touchend', () => {
      this.startX = null
      this.startY = null

      if (this.onEnd) {
        this.onEnd(this.xDiff, this.yDiff)
      }
    })
  }

  handleTouchMove(event: Event) {
    if (!this.startX || !this.startY) {
      return
    }

    const currentX = (event as TouchEvent).touches[0].clientX
    const currentY = (event as TouchEvent).touches[0].clientY

    this.xDiff = this.startX - currentX
    this.yDiff = this.startY - currentY

    if (this.onMove) {
      this.onMove(this.xDiff, this.yDiff)
    }

    if (Math.abs(this.xDiff) > Math.abs(this.yDiff)) { // First, check if it horizontal or vertical movement
      if (this.xDiff < 0) {
        if (this.onRight) {
          this.onRight()
        }
      } else if (this.xDiff > LEFT_SWIPE_WIDTH && this.onLeft) {
        this.onLeft()
      }
    } else if (this.yDiff < 0) {
      if (this.onDown) {
        this.onDown()
      }
    } else if (this.onUp) {
      this.onUp()
    }
  }
}
