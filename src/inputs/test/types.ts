import {
  array,
  lazy,
  literal,
  number,
  object,
  record,
  string,
  union,
  type Infer,
  type Parser,
} from "src/validation";

const SleepStepSchema = object({
  type: literal("sleep"),
  duration: number(),
});

export type SleepStep = Infer<typeof SleepStepSchema>;

const LogStepSchema = object({
  type: literal("log"),
  message: string(),
});

export type LogStep = Infer<typeof LogStepSchema>;

export interface GroupStep {
  type: "group";
  name: string;
  steps: Step[];
}

const GroupStepSchema = object({
  type: literal("group"),
  name: string(),
  steps: lazy(() => array(StepSchema)),
});

export type Step = SleepStep | LogStep | GroupStep;

const StepSchema: Parser<Step> = union([
  SleepStepSchema,
  LogStepSchema,
  GroupStepSchema,
]);

const ScenarioSchema = object({
  name: string(),
  steps: array(StepSchema),
});

export type Scenario = Infer<typeof ScenarioSchema>;

const TestSchema = object({
  defaultScenario: ScenarioSchema.optional(),
  scenarios: record(ScenarioSchema),
});

export type Test = Infer<typeof TestSchema>;
