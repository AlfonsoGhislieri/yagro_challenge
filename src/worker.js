import { WorkerStatus, FactoryItem } from "./utils/utility.js";

const requiredComponents = FactoryItem.ASSEMBLED_PRODUCT.requiredComponents;
const assemblyTime = FactoryItem.ASSEMBLED_PRODUCT.assemblyTime;

export class Worker {
  constructor(inventoryCapacity = 2) {
    this._status = WorkerStatus.WORKING;
    this._inventory = [];
    this._assembly_time = 0;
    this._inventoryCapacity = inventoryCapacity;
  }

  isItemNeeded = (item) => {
    // Checks if item is valid and worker doesn't already have it
    if (
      requiredComponents.includes(item.name) &&
      !this._inventory.includes(item)
    ) {
      return true;
    }
    return false;
  };

  isInventoryFull = () => {
    return this._inventory.length >= this._inventoryCapacity;
  };

  isReadyToPlace = () => {
    return this._status === WorkerStatus.READY_TO_PLACE;
  };

  pickupItem = (item) => {
    // Item added to inventory and begin assembling if valid components are in inventory
    this._inventory.push(item);

    // Check if all required components are in the inventory
    const hasAllComponents = requiredComponents.every((componentName) =>
      this._inventory.some(
        (inventoryItem) => inventoryItem.name === componentName
      )
    );

    if (hasAllComponents) {
      this._status = WorkerStatus.ASSEMBLING;
      this._assembly_time = FactoryItem.ASSEMBLED_PRODUCT.assemblyTime;
    }
  };

  assembleItem = () => {
    // reduces assembly time by 1 unit of time, if 0 worker gets assembled product
    this._assembly_time -= 1;

    if (this._assembly_time === 0) {
      this._inventory = [];
      this._inventory.push(FactoryItem.ASSEMBLED_PRODUCT);
      this._status = WorkerStatus.READY_TO_PLACE;
    }
  };

  placeAssembledItem = () => {
    this._status = WorkerStatus.WORKING;
    this._inventory = [];
  };
}
