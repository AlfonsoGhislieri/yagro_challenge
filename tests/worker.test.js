import { Worker } from "../src/worker";
import { WorkerStatus, FactoryItem } from "../src/utils/utility";

describe("Worker", () => {
  describe("Initialisation", () => {
    it("Initialises with correct parameters", () => {
      const worker = new Worker();

      expect(worker._status).toEqual(WorkerStatus.WORKING);
      expect(worker._inventory).toEqual([]);
      expect(worker._assembly_time).toEqual(0);
    });
  });

  describe("Checks if item is needed", () => {
    it.each([
      [true, FactoryItem.COMPONENT_A, []],
      [true, FactoryItem.COMPONENT_A, FactoryItem.COMPONENT_B],
      [false, FactoryItem.COMPONENT_A, FactoryItem.COMPONENT_A],
      [
        false,
        FactoryItem.COMPONENT_B,
        FactoryItem.ASSEMBLED_PRODUCT.requiredComponents,
      ],
    ])(
      "Returns %p for item %p with worker inventory %p",
      (isItemNeeded, item, workerInventory) => {
        const worker = new Worker();
        worker._inventory = workerInventory;

        expect(worker.isItemNeeded(item)).toEqual(isItemNeeded);
      }
    );
  });

  describe("Item pick up", () => {
    it("Worker picks up single component", () => {
      const worker = new Worker();
      worker.pickupItem(FactoryItem.COMPONENT_A);

      expect(worker._inventory.length).toEqual(1);
      expect(worker._status).toEqual(WorkerStatus.WORKING);
    });

    it("Worker picks up both components", () => {
      const worker = new Worker();
      worker.pickupItem(FactoryItem.COMPONENT_B);
      worker.pickupItem(FactoryItem.COMPONENT_A);

      expect(worker._inventory.length).toEqual(2);
      expect(worker._status).toEqual(WorkerStatus.ASSEMBLING);
      expect(worker._assembly_time).toEqual(
        FactoryItem.ASSEMBLED_PRODUCT.assemblyTime
      );
    });
  });

  describe("Item assembly", () => {
    it.each([
      [3, WorkerStatus.ASSEMBLING, []],
      [2, WorkerStatus.ASSEMBLING, []],
      [1, WorkerStatus.READY_TO_PLACE, [FactoryItem.ASSEMBLED_PRODUCT]],
    ])(
      "Assembles item with timer of %i and changes status to %p",
      (timer, expectedStatus, expectedInventory) => {
        const worker = new Worker();
        worker._status = WorkerStatus.ASSEMBLING;
        worker._assembly_time = timer;
        worker.assembleItem();

        expect(worker._status).toEqual(expectedStatus);
        expect(worker._inventory).toEqual(expectedInventory);
      }
    );
  });

  describe("Release assembled item", () => {
    it("Resets worker inventory and status", () => {
      const worker = new Worker();
      worker._status = WorkerStatus.READY_TO_PLACE;
      worker._inventory.push(FactoryItem.ASSEMBLED_PRODUCT.requiredComponents);

      worker.placeAssembledItem();

      expect(worker._status).toEqual(WorkerStatus.WORKING);
      expect(worker._inventory).toEqual([]);
      expect(worker._assembly_time).toEqual(0);
    });
  });
});
