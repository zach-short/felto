import { useState } from "react";

// Android's reminder time dialog is open or shut; iOS never opens it (reminder-time.ios.tsx)
export function useTimeDialog() {
  const [open, setOpen] = useState(false);
  return { open, show: () => setOpen(true), hide: () => setOpen(false) };
}
