export const FactoryItem = {
  EMPTY_SPACE: "EMPTY_SPACE",
  COMPONENT_A: "COMPONENT_A",
  COMPONENT_B: "COMPONENT_B",
  ASSEMBLED_PRODUCT: {
    requiredComponents: ["COMPONENT_A", "COMPONENT_B"],
    assemblyTime: 3,
  },
};

export const WorkerStatus = {
  WORKING: "WORKING",
  ASSEMBLING: "ASSEMBLING",
  READY_TO_PLACE: "READY TO PLACE",
};
