import type { BlockStatement, Statement } from "~/src/convert/ast";
import { exhaustive } from "~/src/utils";

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

function rewriteStatements(
  statements: Statement[],
  rewrites: RewriteMap,
): Statement[] {
  return statements.flatMap((s) => {
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
  });
}

function rewrite(statement: Statement, rewrites: RewriteMap): Statement {
  switch (statement.type) {
    case "BlockStatement":
      return {
        ...statement,
        statements: rewriteStatements(statement.statements, rewrites),
      };

    case "GroupStatement":
      return {
        ...statement,
        body: {
          ...statement.body,
          statements: rewriteStatements(statement.body.statements, rewrites),
        },
      };

    case "Fragment":
      return {
        ...statement,
        statements: rewriteStatements(statement.statements, rewrites),
      };

    case "ExpressionStatement":
    case "UserVariableDeclaration":
    case "AssignStatement":
    case "SleepStatement":
    case "LogStatement":
      return statement;

    default:
      return exhaustive(statement);
  }
}

function applyRewrites(
  statement: BlockStatement,
): (rewrites: RewriteMap) => BlockStatement {
  return (rewrites) => {
    return {
      ...statement,
      statements: rewriteStatements(statement.statements, rewrites),
    };
  };
}

export { Rewriter, applyRewrites, rewrite, type RewriteMap };
