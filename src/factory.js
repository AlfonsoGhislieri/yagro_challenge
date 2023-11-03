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
  }

  // TODO
  // resolveOneStep = () => {
  //   const conveyorBelt = this._conveyorBelt;

  //   conveyorBelt.moveBeltForward();

  //   conveyorBelt._slots.forEach((item, index) => {
  //     console.log(item, index);
  //   });
  // };

  handleEmptySpace = (worker1, worker2, slotIndex) => {
    // Selects the worker and places item on the conveyor belt if possible
    let selectedWorker;
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

    selectedWorker.pickupItem(this._conveyorBelt._slots[slotIndex]);
    this._conveyorBelt.removeItem(slotIndex);
  };

  _isItemPickupPossible = (worker, slotIndex) => {
    if (worker._status === WorkerStatus.ASSEMBLING) {
      return false;
    }

    if (worker.isInventoryFull()) {
      return false;
    }

    if (!worker.isItemNeeded(this._conveyorBelt._slots[slotIndex])) {
      return false;
    }

    return true;
  };

  _randomlySelectWorker = (...workers) => {
    const randomIndex = Math.floor(Math.random() * workers.length);
    return workers[randomIndex];
  };
}
