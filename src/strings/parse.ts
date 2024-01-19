function isVariablePrefix(value: string) {
  // Don't parse ${} as a variable
  if (value.length <= 3) {
    return false;
  }

  return value.startsWith("${");
}

interface ParsedString {
  strings: string[];
  variables: string[];
}

export function parse(input: string): ParsedString {
  const strings: string[] = [];
  const variables: string[] = [];

  let buffer: string[] = [];
  let current: string = "";

  for (let i = 0; i < input.length; i++) {
    const char = input[i];

    if (char === "$" && input[i + 1] === "{") {
      buffer.push(current);
      current = "${";

      // Skip the opening brace
      i += 1;

      continue;
    }

    if (char === "{") {
      buffer.push(current);

      current = "{";

      continue;
    }

    if (char === "}" && isVariablePrefix(current)) {
      strings.push(buffer.join(""));
      variables.push(current.slice(2));

      buffer = [];
      current = "";

      continue;
    }

    current += char;
  }

  buffer.push(current);

  strings.push(buffer.join(""));

  return {
    strings,
    variables,
  };
}
