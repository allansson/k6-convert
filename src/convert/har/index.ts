import type { Result } from "~/src/context";
import type { Test } from "~/src/convert/test/types";

interface HarInput {
  source: "har";
  target: "test" | "script";
  har: unknown;
}

function fromHar(_har: unknown): Result<Test, never, never> {
  throw new Error("Not implemented yet");
}

export { fromHar, type HarInput };
