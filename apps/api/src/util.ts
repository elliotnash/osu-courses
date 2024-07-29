import { TSchema } from 'elysia';
import { StaticDecode } from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';
import { TypeCompiler, TypeCheck } from '@sinclair/typebox/compiler';
import { randomInt, randomBytes } from 'node:crypto';
import { verificationCodeLength } from '~/consts';

const compilers = new Map<TSchema, TypeCheck<any>>();
export function compilerFor<T extends TSchema>(schema: T): TypeCheck<T> {
  const cached = compilers.get(schema);
  if (cached) {
    return cached as TypeCheck<T>;
  } else {
    const compiler = TypeCompiler.Compile(schema);
    compilers.set(schema, compiler);
    return compiler;
  }
}

export function parse<T extends TSchema, R = StaticDecode<T>>(
  schema: T,
  value: unknown
): R {
  const cloned = Value.Clone(value); // clone because value ops can be mutable
  const defaulted = Value.Default(schema, cloned); // initialize defaults for value
  const converted = Value.Convert(schema, defaulted); // convert mismatched types for value
  const cleaned = Value.Clean(schema, converted); // remove unknown properties
  return Value.Decode(schema, cleaned); // run decode transforms (optional)
}

export function createVerificationCode() {
  return randomInt(10 ** verificationCodeLength).toLocaleString('en-US', {
    minimumIntegerDigits: verificationCodeLength,
    useGrouping: false,
  });
}

export function createToken() {
  return randomBytes(48).toString('base64');
}
