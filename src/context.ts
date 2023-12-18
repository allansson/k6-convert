class UnsafeUnwrapError<E> extends Error {
  error: E;

  constructor(error: E) {
    super(`Failed to unwrap result:\n    ${JSON.stringify(error)}`);

    this.error = error;
  }
}

interface ResultBase<Value, Issue, Error> {
  with<NewValue>(value: NewValue): Result<NewValue, Issue, Error>;

  map<NewValue>(fn: (value: Value) => NewValue): Result<NewValue, Issue, Error>;

  andThen<NewValue, NewIssue, NewError>(
    fn: (value: Value) => AsyncResult<NewValue, NewIssue, NewError>,
  ): AsyncResult<NewValue, Issue | NewIssue, Error | NewError>;
  andThen<NewValue, NewIssue, NewError>(
    fn: (value: Value) => Result<NewValue, NewIssue, NewError>,
  ): Result<NewValue, Issue | NewIssue, Error | NewError>;

  report<NewIssue>(issue: NewIssue): Result<Value, Issue | NewIssue, Error>;
  fail<NewError>(error: NewError): Result<Value, Issue, Error | NewError>;
  recover<NewValue>(
    fn: (error: Error) => NewValue,
  ): Result<Value | NewValue, Issue | Error, never>;

  unsafeUnwrap(): Value;
}

class OkResult<Value, Issue, Error = never>
  implements ResultBase<Value, Issue, Error>
{
  ok = true as const;

  value: Value;
  issues: Issue[];

  constructor(value: Value, issues: Issue[] = []) {
    this.value = value;
    this.issues = issues;
  }

  with<NewValue>(value: NewValue): Result<NewValue, Issue, Error> {
    return new OkResult(value, this.issues);
  }

  map<NewValue>(
    fn: (value: Value) => NewValue,
  ): Result<NewValue, Issue, Error> {
    return new OkResult(fn(this.value), this.issues);
  }

  andThen<NewValue, NewIssue, NewError>(
    fn: (value: Value) => AsyncResult<NewValue, NewIssue, NewError>,
  ): AsyncResult<NewValue, Issue | NewIssue, Error | NewError>;
  andThen<NewValue, NewIssue, NewError>(
    fn: (value: Value) => Result<NewValue, NewIssue, NewError>,
  ): Result<NewValue, Issue | NewIssue, Error | NewError>;
  andThen<NewValue, NewIssue, NewError>(
    fn:
      | ((value: Value) => Result<NewValue, NewIssue, NewError>)
      | ((value: Value) => AsyncResult<NewValue, NewIssue, NewError>),
  ):
    | Result<NewValue, Issue | NewIssue, Error | NewError>
    | AsyncResult<NewValue, Issue | NewIssue, Error | NewError> {
    const next = fn(this.value);

    if (next instanceof AsyncResult) {
      return new AsyncResult(
        next.value.then((result) => {
          if (result.ok) {
            return new OkResult(result.value, [
              ...this.issues,
              ...result.issues,
            ]);
          }

          return new ErrResult(result.error, [
            ...this.issues,
            ...result.issues,
          ]);
        }),
      );
    }

    if (!next.ok) {
      return new ErrResult(next.error, [...this.issues, ...next.issues]);
    }

    return new OkResult(next.value, [...this.issues, ...next.issues]);
  }

  report<NewIssue>(issue: NewIssue): Result<Value, Issue | NewIssue, Error> {
    return new OkResult(this.value, [...this.issues, issue]);
  }

  fail<NewError>(error: NewError): Result<Value, Issue, NewError | Error> {
    return new ErrResult(error, this.issues);
  }

  recover<NewValue>(
    _fn: (error: Error) => NewValue,
  ): Result<Value | NewValue, Issue | Error, never> {
    return new OkResult(this.value, this.issues);
  }

  unsafeUnwrap(): Value {
    return this.value;
  }
}

class ErrResult<Value, Issue, Error>
  implements ResultBase<Value, Issue, Error>
{
  ok = false as const;

  error: Error;
  issues: Issue[];

  constructor(error: Error, issues: Issue[] = []) {
    this.error = error;
    this.issues = issues;
  }

  with<NewValue>(_value: NewValue): Result<NewValue, Issue, Error> {
    return new ErrResult(this.error, this.issues);
  }

  map<NewValue>(
    _fn: (value: Value) => NewValue,
  ): Result<NewValue, Issue, Error> {
    return new ErrResult(this.error, this.issues);
  }

  andThen<NewValue, NewIssue, NewError>(
    fn: (value: Value) => AsyncResult<NewValue, NewIssue, NewError>,
  ): AsyncResult<NewValue, Issue | NewIssue, Error | NewError>;
  andThen<NewValue, NewIssue, NewError>(
    fn: (value: Value) => Result<NewValue, NewIssue, NewError>,
  ): Result<NewValue, Issue | NewIssue, Error | NewError>;
  andThen<NewValue, NewIssue, NewError>(
    _fn:
      | ((value: Value) => Result<NewValue, NewIssue, NewError>)
      | ((value: Value) => AsyncResult<NewValue, NewIssue, NewError>),
  ):
    | Result<NewValue, Issue | NewIssue, Error | NewError>
    | AsyncResult<NewValue, Issue | NewIssue, Error | NewError> {
    return new ErrResult(this.error, this.issues);
  }

  report<NewIssue>(issue: NewIssue): Result<Value, Issue | NewIssue, Error> {
    return new ErrResult(this.error, [...this.issues, issue]);
  }

  fail<NewError>(_error: NewError): Result<Value, Issue, Error | NewError> {
    return this;
  }

  recover<NewValue>(
    fn: (error: Error) => NewValue,
  ): Result<Value | NewValue, Issue | Error, never> {
    return new OkResult(fn(this.error), [...this.issues, this.error]);
  }

  unsafeUnwrap(): Value {
    throw new UnsafeUnwrapError(this.error);
  }
}

class AsyncResult<Value, Issue, Error>
  implements PromiseLike<Result<Value, Issue, Error>>
{
  value: Promise<Result<Value, Issue, Error>>;

  constructor(value: Promise<Result<Value, Issue, Error>>) {
    this.value = value;
  }

  with<NewValue>(value: NewValue): AsyncResult<NewValue, Issue, Error> {
    return new AsyncResult(Promise.resolve(ok(value)));
  }

  map<NewValue>(
    fn: (value: Value) => NewValue,
  ): AsyncResult<NewValue, Issue, Error> {
    return new AsyncResult(this.value.then((result) => result.map(fn)));
  }

  andThen<NewValue, NewIssue, NewError>(
    fn: (value: Value) => Result<NewValue, NewIssue, NewError>,
  ): AsyncResult<NewValue, Issue | NewIssue, Error | NewError> {
    return new AsyncResult(this.value.then((result) => result.andThen(fn)));
  }

  then<NewValue1, NewValue2>(
    onfulfilled?:
      | ((
          value: Result<Value, Issue, Error>,
        ) => NewValue1 | PromiseLike<NewValue1>)
      | undefined
      | null,
    onrejected?:
      | ((reason: unknown) => NewValue2 | PromiseLike<NewValue2>)
      | undefined
      | null,
  ): PromiseLike<NewValue1 | NewValue2> {
    return this.value.then(onfulfilled, onrejected);
  }

  report<NewIssue>(
    problem: NewIssue,
  ): AsyncResult<Value, Issue | NewIssue, Error> {
    return new AsyncResult(this.value.then((result) => result.report(problem)));
  }

  fail<NewError>(error: NewError): AsyncResult<Value, Issue, NewError | Error> {
    return new AsyncResult(this.value.then((result) => result.fail(error)));
  }

  recover<NewValue>(
    fn: (error: Error) => NewValue,
  ): AsyncResult<Value | NewValue, Issue | Error, never> {
    return new AsyncResult(this.value.then((result) => result.recover(fn)));
  }
}

type Result<Value, Issue, Error> =
  | OkResult<Value, Issue, Error>
  | ErrResult<Value, Issue, Error>;

function ok<Value>(value: Value): Result<Value, never, never> {
  return new OkResult(value);
}

function fail<Error>(error: Error): Result<never, never, Error> {
  return new ErrResult(error);
}

function flatten<Value, Issue, Error>(
  results: Array<Result<Value, Issue, Error>>,
): Result<Value[], Issue, Error> {
  const first: Result<Value[], Issue, Error> = ok([]);

  return results.reduce((result, next) => {
    return result.andThen((values) => next.map((next) => [...values, next]));
  }, first);
}

function map2<
  FirstValue,
  FirstIssue,
  FirstError,
  SecondValue,
  SecondIssue,
  SecondError,
  NewValue,
>(
  first: Result<FirstValue, FirstIssue, FirstError>,
  second: Result<SecondValue, SecondIssue, SecondError>,
  fn: (first: FirstValue, second: SecondValue) => NewValue,
): Result<NewValue, FirstIssue | SecondIssue, FirstError | SecondError> {
  return first.andThen((first) => second.map((second) => fn(first, second)));
}

function fromPromise<Value>(
  promise: Promise<Value>,
): AsyncResult<Value, never, never> {
  return new AsyncResult(promise.then(ok));
}

export {
  UnsafeUnwrapError,
  fail,
  flatten,
  fromPromise,
  map2,
  ok,
  type AsyncResult,
  type Result,
};
