import {
  canInteract,
  familiarWeight,
  haveEquipped,
  Item,
  itemAmount,
  myClass,
  myFamiliar,
  myPath,
  print,
  retrieveItem,
  toInt,
  weightAdjustment,
} from "kolmafia";
import { $item, $path, $stat, get, withProperty } from "libram";

export function debug(message: string, color?: string): void {
  if (color) {
    print(`${message}`, color);
  } else {
    print(`${message}`);
  }
}

export function formatAmountOfItem(amount: number, item: Item): string {
  return `${amount} ${amount === 1 ? item : item.plural}`;
}

export function formatNumber(x: number): string {
  const str = x.toString();
  if (str.includes(".")) return x.toFixed(2);
  return str.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function acquire(quantity: number, item: Item, maxPrice: number): number {
  if (!item.tradeable) return 0;

  debug(`Trying to acquire ${formatAmountOfItem(quantity, item)}}`, "green");
  const startAmount = itemAmount(item);
  withProperty("autoBuyPriceLimit", maxPrice, () => retrieveItem(item, quantity));
  return itemAmount(item) - startAmount;
}

export function expectedAdvsGainedPerCombat(): number {
  const gnome = haveEquipped($item`gnomish housemaid's kgnee`)
    ? (familiarWeight(myFamiliar()) + weightAdjustment()) / 1000
    : 0;
  const ring = haveEquipped($item`mafia thumb ring`) ? 0.04 : 0;
  return gnome + ring;
}

export function expectedBagsPerAdv(familiarWeight: number, itemDrop: number): number {
  const bonusItem = (itemDrop + (Math.sqrt(55 + familiarWeight) + familiarWeight + 3)) / 100;
  const a = familiarWeight / 1000 + 0.04; // expected advs gained per combat
  const b = 0.25 / (1 - (0.2 + 0.8 * a)) + (0.75 * (0.05 * (1 + bonusItem))) / (1 - a); // expected bags from combat with a burnout or jock
  return (6 / 7) * b + (1 / 7) * ((2 / 5) * b + (3 / 5) * (0.2 + 0.8 * a) * b);
}

export function canPickpocket(): boolean {
  return (
    myClass().primestat === $stat`Moxie` ||
    [$item`mime army infiltration glove`, $item`tiny black hole`].some((item) => haveEquipped(item))
  );
}

export function ronin(): boolean {
  return !canInteract();
}

export function gyou(): boolean {
  return myPath() === $path`Grey You`;
}

export function canPull(item: Item): boolean {
  const pulls = get("_roninStoragePulls").split(",");
  return ronin() && pulls.length < 20 && !pulls.includes(`${toInt(item)}`);
}
