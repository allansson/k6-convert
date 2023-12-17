import type { Result } from "~/src/context";
import type { Node } from "~/src/convert/test/types";

interface InvalidJsonBodyIssue {
  type: "InvalidJsonBody";
  content: string;
  node: Node;
}

type ConverterIssue = InvalidJsonBodyIssue;

type ConverterResult<Value> = Result<Value, ConverterIssue, never>;

class ConverterContext {}

export {
  ConverterContext,
  type ConverterIssue,
  type ConverterResult,
  type InvalidJsonBodyIssue,
};
