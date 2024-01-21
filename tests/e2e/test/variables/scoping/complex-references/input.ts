import type { Test } from "~/src";

export const test: Test = {
  defaultScenario: {
    steps: [
      {
        type: "group",
        name: "level 1.1",
        steps: [
          {
            type: "group",
            name: "level 1.2",
            steps: [
              {
                type: "group",
                name: "level 1.3",
                steps: [
                  {
                    type: "http-request",
                    method: "GET",
                    url: "https://example.com",
                    variables: { level13: { type: "raw" } },
                  },
                ],
              },
              {
                type: "http-request",
                method: "GET",
                url: "https://example.com",
                variables: { level12: { type: "raw" } },
              },
            ],
          },
          { type: "log", message: "${level12}" },
        ],
      },
      {
        type: "group",
        name: "level 2.1",
        steps: [
          {
            type: "group",
            name: "level 2.2",
            steps: [
              {
                type: "http-request",
                method: "GET",
                url: "https://example.com",
                variables: { level22: { type: "raw" } },
              },
            ],
          },
          {
            type: "http-request",
            method: "GET",
            url: "https://example.com",
            variables: { level21: { type: "raw" } },
          },
          { type: "log", message: "${level13}" },
          { type: "log", message: "${level22}" },
        ],
      },
      { type: "log", message: "${level21}" },
    ],
  },
  scenarios: {},
};
