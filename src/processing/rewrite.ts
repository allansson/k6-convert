import type { ScopedStatement } from "~/src/analysis/analysis";
import type { Statement } from "~/src/convert/ast";

interface InsertBefore {
  type: "InsertBefore";
  statement: Statement;
}

interface InsertAfter {
  type: "InsertAfter";
  statement: Statement;
}

interface Replace {
  type: "Replace";
  statement: Statement;
}

interface Remove {
  type: "Remove";
}

type Rewrite = InsertBefore | InsertAfter | Replace | Remove;

class Rewriter {
  rewrites: RewriteMap = new Map();

  insertBefore(target: Statement, newNode: Statement): Rewriter {
    this.rewrites.set(target, {
      type: "InsertBefore",
      statement: newNode,
    });

    return this;
  }

  insertAfter(target: Statement, newNode: Statement): Rewriter {
    this.rewrites.set(target, {
      type: "InsertAfter",
      statement: newNode,
    });

    return this;
  }

  replace(target: Statement, newNode: Statement): Rewriter {
    this.rewrites.set(target, {
      type: "Replace",
      statement: newNode,
    });

    return this;
  }

  remove(target: Statement): Rewriter {
    this.rewrites.set(target, {
      type: "Remove",
    });

    return this;
  }

  done(): RewriteMap {
    return this.rewrites;
  }
}

type RewriteMap = Map<Statement, Rewrite>;

function rewrite(statement: Statement, rewrites: RewriteMap): Statement {
  switch (statement.type) {
    case "GroupStatement":
      return {
        ...statement,
        statements: statement.statements.flatMap((s) => {
          const op = rewrites.get(s);

          switch (op?.type) {
            case "InsertBefore":
              return [op.statement, rewrite(s, rewrites)];

            case "InsertAfter":
              return [rewrite(s, rewrites), op.statement];

            case "Replace":
              return [op.statement];

            case "Remove":
              return [];
          }

          return [rewrite(s, rewrites)];
        }),
      };

    case "Fragment":
      return {
        ...statement,
        statements: statement.statements.map((s) => rewrite(s, rewrites)),
      };

    case "ExpressionStatement":
    case "UserVariableDeclaration":
    case "AssignStatement":
    case "SleepStatement":
    case "LogStatement":
      return statement;
  }
}

function applyRewrites(
  statement: ScopedStatement,
): (rewrites: RewriteMap) => Statement {
  return (rewrites) => {
    return rewrite(statement, rewrites);
  };
}

export { Rewriter, applyRewrites, rewrite, type RewriteMap };
