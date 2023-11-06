import { FactoryItem } from "./utils/utility.js";

export class ConveyorBelt {
  constructor(slotCount) {
    this._slots = new Array(slotCount).fill(FactoryItem.EMPTY_SPACE);
  }

  moveBeltForward = () => {
    // Remove the last item from the belt and adds a new random item to the start
    const lastItem = this._slots.pop();

    this._slots.unshift(this._getRandomFactoryItem());

    return lastItem;
  };

  placeItem = (item, slotIndex) => {
    this._slots[slotIndex] = item;
  };

  getItemAtIndex = (slotIndex) => {
    return this._slots[slotIndex];
  };

  removeItem = (slotIndex) => {
    const item = this._slots[slotIndex];
    this._slots[slotIndex] = FactoryItem.EMPTY_SPACE;
    return item;
  };

  _getRandomFactoryItem = () => {
    // Get random Factory item that is not an assembled product
    const items = Object.values(FactoryItem).filter(
      (item) => item !== FactoryItem.ASSEMBLED_PRODUCT
    );
    return items[Math.floor(Math.random() * items.length)];
  };
}
