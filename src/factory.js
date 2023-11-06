import { ConveyorBelt } from "./conveyorBelt.js";
import { FactoryItem, WorkerStatus } from "./utils/utility.js";
import { Worker } from "./worker.js";

const DEFAULT_BELT_LENGTH = 3;

export class Factory {
  constructor({
    conveyorBeltClass = ConveyorBelt,
    workerClass = Worker,
    conveyorBeltLength = DEFAULT_BELT_LENGTH,
  } = {}) {
    this._conveyorBelt = new conveyorBeltClass(conveyorBeltLength);
    // Creates 2D array to populate each slot for the conveyorBelt
    this._workerPairs = Array.from({ length: conveyorBeltLength }, () => [
      new workerClass(),
      new workerClass(),
    ]);
    this._droppedItems = new Object();
  }

  resolveOneStep = () => {
    const conveyorBelt = this._conveyorBelt;

    // collects last item off the belt
    const lastItem = conveyorBelt.moveBeltForward();
    this._collectDroppedItem(lastItem);

    /*
    iteratures through each slot in the belt and handles logic for either
    an empty slot on the belt or occupied slot 
    */
    conveyorBelt._slots.forEach((item, index) => {
      const workerPair = this._workerPairs[index];

      if (conveyorBelt.getItemAtIndex(index) === FactoryItem.EMPTY_SPACE) {
        this._handleEmptySpace(workerPair, index);
      } else {
        this._handleItemPickUp(workerPair, index);
      }
    });
  };

  _handleEmptySpace = (workers, slotIndex) => {
    // Selects the worker and places item on the conveyor belt if possible
    this._handleAssemblingWorkers(workers);

    const validWorkers = workers.filter((worker) => worker.isReadyToPlace());
    const selectedWorker = this._selectValidWorker(validWorkers);

    if (selectedWorker) {
      selectedWorker.placeAssembledItem();
      this._conveyorBelt.placeItem(FactoryItem.ASSEMBLED_PRODUCT, slotIndex);
    }
  };

  _handleItemPickUp = (workers, slotIndex) => {
    this._handleAssemblingWorkers(workers);

    const validWorkers = workers.filter((worker) =>
      this._isItemPickupPossible(worker, slotIndex)
    );
    const selectedWorker = this._selectValidWorker(validWorkers);

    if (selectedWorker) {
      selectedWorker.pickupItem(this._conveyorBelt.getItemAtIndex(slotIndex));
      this._conveyorBelt.removeItem(slotIndex);
    }
  };

  _isItemPickupPossible = (worker, slotIndex) => {
    if (worker._status === WorkerStatus.ASSEMBLING) {
      return false;
    }

    if (worker.isInventoryFull()) {
      return false;
    }

    if (!worker.isItemNeeded(this._conveyorBelt.getItemAtIndex(slotIndex))) {
      return false;
    }

    return true;
  };

  _collectDroppedItem = (item) => {
    if (item !== FactoryItem.EMPTY_SPACE) {
      this._droppedItems[item.name] = (this._droppedItems[item.name] || 0) + 1;
    }
  };

  getDroppedItems = () => {
    return this._droppedItems;
  };

  _handleAssemblingWorkers = (workers) => {
    for (const worker of workers) {
      if (worker._status === WorkerStatus.ASSEMBLING) {
        worker.assembleItem();
      }
    }
  };

  _randomlySelectWorker = (workers) => {
    const randomIndex = Math.floor(Math.random() * workers.length);
    return workers[randomIndex];
  };

  _selectValidWorker = (validWorkers) => {
    let selectedWorker;

    if (validWorkers.length === 0) {
      return;
    }

    if (validWorkers.length > 1) {
      selectedWorker = this._randomlySelectWorker(validWorkers);
    } else {
      selectedWorker = validWorkers[0];
    }

    return selectedWorker;
  };
}
