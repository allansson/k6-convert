import type { Test } from "~/src";

export const test: Test = {
  defaultScenario: {
    steps: [
      {
        type: "http-request",
        method: "POST",
        url: "http://localhost:8080/echo",
        body: {
          mimeType: "application/json",
          content: '{ "hello": "world", "foo": false }',
        },
        variables: {},
      },
    ],
  },
  scenarios: {},
};
