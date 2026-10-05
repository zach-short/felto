// D10's warm word for a life is "heart", with the right number (audit of item 13, finding 6)
export function heartsLabel(lives: number): string {
  return lives === 1 ? "1 heart" : `${lives} hearts`;
}
