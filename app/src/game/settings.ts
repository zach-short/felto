import type { PlayerState } from "@/game/player-state";
import { freshState } from "@/game/player-state";

// D15 and BD-24: the Sound switch is stored with the rest of the player's state
export function setSound(state: PlayerState, sound: boolean): PlayerState {
  return { ...state, settings: { ...state.settings, sound } };
}

// GF-3: the Haptics switch is stored beside Sound (version 3)
export function setHaptics(state: PlayerState, haptics: boolean): PlayerState {
  return { ...state, settings: { ...state.settings, haptics } };
}

// Logan Mode: the Logan Mode switch is stored beside Haptics (version 4)
export function setLoganMode(state: PlayerState, loganMode: boolean): PlayerState {
  return { ...state, settings: { ...state.settings, loganMode } };
}

// D11: the reminder switch in Profile. Turning it off keeps the chosen time for next time.
export function setReminderOn(state: PlayerState, on: boolean): PlayerState {
  const reminder = { ...state.settings.reminder, on };
  return { ...state, settings: { ...state.settings, reminder } };
}

// D11: the reminder time is a local hour and minute. A value the picker should never send is
// refused, so the stored state always passes the data module's check.
export function setReminderTime(state: PlayerState, hour: number, minute: number): PlayerState {
  if (!isClockTime(hour, minute)) return state;
  const reminder = { ...state.settings.reminder, hour, minute };
  return { ...state, settings: { ...state.settings, reminder } };
}

export function isClockTime(hour: number, minute: number): boolean {
  const whole = Number.isInteger(hour) && Number.isInteger(minute);
  return whole && hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59;
}

// PLAN.md phase 11: reset progress starts the path again but keeps the player's settings, and
// keeps the welcome seen, so a reset does not walk them through onboarding twice (D20)
export function resetProgress(state: PlayerState, now: Date): PlayerState {
  return { ...freshState(now), onboarded: state.onboarded, settings: state.settings };
}
