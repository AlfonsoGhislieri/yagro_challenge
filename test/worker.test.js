import { Worker } from "../src/worker.js";
import { WorkerStatus, FactoryItem } from "../src/utils/utility.js";
import { expect } from "chai";

describe("Worker", () => {
  describe("Initialisation", () => {
    it("Initialises with correct parameters", () => {
      const worker = new Worker();

      expect(worker._status).to.equal(WorkerStatus.WORKING);
      expect(worker._inventory).to.deep.equal([]);
      expect(worker._assemblyTime).to.equal(0);
    });
  });

  describe("Checks if item is needed", () => {
    const testCases = [
      [true, FactoryItem.COMPONENT_A, []],
      [true, FactoryItem.COMPONENT_A, [FactoryItem.COMPONENT_B]],
      [false, FactoryItem.COMPONENT_A, [FactoryItem.COMPONENT_A]],
      [
        false,
        FactoryItem.COMPONENT_B,
        [FactoryItem.COMPONENT_B, FactoryItem.COMPONENT_B],
      ],
      [true, FactoryItem.COMPONENT_B, [FactoryItem.ASSEMBLED_PRODUCT]],
      [true, FactoryItem.COMPONENT_A, [FactoryItem.ASSEMBLED_PRODUCT]],
    ];

    testCases.forEach(([isItemNeeded, item, workerInventory]) => {
      it(`Returns ${isItemNeeded} for item ${
        item.name
      } with worker inventory ${JSON.stringify(workerInventory)}`, () => {
        const worker = new Worker();
        worker._inventory = workerInventory;

        expect(worker.isItemNeeded(item)).to.equal(isItemNeeded);
      });
    });
  });

  describe("Checks worker inventory capacity", () => {
    const testCases = [
      [false, [FactoryItem.COMPONENT_A]],
      [true, [FactoryItem.COMPONENT_A, FactoryItem.ASSEMBLED_PRODUCT]],
    ];

    testCases.forEach(([expected, workerInventory]) => {
      it(`Returns ${expected} for inventory size of ${workerInventory.length}`, () => {
        const maxInventoryCapacity = 2;
        const worker = new Worker(maxInventoryCapacity);
        worker._inventory = workerInventory;

        expect(worker.isInventoryFull()).to.equal(expected);
      });
    });
  });

  describe("Checks worker is ready to place", () => {
    const testCases = [
      [false, WorkerStatus.ASSEMBLING],
      [false, WorkerStatus.WORKING],
      [true, WorkerStatus.READY_TO_PLACE],
    ];

    testCases.forEach(([expected, workerStatus]) => {
      it(`Returns ${expected} if worker is ${workerStatus}`, () => {
        const worker = new Worker();
        worker._status = workerStatus;

        expect(worker.isReadyToPlace()).to.equal(expected);
      });
    });
  });

  describe("Item pick up", () => {
    it("Worker picks up single component", () => {
      const worker = new Worker();
      worker.pickupItem(FactoryItem.COMPONENT_A);

      expect(worker._inventory.length).to.equal(1);
      expect(worker._status).to.equal(WorkerStatus.WORKING);
    });

    it("Worker picks up both components", () => {
      const worker = new Worker();
      worker.pickupItem(FactoryItem.COMPONENT_B);
      worker.pickupItem(FactoryItem.COMPONENT_A);

      expect(worker._inventory.length).to.equal(2);
      expect(worker._status).to.equal(WorkerStatus.ASSEMBLING);
      expect(worker._assemblyTime).to.equal(
        FactoryItem.ASSEMBLED_PRODUCT.assemblyTime
      );
    });
  });

  describe("Item assembly", () => {
    const testCases = [
      [3, WorkerStatus.ASSEMBLING, []],
      [2, WorkerStatus.ASSEMBLING, []],
      [1, WorkerStatus.READY_TO_PLACE, [FactoryItem.ASSEMBLED_PRODUCT]],
    ];

    testCases.forEach(([timer, expectedStatus, expectedInventory]) => {
      it(`Assembles item with timer of ${timer} and changes status to ${expectedStatus}`, () => {
        const worker = new Worker();
        worker._status = WorkerStatus.ASSEMBLING;
        worker._assemblyTime = timer;
        worker.assembleItem();

        expect(worker._status).to.equal(expectedStatus);
        expect(worker._inventory).to.deep.equal(expectedInventory);
      });
    });
  });

  describe("Release assembled item", () => {
    it("Resets worker inventory and status", () => {
      const worker = new Worker();
      worker._status = WorkerStatus.READY_TO_PLACE;
      worker._inventory.push(FactoryItem.ASSEMBLED_PRODUCT.requiredComponents);

      worker.placeAssembledItem();

      expect(worker._status).to.equal(WorkerStatus.WORKING);
      expect(worker._inventory).to.deep.equal([]);
      expect(worker._assemblyTime).to.equal(0);
    });
  });
});
