import type { Test } from "~/src";

export const test: Test = {
  defaultScenario: {
    steps: [
      {
        type: "http-request",
        method: "GET",
        url: "http://localhost:8080",
        variables: {
          myVar1: { type: "raw" },
          myVar2: { type: "raw" },
          myVar3: { type: "raw" },
        },
      },
    ],
  },
  scenarios: {},
};
