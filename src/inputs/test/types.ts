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
} from "~/src/validation";

const SleepStepSchema = object({
  type: literal("sleep"),
  duration: number(),
});

type SleepStep = Infer<typeof SleepStepSchema>;

const LogStepSchema = object({
  type: literal("log"),
  message: string(),
});

type LogStep = Infer<typeof LogStepSchema>;

interface GroupStep {
  type: "group";
  name: string;
  steps: Step[];
}

const GroupStepSchema = object({
  type: literal("group"),
  name: string(),
  steps: lazy(() => array(StepSchema)),
});

type Step = SleepStep | LogStep | GroupStep;

const StepSchema: Parser<Step> = union([
  SleepStepSchema,
  LogStepSchema,
  GroupStepSchema,
]);

const DefaultScenarioSchema = object({
  name: string().optional(),
  steps: array(StepSchema),
});

type DefaultScenario = Infer<typeof DefaultScenarioSchema>;

const ScenarioSchema = object({
  name: string(),
  steps: array(StepSchema),
});

type Scenario = Infer<typeof ScenarioSchema>;

const TestSchema = object({
  defaultScenario: DefaultScenarioSchema.optional(),
  scenarios: record(ScenarioSchema),
});

type Test = Infer<typeof TestSchema>;

export {
  type DefaultScenario,
  type GroupStep,
  type LogStep,
  type Scenario,
  type SleepStep,
  type Step,
  type Test,
};
