export type TGlobalError = { statusCode: number | undefined, message: string }

export type TEvents = {
  showGlobalError: TGlobalError
  keydown: KeyboardEvent
  windowFocused: boolean
}
