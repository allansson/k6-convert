import { it } from "@jest/globals";
import { readdirSync } from "fs";
import { readFile } from "fs/promises";
import { join } from "path";
import { convert } from "~/src";

function formatName(name: string) {
  return name.replace(/-/g, " ");
}

function getTestDirectories(path: string) {
  return readdirSync(join(__dirname, path), {
    withFileTypes: true,
  }).filter((entry) => entry.isDirectory());
}

function getTests(paths: string[]) {
  return paths.flatMap((path) =>
    getTestDirectories(path).map((entry) => ({
      input: join(entry.path, entry.name, "input.json"),
      output: join(entry.path, entry.name, "output.js"),
      name: `${path} - ${formatName(entry.name)}`,
    }))
  );
}

describe("test", () => {
  const directories = getTests(["test/scenarios", "test/http"]);

  it.each(directories)("$name", async ({ input, output }) => {
    const [inputJSON, outputJS] = await Promise.all([
      readFile(input, "utf8"),
      readFile(output, "utf8"),
    ]);

    const result = await convert({
      source: "json-encoded-test",
      target: "script",
      content: inputJSON,
    });

    expect(result).toEqual(outputJS);
  });
});
