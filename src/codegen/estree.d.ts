import "estree";

declare module "estree" {
  interface BaseNode {
    newLine?: "before" | "after" | "both" | "none";
  }
}
