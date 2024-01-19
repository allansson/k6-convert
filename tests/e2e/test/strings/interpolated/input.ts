import type { Test } from "~/src";

export const test: Test = {
  defaultScenario: {
    steps: [
      { type: "log", message: "My var is ${myVar} and test is ${myTest}" },
    ],
  },
  scenarios: {},
};
