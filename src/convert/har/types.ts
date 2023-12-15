import { object, type Infer } from "~/src/validation";

const ArchiveSchema = object({
  log: object({
    entries: object({}),
  }),
});

type Archive = Infer<typeof ArchiveSchema>;

export { ArchiveSchema, type Archive };
