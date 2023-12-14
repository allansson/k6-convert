import type { Test } from "~/src/convert/test/types";

interface HarInput {
  source: "har";
  target: "test" | "script";
  har: unknown;
}

function fromHar(_har: unknown): Test {
  throw new Error("Not implemented yet");
}

export { fromHar, type HarInput };
