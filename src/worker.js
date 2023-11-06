import { WorkerStatus, FactoryItem } from "./utils/utility.js";

const REQUIRED_COMPONENTS = FactoryItem.ASSEMBLED_PRODUCT.requiredComponents;
const ASSEMBLY_TIME = FactoryItem.ASSEMBLED_PRODUCT.assemblyTime;

export class Worker {
  constructor(inventoryCapacity = 2) {
    this._status = WorkerStatus.WORKING;
    this._inventory = [];
    this._assemblyTime = 0;
    this._inventoryCapacity = inventoryCapacity;
  }

  isItemNeeded = (item) => {
    // Checks if the item is valid and not already in the inventory
    return (
      REQUIRED_COMPONENTS.includes(item.name) && !this._inventory.includes(item)
    );
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
    const hasAllComponents = REQUIRED_COMPONENTS.every((componentName) =>
      this._inventory.some(
        (inventoryItem) => inventoryItem.name === componentName
      )
    );

    if (hasAllComponents) {
      this._status = WorkerStatus.ASSEMBLING;
      this._assemblyTime = ASSEMBLY_TIME;
    }
  };

  assembleItem = () => {
    // reduces assembly time by 1 unit of time, if 0 worker gets assembled product
    this._assemblyTime -= 1;

    if (this._assemblyTime === 0) {
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
