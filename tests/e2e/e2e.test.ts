import { it } from "@jest/globals";
import { readdirSync } from "fs";
import { readFile } from "fs/promises";
import { join } from "path";
import { convert } from "~/src";
import { TestSchema } from "~/src/convert/test/schema";

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
      input: join(entry.path, entry.name, "input.ts"),
      output: join(entry.path, entry.name, "output.js"),
      name: `${path} - ${formatName(entry.name)}`,
    })),
  );
}

describe("test", () => {
  const directories = getTests([
    "test/scenarios",
    "test/http",
    "test/groups",
    "test/strings",
    "test/variables/general",
    "test/variables/raw",
    "test/variables/regex",
    "test/variables/scoping",
  ]);

  it.each(directories)("$name", async ({ input, output }) => {
    const [testModule, outputJS] = await Promise.all([
      import(input),
      readFile(output, "utf8"),
    ]);

    const test = await TestSchema.parse(testModule.test);

    if (!test.ok) {
      throw new Error(
        `File '${input}' does not export a valid test object:\n${test.errors
          .map((error) => error.message)
          .join("    \n")})}`,
      );
    }

    const result = await convert({
      source: "test",
      test: test.value,
      target: "script",
    });

    expect(result.unsafeUnwrap()).toEqual(outputJS);
  });
});
