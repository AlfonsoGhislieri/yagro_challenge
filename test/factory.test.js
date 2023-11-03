import { Factory } from "../src/factory.js";
import { FactoryItem, WorkerStatus } from "../src/utils/utility.js";
import { Worker } from "../src/worker.js";
import { ConveyorBelt } from "../src/conveyorBelt.js";
import { expect } from "chai";
import sinon from "sinon";

// function that can be used to return worker without randomness
const stubRandomlySelectWorker = (worker, factory) => {
  const stub = sinon.stub(factory, "_randomlySelectWorker");
  stub.returns(worker);
};

describe("Factory", () => {
  afterEach(() => {
    sinon.restore();
  });

  describe("Initialisation", () => {
    it("Correct parameters initialised", () => {
      const factory = new Factory();
      const allWorkers = factory._workerPairs.flat();

      expect(factory._conveyorBelt).to.be.an.instanceOf(ConveyorBelt);
      allWorkers.forEach((worker) => {
        expect(worker).to.be.an.instanceof(Worker);
      });
    });
  });

  describe("handleEmptySpace", () => {
    let factory,
      worker1,
      worker2,
      placeItemSpy1,
      placeItemSpy2,
      conveyorBeltPlaceSpy;

    beforeEach(() => {
      // Initialiase all instances and spies
      factory = new Factory();
      [worker1, worker2] = factory._workerPairs[0];
      placeItemSpy1 = sinon.spy(worker1, "placeAssembledItem");
      placeItemSpy2 = sinon.spy(worker2, "placeAssembledItem");
      conveyorBeltPlaceSpy = sinon.spy(factory._conveyorBelt, "placeItem");
    });

    const testCases = [
      {
        worker1Status: WorkerStatus.READY_TO_PLACE,
        worker2Status: WorkerStatus.WORKING,
        workerToExpectCall: "worker1",
      },
      {
        worker1Status: WorkerStatus.WORKING,
        worker2Status: WorkerStatus.READY_TO_PLACE,
        workerToExpectCall: "worker2",
      },
      {
        worker1Status: WorkerStatus.READY_TO_PLACE,
        worker2Status: WorkerStatus.READY_TO_PLACE,
        workerToExpectCall: "worker1",
      },
      {
        worker1Status: WorkerStatus.READY_TO_PLACE,
        worker2Status: WorkerStatus.READY_TO_PLACE,
        workerToExpectCall: "worker2",
      },
    ];

    testCases.forEach(
      ({ worker1Status, worker2Status, workerToExpectCall }) => {
        it(`Correcly handles worker 1 status: ${worker1Status}, worker 2 status: ${worker2Status}`, () => {
          worker1._status = worker1Status;
          worker2._status = worker2Status;

          stubRandomlySelectWorker(
            workerToExpectCall === "worker1" ? worker1 : worker2,
            factory
          );

          factory.handleEmptySpace(worker1, worker2, 0);

          workerToExpectCall === "worker1"
            ? expect(placeItemSpy1.calledOnce).to.be.true
            : expect(placeItemSpy2.calledOnce).to.be.true;

          expect(conveyorBeltPlaceSpy.calledOnce).to.be.true;
          expect(conveyorBeltPlaceSpy.calledWith(FactoryItem.ASSEMBLED_PRODUCT))
            .to.be.true;
        });
      }
    );

    it("Handle when neither worker is ready to place", () => {
      worker1._status = WorkerStatus.WORKING;
      worker2._status = WorkerStatus.WORKING;

      factory.handleEmptySpace(worker1, worker2, 0);

      expect(placeItemSpy1.called).to.be.false;
      expect(placeItemSpy2.called).to.be.false;
      expect(conveyorBeltPlaceSpy.called).to.be.false;
    });
  });

  describe("checkWorkerNeedsItem", () => {
    const testCases = [
      {
        workerInventory: [
          FactoryItem.COMPONENT_A,
          FactoryItem.ASSEMBLED_PRODUCT,
        ],
        workerStatus: WorkerStatus.READY_TO_PLACE,
        expected: false,
      },
      {
        workerInventory: [FactoryItem.COMPONENT_A, FactoryItem.COMPONENT_B],
        workerStatus: WorkerStatus.ASSEMBLING,
        expected: false,
      },
      {
        workerInventory: [FactoryItem.COMPONENT_A],
        workerStatus: WorkerStatus.WORKING,
        expected: false,
      },
      {
        workerInventory: [FactoryItem.COMPONENT_B],
        workerStatus: WorkerStatus.WORKING,
        expected: true,
      },
      {
        workerInventory: [FactoryItem.ASSEMBLED_PRODUCT],
        workerStatus: WorkerStatus.WORKING,
        expected: true,
      },
    ];

    testCases.forEach(({ workerInventory, workerStatus, expected }) => {
      it(`Worker with inventory [${workerInventory.join(
        ", "
      )}] and status ${workerStatus} should return ${expected}`, () => {
        const factory = new Factory();
        factory._conveyorBelt._slots[0] = FactoryItem.COMPONENT_A;

        const worker = factory._workerPairs[0][0];
        worker._inventory = workerInventory;
        worker._status = workerStatus;

        const doesWorkerNeedItem = factory._isItemPickupPossible(worker, 0);
        expect(doesWorkerNeedItem).to.equal(expected);
      });
    });
  });

  describe("handleItemPickUp", () => {
    let factory,
      worker1,
      worker2,
      pickItemSpy1,
      pickItemSpy2,
      conveyorBeltRemoveSpy;

    beforeEach(() => {
      // Initialiase all instances and spies
      factory = new Factory();
      [worker1, worker2] = factory._workerPairs[0];
      pickItemSpy1 = sinon.spy(worker1, "pickupItem");
      pickItemSpy2 = sinon.spy(worker2, "pickupItem");
      conveyorBeltRemoveSpy = sinon.spy(factory._conveyorBelt, "removeItem");
    });

    const testCases = [
      {
        worker1WantsItem: true,
        worker2WantsItem: false,
        workerToExpectCall: "worker1",
      },
      {
        worker1WantsItem: false,
        worker2WantsItem: true,
        workerToExpectCall: "worker2",
      },
      {
        worker1WantsItem: true,
        worker2WantsItem: true,
        workerToExpectCall: "worker1",
      },
      {
        worker1WantsItem: true,
        worker2WantsItem: true,
        workerToExpectCall: "worker2",
      },
    ];

    testCases.forEach(
      ({ worker1WantsItem, worker2WantsItem, workerToExpectCall }) => {
        it(`Correcly handles when worker1 wants item: ${worker1WantsItem}, worker2 wants item ${worker2WantsItem}`, () => {
          const slotIndex = 0;
          factory._conveyorBelt._slots[slotIndex] = FactoryItem.COMPONENT_B;

          stubRandomlySelectWorker(
            workerToExpectCall === "worker1" ? worker1 : worker2,
            factory
          );

          sinon
            .stub(factory, "_isItemPickupPossible")
            .onFirstCall()
            .returns(worker1WantsItem)
            .onSecondCall()
            .returns(worker2WantsItem);

          factory.handleItemPickUp(worker1, worker2, slotIndex);

          workerToExpectCall === "worker1"
            ? expect(pickItemSpy1.calledOnce).to.be.true
            : expect(pickItemSpy2.calledOnce).to.be.true;

          expect(conveyorBeltRemoveSpy.calledOnce).to.be.true;
          expect(conveyorBeltRemoveSpy.calledWith(slotIndex)).to.be.true;
        });
      }
    );

    it("Handle when neither worker wants item", () => {
      sinon
        .stub(factory, "_isItemPickupPossible")
        .onFirstCall()
        .returns(false)
        .onSecondCall()
        .returns(false);

      factory.handleItemPickUp(worker1, worker2, 0);

      expect(pickItemSpy1.calledOnce).to.be.false;
      expect(pickItemSpy2.calledOnce).to.be.false;
      expect(conveyorBeltRemoveSpy.calledOnce).to.be.false;
    });
  });
});
