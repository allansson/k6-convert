import type { Test } from "~/src";

export const test: Test = {
  defaultScenario: {
    steps: [
      {
        type: "http-request",
        method: "POST",
        url: "http://localhost:8080/echo",
        body: {
          mimeType: "application/x-www-form-urlencoded",
          params: {
            foo: "bar",
          },
        },
        variables: {},
      },
    ],
  },
  scenarios: {},
};
