import { WorkerStatus, FactoryItem } from "./utils/utility.js";

const requiredComponents = FactoryItem.ASSEMBLED_PRODUCT.requiredComponents;
const assemblyTime = FactoryItem.ASSEMBLED_PRODUCT.assemblyTime;

export class Worker {
  constructor() {
    this._status = WorkerStatus.WORKING;
    this._inventory = [];
    this._assembly_time = 0;
  }

  isItemNeeded = (item) => {
    // Checks if item is valid and worker doesn't already have it
    if (requiredComponents.includes(item) && !this._inventory.includes(item)) {
      return true;
    }
    return false;
  };

  pickupItem = (item) => {
    // Item added to inventory and begin assembling if valid components are in inventory
    this._inventory.push(item);

    if (requiredComponents.every((el) => this._inventory.includes(el))) {
      this._status = WorkerStatus.ASSEMBLING;
      this._assembly_time = assemblyTime;
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
