import * as es from "estree";
import { Printer, SupportOption } from "prettier";

declare module "estree" {
  type NewLine = "before" | "after" | "both" | "none";

  interface BaseNode {
    newLine?: NewLine;
  }
}

declare module "prettier/plugins/estree" {
  const printers: {
    estree: Printer<es.Node>;
  };

  const options: Record<string, SupportOption>;
}
