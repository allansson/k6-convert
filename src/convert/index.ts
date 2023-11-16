import { toIntermediateAST } from "~/src/convert/convert";
import { fromHAR } from "~/src/convert/har";
import type { Test } from "~/src/inputs/test/types";
import { exhaustive } from "~/src/utils";

interface TestFormat {
  type: "test";
  test: Test;
}

interface HARFormat {
  type: "har";
  har: unknown;
}

type InputFormat = TestFormat | HARFormat;

function convert(input: InputFormat) {
  switch (input.type) {
    case "test":
      return toIntermediateAST(input.test);

    case "har":
      return toIntermediateAST(fromHAR(input.har));

    default:
      return exhaustive(input);
  }
}

export { convert };
