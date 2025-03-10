import type { Test } from "~/src";

export const test: Test = {
  defaultScenario: {
    steps: [
      {
        type: "http-request",
        method: "PUT",
        url: "http://localhost:8080/echo",
        body: {
          mimeType: "application/json",
          content: "{}",
        },
        variables: {
          myVar: {
            type: "raw",
          },
        },
      },
    ],
  },
  scenarios: {},
};
