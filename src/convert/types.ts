interface InvalidJsonBodyIssue {
  type: "InvalidJsonBody";
  content: string;
  node: Node;
}

type ConverterIssue = InvalidJsonBodyIssue;

interface InvalidTestSchemaError {
  type: "InvalidTestSchemaError";
  content: string;
}

interface InvalidJsonError {
  type: "InvalidJson";
  content: string;
  error: unknown;
}

type JsonDecodeError = InvalidTestSchemaError | InvalidJsonError;

export type {
  ConverterIssue,
  InvalidJsonBodyIssue,
  InvalidJsonError,
  InvalidTestSchemaError,
  JsonDecodeError,
};
