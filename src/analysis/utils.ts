import type { AnalysisContext, AnalysisResult } from "~/src/analysis/analysis";
import { ok } from "~/src/context";

function reduceContext<T>(
  context: AnalysisContext,
  array: T[],
  callback: (
    context: AnalysisContext,
    item: T,
    index: number,
  ) => AnalysisResult,
): AnalysisResult {
  const first: AnalysisResult = ok(context);

  return array.reduce((result, item, index) => {
    return result.andThen((context) => callback(context, item, index));
  }, first);
}

export { reduceContext };
