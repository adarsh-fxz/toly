import {
  CakeSlice,
  Coffee,
  Dices,
  type LucideIcon,
  Martini,
  MicVocal,
  Sparkles,
  Store,
  UtensilsCrossed,
} from "lucide-react";

const icons: Record<string, LucideIcon> = {
  cafe: Coffee,
  restaurant: UtensilsCrossed,
  dessert: CakeSlice,
  bar: Martini,
  karaoke: MicVocal,
  games: Dices,
  activity: Sparkles,
};

export function CategoryIcon({
  category,
  className,
}: {
  category: string;
  className?: string;
}) {
  const Icon = icons[category] ?? Store;
  return <Icon className={className} aria-hidden />;
}
