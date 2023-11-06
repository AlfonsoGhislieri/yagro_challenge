// TODO: Create a FactoryItem class, storing values eg: canBePickedUp, name, assembly time ...
export const FactoryItem = {
  EMPTY_SPACE: { name: "EMPTY_SPACE" },
  COMPONENT_A: {
    name: "COMPONENT_A",
  },
  COMPONENT_B: {
    name: "COMPONENT_B",
  },
  ASSEMBLED_PRODUCT: {
    name: "ASSEMBLED_PRODUCT",
    requiredComponents: ["COMPONENT_A", "COMPONENT_B"],
    assemblyTime: 3,
  },
};

export const WorkerStatus = {
  WORKING: "WORKING",
  ASSEMBLING: "ASSEMBLING",
  READY_TO_PLACE: "READY TO PLACE",
};
