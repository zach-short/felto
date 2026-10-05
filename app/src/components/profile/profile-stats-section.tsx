import { FieldGroup, ListItem } from "@expo/ui";

import { Art } from "@/art/art";
import type { ProfileStat } from "@/components/profile/profile-view-model";
import { MIN_STAT_ICON } from "@/theme/tokens";

// DESIGN.md 10.3: the stats are native list rows, each beside its stat icon from the art
export function ProfileStatsSection({ stats }: { stats: ProfileStat[] }) {
  return (
    <FieldGroup.Section title="Your table">
      {stats.map((stat) => (
        <ListItem key={stat.art} leading={<Art name={stat.art} width={MIN_STAT_ICON} />} trailing={String(stat.value)}>
          {stat.label}
        </ListItem>
      ))}
    </FieldGroup.Section>
  );
}
