import { FactoryItem } from "../src/utils/utility.js";
import { ConveyorBelt } from "../src/conveyorBelt.js";
import { expect } from "chai";
import sinon from "sinon";

describe("Conveyor Belt", () => {
  describe("Initialisation", () => {
    it("Initialises with correct parameters", () => {
      const conveyorBelt = new ConveyorBelt(10);

      expect(conveyorBelt._slots.length).to.equal(10);
      expect(
        conveyorBelt._slots.every((item) => item === FactoryItem.EMPTY_SPACE)
      ).to.be.true;
    });
  });

  describe("Move conveyor belt", () => {
    let conveyorBelt;
    const lenConveyorBelt = 3;

    beforeEach(() => {
      conveyorBelt = new ConveyorBelt(lenConveyorBelt);
    });

    afterEach(() => {
      sinon.restore();
    });

    it("getRandomFactoryItem is called correctly", () => {
      const getRandomFactoryItemSpy = sinon.spy(
        conveyorBelt,
        "_getRandomFactoryItem"
      );

      conveyorBelt.moveBeltForward();

      expect(getRandomFactoryItemSpy.calledOnce).to.be.true;
    });

    it(`Belt moves forward ${lenConveyorBelt} times, new slots and removed items match`, () => {
      // Stub getRandomFactoryItem to return COMPONENT_A
      const getRandomFactoryItemStub = sinon.stub(
        conveyorBelt,
        "_getRandomFactoryItem"
      );
      getRandomFactoryItemStub.returns(FactoryItem.COMPONENT_A);

      const removedItems = Array.from({ length: lenConveyorBelt }, () => {
        return conveyorBelt.moveBeltForward();
      });

      expect(removedItems).to.deep.equal(
        Array(lenConveyorBelt).fill(FactoryItem.EMPTY_SPACE)
      );
      expect(conveyorBelt._slots).to.deep.equal(
        Array(lenConveyorBelt).fill(FactoryItem.COMPONENT_A)
      );
    });
  });

  describe("Item removal", () => {
    it("Item removed from belt and returned", () => {
      const conveyorBelt = new ConveyorBelt(3);
      conveyorBelt._slots[1] = FactoryItem.COMPONENT_A;

      const removedItem = conveyorBelt.removeItem(1);

      expect(conveyorBelt._slots.length).to.equal(3);
      expect(conveyorBelt._slots[1]).to.equal(FactoryItem.EMPTY_SPACE);
      expect(removedItem).to.equal(FactoryItem.COMPONENT_A);
    });
  });

  describe("Item placing", () => {
    it("Item placed on belt", () => {
      const conveyorBelt = new ConveyorBelt(3);
      const expectedSlots = Array(3).fill(FactoryItem.EMPTY_SPACE);

      expect(conveyorBelt._slots).to.deep.equal(expectedSlots);

      conveyorBelt.placeItem(FactoryItem.ASSEMBLED_PRODUCT, 1);
      expectedSlots[1] = FactoryItem.ASSEMBLED_PRODUCT;

      expect(conveyorBelt._slots[1]).to.equal(FactoryItem.ASSEMBLED_PRODUCT);
      expect(conveyorBelt._slots).to.deep.equal(expectedSlots);
    });
  });
});
