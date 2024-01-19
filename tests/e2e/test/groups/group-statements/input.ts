import type { Test } from "~/src";

export const test: Test = {
  defaultScenario: {
    steps: [
      {
        type: "group",
        name: "first",
        steps: [],
      },
      {
        type: "group",
        name: "second",
        steps: [],
      },
    ],
  },
  scenarios: {},
};
