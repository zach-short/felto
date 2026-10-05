import { CAST } from "@/content/cast";

// D10's warm register for the error state of rule U4: the fish owns the slip, and the button deals
// again. Held here, not in route-error.tsx, so a test can read it without React Native.
export const ROUTE_ERROR_LINE = `${CAST.fish} dropped the deck drawing this screen.`;
export const ROUTE_ERROR_RETRY = "Deal again";
