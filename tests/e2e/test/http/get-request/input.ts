import type { Test } from "~/src";

export const test: Test = {
  defaultScenario: {
    steps: [
      {
        type: "http-request",
        method: "GET",
        url: "http://localhost:8080/",
        variables: {},
      },
    ],
  },
  scenarios: {},
};
