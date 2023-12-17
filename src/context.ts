class UnsafeUnwrapError<E> extends Error {
  error: E;

  constructor(error: E) {
    super(`Failed to unwrap result:\n    ${JSON.stringify(error)}`);

    this.error = error;
  }
}

interface ResultBase<Value, Problem, Error> {
  with<NewValue>(value: NewValue): Result<NewValue, Problem, Error>;

  map<NewValue>(
    fn: (value: Value) => NewValue,
  ): Result<NewValue, Problem, Error>;

  andThen<NewValue, NewProblem, NewError>(
    fn: (value: Value) => AsyncResult<NewValue, NewProblem, NewError>,
  ): AsyncResult<NewValue, Problem | NewProblem, Error | NewError>;
  andThen<NewValue, NewProblem, NewError>(
    fn: (value: Value) => Result<NewValue, NewProblem, NewError>,
  ): Result<NewValue, Problem | NewProblem, Error | NewError>;

  report<NewProblem>(
    problem: NewProblem,
  ): Result<Value, Problem | NewProblem, Error>;
  fail<NewError>(error: NewError): Result<Value, Problem, Error | NewError>;
  recover<NewValue>(
    fn: (error: Error) => NewValue,
  ): Result<Value | NewValue, Problem | Error, never>;

  unsafeUnwrap(): Value;
}

class OkResult<Value, Problem, Error = never>
  implements ResultBase<Value, Problem, Error>
{
  ok = true as const;

  value: Value;
  issues: Problem[];

  constructor(value: Value, problems: Problem[] = []) {
    this.value = value;
    this.issues = problems;
  }

  with<NewValue>(value: NewValue): Result<NewValue, Problem, Error> {
    return new OkResult(value, this.issues);
  }

  map<NewValue>(
    fn: (value: Value) => NewValue,
  ): Result<NewValue, Problem, Error> {
    return new OkResult(fn(this.value), this.issues);
  }

  andThen<NewValue, NewProblem, NewError>(
    fn: (value: Value) => AsyncResult<NewValue, NewProblem, NewError>,
  ): AsyncResult<NewValue, Problem | NewProblem, Error | NewError>;
  andThen<NewValue, NewProblem, NewError>(
    fn: (value: Value) => Result<NewValue, NewProblem, NewError>,
  ): Result<NewValue, Problem | NewProblem, Error | NewError>;
  andThen<NewValue, NewProblem, NewError>(
    fn:
      | ((value: Value) => Result<NewValue, NewProblem, NewError>)
      | ((value: Value) => AsyncResult<NewValue, NewProblem, NewError>),
  ):
    | Result<NewValue, Problem | NewProblem, Error | NewError>
    | AsyncResult<NewValue, Problem | NewProblem, Error | NewError> {
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

  report<NewProblem>(
    problem: NewProblem,
  ): Result<Value, Problem | NewProblem, Error> {
    return new OkResult(this.value, [...this.issues, problem]);
  }

  fail<NewError>(error: NewError): Result<Value, Problem, NewError | Error> {
    return new ErrResult(error, this.issues);
  }

  recover<NewValue>(
    _fn: (error: Error) => NewValue,
  ): Result<Value | NewValue, Problem | Error, never> {
    return new OkResult(this.value, this.issues);
  }

  unsafeUnwrap(): Value {
    return this.value;
  }
}

class ErrResult<Value, Problem, Error>
  implements ResultBase<Value, Problem, Error>
{
  ok = false as const;

  error: Error;
  issues: Problem[];

  constructor(error: Error, problems: Problem[] = []) {
    this.error = error;
    this.issues = problems;
  }

  with<NewValue>(_value: NewValue): Result<NewValue, Problem, Error> {
    return new ErrResult(this.error, this.issues);
  }

  map<NewValue>(
    _fn: (value: Value) => NewValue,
  ): Result<NewValue, Problem, Error> {
    return new ErrResult(this.error, this.issues);
  }

  andThen<NewValue, NewProblem, NewError>(
    fn: (value: Value) => AsyncResult<NewValue, NewProblem, NewError>,
  ): AsyncResult<NewValue, Problem | NewProblem, Error | NewError>;
  andThen<NewValue, NewProblem, NewError>(
    fn: (value: Value) => Result<NewValue, NewProblem, NewError>,
  ): Result<NewValue, Problem | NewProblem, Error | NewError>;
  andThen<NewValue, NewProblem, NewError>(
    _fn:
      | ((value: Value) => Result<NewValue, NewProblem, NewError>)
      | ((value: Value) => AsyncResult<NewValue, NewProblem, NewError>),
  ):
    | Result<NewValue, Problem | NewProblem, Error | NewError>
    | AsyncResult<NewValue, Problem | NewProblem, Error | NewError> {
    return new ErrResult(this.error, this.issues);
  }

  report<NewProblem>(
    problem: NewProblem,
  ): Result<Value, Problem | NewProblem, Error> {
    return new ErrResult(this.error, [...this.issues, problem]);
  }

  fail<NewError>(_error: NewError): Result<Value, Problem, Error | NewError> {
    return this;
  }

  recover<NewValue>(
    fn: (error: Error) => NewValue,
  ): Result<Value | NewValue, Problem | Error, never> {
    return new OkResult(fn(this.error), [...this.issues, this.error]);
  }

  unsafeUnwrap(): Value {
    throw new UnsafeUnwrapError(this.error);
  }
}

class AsyncResult<Value, Problem, Error>
  implements PromiseLike<Result<Value, Problem, Error>>
{
  value: Promise<Result<Value, Problem, Error>>;

  constructor(value: Promise<Result<Value, Problem, Error>>) {
    this.value = value;
  }

  with<NewValue>(value: NewValue): AsyncResult<NewValue, Problem, Error> {
    return new AsyncResult(Promise.resolve(ok(value)));
  }

  map<NewValue>(
    fn: (value: Value) => NewValue,
  ): AsyncResult<NewValue, Problem, Error> {
    return new AsyncResult(this.value.then((result) => result.map(fn)));
  }

  andThen<NewValue, NewProblem, NewError>(
    fn: (value: Value) => Result<NewValue, NewProblem, NewError>,
  ): AsyncResult<NewValue, Problem | NewProblem, Error | NewError> {
    return new AsyncResult(this.value.then((result) => result.andThen(fn)));
  }

  then<NewValue1, NewValue2>(
    onfulfilled?:
      | ((
          value: Result<Value, Problem, Error>,
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

  report<NewProblem>(
    problem: NewProblem,
  ): AsyncResult<Value, Problem | NewProblem, Error> {
    return new AsyncResult(this.value.then((result) => result.report(problem)));
  }

  fail<NewError>(
    error: NewError,
  ): AsyncResult<Value, Problem, NewError | Error> {
    return new AsyncResult(this.value.then((result) => result.fail(error)));
  }

  recover<NewValue>(
    fn: (error: Error) => NewValue,
  ): AsyncResult<Value | NewValue, Problem | Error, never> {
    return new AsyncResult(this.value.then((result) => result.recover(fn)));
  }
}

type Result<Value, Problem, Error> =
  | OkResult<Value, Problem, Error>
  | ErrResult<Value, Problem, Error>;

function ok<Value>(value: Value): Result<Value, never, never> {
  return new OkResult(value);
}

function fail<Error>(error: Error): Result<never, never, Error> {
  return new ErrResult(error);
}

function flatten<Value, Problem, Error>(
  results: Array<Result<Value, Problem, Error>>,
): Result<Value[], Problem, Error> {
  const first: Result<Value[], Problem, Error> = ok([]);

  return results.reduce((result, next) => {
    return result.andThen((values) => next.map((next) => [...values, next]));
  }, first);
}

function map2<
  FirstValue,
  FirstProblem,
  FirstError,
  SecondValue,
  SecondProblem,
  SecondError,
  NewValue,
>(
  first: Result<FirstValue, FirstProblem, FirstError>,
  second: Result<SecondValue, SecondProblem, SecondError>,
  fn: (first: FirstValue, second: SecondValue) => NewValue,
): Result<NewValue, FirstProblem | SecondProblem, FirstError | SecondError> {
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
