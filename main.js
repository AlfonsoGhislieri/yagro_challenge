import { Factory } from "./src/factory.js";

const SIMULATION_LENGTH_STEPS = 100;

const factory = new Factory();

for (let i = 0; i < SIMULATION_LENGTH_STEPS; i++) {
  factory.resolveOneStep();
}

console.log(factory.getDroppedItems());
