import { analyze } from "~/src/analysis";
import type { Analysis, AnalysisIssue } from "~/src/analysis/analysis";
import { join, map2, ok, type Result } from "~/src/context";
import type { ScenarioDeclaration, TestDefinition } from "~/src/convert/ast";
import { applyRewrites, type RewriteMap } from "~/src/processing/rewrite";

export function createTestRewriter(
  rewriter: (analysis: Analysis) => RewriteMap,
): (test: TestDefinition) => Result<TestDefinition, AnalysisIssue, never> {
  function rewriteScenario<S extends ScenarioDeclaration>(
    scenario: S,
  ): Result<S, AnalysisIssue, never> {
    return analyze(scenario.body)
      .map(rewriter)
      .map(applyRewrites(scenario.body))
      .map((newBody) => {
        return {
          ...scenario,
          body: newBody,
        };
      });
  }

  return (test) => {
    const scenarios = join(test.scenarios.map(rewriteScenario));

    const defaultScenario = test.defaultScenario
      ? rewriteScenario(test.defaultScenario)
      : ok(undefined);

    return map2(scenarios, defaultScenario, (scenarios, defaultScenario) => {
      return {
        ...test,
        defaultScenario,
        scenarios,
      };
    });
  };
}
