import { Art } from "@/art/art";
import { cardArtName } from "@/art/names";
import type { CardCode } from "@/cards/card";

type CardArtProps = {
  card: CardCode;
  width: number;
};

// Rule U6: a lesson asks for a card by its code and never imports a card file
export function CardArt({ card, width }: CardArtProps) {
  return <Art name={cardArtName(card)} width={width} />;
}
