import { ConveyorBelt } from "./conveyorBelt.js";
import { FactoryItem, WorkerStatus } from "./utils/utility.js";
import { Worker } from "./worker.js";

const defaultBeltLength = 3;

export class Factory {
  constructor({
    conveyorBeltClass = ConveyorBelt,
    workerClass = Worker,
    conveyorBeltLength = defaultBeltLength,
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

    const lastItem = conveyorBelt.moveBeltForward();
    if (lastItem !== FactoryItem.EMPTY_SPACE) {
      this._droppedItems[lastItem] = (this._droppedItems[lastItem] || 0) + 1;
    }

    conveyorBelt._slots.forEach((item, index) => {
      const [worker1, worker2] = this._workerPairs[index];

      if (conveyorBelt.getItemAtIndex(index) == FactoryItem.EMPTY_SPACE) {
        this.handleEmptySpace(worker1, worker2, index);
      } else {
        this.handleItemPickUp(worker1, worker2, index);
      }
    });
  };

  handleEmptySpace = (worker1, worker2, slotIndex) => {
    // Selects the worker and places item on the conveyor belt if possible
    let selectedWorker;

    this._handleAssemblingWorkers(worker1, worker2);
    // If neither worker is ready to place return
    if (!(worker1.isReadyToPlace() || worker2.isReadyToPlace())) {
      return;
    }

    if (worker1.isReadyToPlace() && worker2.isReadyToPlace()) {
      // Randomly decide which worker places the item
      selectedWorker = this._randomlySelectWorker(worker1, worker2);
    } else {
      worker1.isReadyToPlace()
        ? (selectedWorker = worker1)
        : (selectedWorker = worker2);
    }

    selectedWorker.placeAssembledItem();
    this._conveyorBelt.placeItem(FactoryItem.ASSEMBLED_PRODUCT, slotIndex);
  };

  handleItemPickUp = (worker1, worker2, slotIndex) => {
    this._handleAssemblingWorkers(worker1, worker2);

    // Selects the worker and picks up item on the conveyor belt if possible
    let selectedWorker;
    const worker1CanPickup = this._isItemPickupPossible(worker1, slotIndex);
    const worker2CanPickup = this._isItemPickupPossible(worker2, slotIndex);

    if (!(worker1CanPickup || worker2CanPickup)) {
      return;
    }

    if (worker1CanPickup && worker2CanPickup) {
      // Randomly decide which worker places the item
      selectedWorker = this._randomlySelectWorker(worker1, worker2);
    } else {
      worker1CanPickup
        ? (selectedWorker = worker1)
        : (selectedWorker = worker2);
    }

    selectedWorker.pickupItem(this._conveyorBelt.getItemAtIndex(slotIndex));
    this._conveyorBelt.removeItem(slotIndex);
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

  _handleAssemblingWorkers = (...workers) => {
    for (const worker of workers) {
      if (worker._status === WorkerStatus.ASSEMBLING) {
        worker.assembleItem();
      }
    }
  };

  _randomlySelectWorker = (...workers) => {
    const randomIndex = Math.floor(Math.random() * workers.length);
    return workers[randomIndex];
  };
}
