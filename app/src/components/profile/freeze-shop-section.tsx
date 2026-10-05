import { Button, FieldGroup, ListItem, Text } from "@expo/ui";

import { Art } from "@/art/art";
import type { FreezeShop } from "@/components/profile/profile-view-model";
import { heldLine } from "@/components/profile/profile-view-model";
import { MIN_STAT_ICON } from "@/theme/tokens";

type FreezeShopSectionProps = {
  shop: FreezeShop;
  gems: number;
  onBuy: () => void;
};

// D19 and DESIGN.md 10.7: Profile sells the streak freeze, with its price, the number held and
// the player's gems; the native Button is greyed out when a freeze cannot be bought
export function FreezeShopSection({ shop, gems, onBuy }: FreezeShopSectionProps) {
  return (
    <FieldGroup.Section title="Streak freeze">
      <ListItem leading={<Art name="streak_freeze" width={MIN_STAT_ICON} />} trailing={heldLine(shop.held)}>
        Streak freeze
      </ListItem>
      <ListItem leading={<Art name="gem" width={MIN_STAT_ICON} />} trailing={String(gems)}>
        Your gems
      </ListItem>
      <Button onPress={onBuy} disabled={!shop.canBuy} label={`Buy a freeze for ${shop.price} gems`} />
      <FieldGroup.SectionFooter>
        <Text>{shop.line}</Text>
      </FieldGroup.SectionFooter>
    </FieldGroup.Section>
  );
}
