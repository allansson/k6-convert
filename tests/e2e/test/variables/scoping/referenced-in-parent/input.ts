import type { Test } from "~/src";

export const test: Test = {
  defaultScenario: {
    steps: [
      {
        type: "group",
        name: "inner",
        steps: [
          {
            type: "http-request",
            method: "GET",
            url: "https://example.com",
            variables: {
              innerVar: {
                type: "raw",
              },
            },
          },
        ],
      },
      {
        type: "log",
        message: "${innerVar}",
      },
    ],
  },
  scenarios: {},
};
