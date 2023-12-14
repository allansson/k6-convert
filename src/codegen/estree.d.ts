import * as es from "estree";
import { Printer, SupportOption } from "prettier";

declare module "estree" {
  interface BaseNode {
    newLine?: "before" | "after" | "both" | "none";
  }
}

declare module "prettier/plugins/estree" {
  const printers: {
    estree: Printer<es.Node>;
  };

  const options: Record<string, SupportOption>;
}
