interface Import {
  from: string;
  default?: string;
  named: Set<string>;
}

class EmitContext {
  imports: Record<string, Import> = {};

  importDefault(name: string, from: string): void {
    let imports = this.imports[from];

    if (imports === undefined) {
      imports = {
        from,
        default: name,
        named: new Set(),
      };

      this.imports[from] = imports;
    }

    if (imports.default !== undefined) {
      throw new Error(`Module "${from}" already has a default import.`);
    }

    imports.default = name;
  }

  import(name: string, from: string): void {
    let imports = this.imports[from];

    if (imports === undefined) {
      imports = {
        from,
        named: new Set(),
      };

      this.imports[from] = imports;
    }

    imports.named.add(name);
  }

  getImports() {
    return Object.values(this.imports);
  }
}

export { EmitContext, type Import };
