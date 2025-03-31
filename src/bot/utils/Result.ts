// utils/Result.ts
export class Result<T, E extends Error | null = null> {
  
  constructor(public value: T | null, public error: E | null) {}

  static success<T = void>(value?: T): Result<T, null> {
    return new Result<T, null>(value ?? null, null);
  }

  static failure<E extends Error>(error: E): Result<null, E> {
    return new Result<null, E>(null, error);
  }

  isSuccess(): boolean {
    return this.error === null;
  }

  isFailure(): boolean {
    return !this.isSuccess();
  }
}
