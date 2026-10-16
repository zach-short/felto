import type { CastRole } from "@/content/cast";
import type { Seat } from "@/content/schema";
import { TABLE_SEATS } from "@/gto/table";

// A place on the screen, counted clockwise from the player's, which is always 0 at the bottom of
// the table (BD-T27): 1 is lower left, 2 upper left, 3 the top, 4 upper right, 5 lower right.
// Clockwise is the order the seats act in before the flop (TABLE_SEATS), as at a real table.
export type Place = 0 | 1 | 2 | 3 | 4 | 5;

export const PLACES: readonly Place[] = [0, 1, 2, 3, 4, 5];

// Who sits at a bot's place (BD-T26): the three across the table are the cast, at the same places
// every hand, and the two beside the player are stand-ins until the new characters of phase 8.
export type Occupant = { kind: "cast"; role: CastRole } | { kind: "stand-in"; number: number };

const OCCUPANTS: Readonly<Record<Exclude<Place, 0>, Occupant>> = {
  1: { kind: "stand-in", number: 1 },
  2: { kind: "cast", role: "fish" },
  3: { kind: "cast", role: "shark" },
  4: { kind: "cast", role: "squid" },
  5: { kind: "stand-in", number: 2 },
};

export function placeOf(seat: Seat, playerSeat: Seat): Place {
  const steps = TABLE_SEATS.indexOf(seat) - TABLE_SEATS.indexOf(playerSeat);
  return ((steps + TABLE_SEATS.length) % TABLE_SEATS.length) as Place;
}

export function seatAt(place: Place, playerSeat: Seat): Seat {
  return TABLE_SEATS[(TABLE_SEATS.indexOf(playerSeat) + place) % TABLE_SEATS.length];
}

// Null for the player's own place, which has no occupant drawn
export function occupantAt(place: Place): Occupant | null {
  return place === 0 ? null : OCCUPANTS[place];
}
