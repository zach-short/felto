import { useEffect, useRef } from "react";

// GF-11 and GF-19: a bubble tells its caller when its mascot is talking, each time that changes and
// once more, as false, when the bubble goes, so a mascot never bobs or moves its mouth after its
// line is gone. The latest callback is kept in a ref, as useHardwareBack keeps its handler, so a
// caller that passes a new function on each draw does not report the same state twice.
export function useTalking(talking: boolean, onTalking?: (talking: boolean) => void) {
  const latest = useRef(onTalking);
  useEffect(() => {
    latest.current = onTalking;
  });
  useEffect(() => {
    latest.current?.(talking);
  }, [talking]);
  useEffect(() => () => latest.current?.(false), []);
}
