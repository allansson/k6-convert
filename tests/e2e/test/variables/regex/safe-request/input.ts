import type { Test } from "~/src";

export const test: Test = {
  defaultScenario: {
    steps: [
      {
        type: "http-request",
        method: "GET",
        url: "http://localhost:8080/echo",
        variables: {
          myVar: {
            type: "regex",
            pattern: "^[a-zA-Z]+",
            group: 0,
          },
        },
      },
      {
        type: "log",
        message: "${myVar}",
      },
    ],
  },
  scenarios: {},
};
