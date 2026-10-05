import { View } from "react-native";

import { PathStopView } from "@/components/path/path-stop-view";
import type { PathUnit } from "@/components/path/path-view-model";
import { UnitHeader } from "@/components/path/unit-header";

type LearnPathProps = {
  units: PathUnit[];
};

// DESIGN.md 10.1: one scrolling path, each unit a header and then its seven stops
export function LearnPath({ units }: LearnPathProps) {
  return (
    <View>
      {units.map((unit) => (
        <View key={unit.id}>
          <UnitHeader unit={unit} />
          {unit.stops.map((stop, index) => (
            <PathStopView key={stop.node.id} stop={stop} index={index} />
          ))}
        </View>
      ))}
    </View>
  );
}
