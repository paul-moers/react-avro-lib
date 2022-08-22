/**
 * Composed types.
 */

// eslint-disable-next-line @typescript-eslint/ban-types
export type Schema = Primitive | Object | Union;
export type ComplexNonRecursive = Enum | Fixed | PrimitiveObject;
export type ComplexRecursive = Array | Map | Record;
export type Complex = ComplexNonRecursive | ComplexRecursive;
export type Logical =
  | LogicalDate
  | LogicalDecimal
  | LogicalDuration
  | LogicalLocalTimestampMicros
  | LogicalLocalTimestampMillis
  | LogicalTimeMicros
  | LogicalTimeMillis
  | LogicalTimestampMicros
  | LogicalTimestampMillis
  | LogicalUUID;
export type Named = Enum | Fixed | Record;
export type Object = Complex | Logical;
export type Primitive =
  | 'boolean'
  | 'bytes'
  | 'double'
  | 'float'
  | 'int'
  | 'long'
  | 'null'
  | 'string';
// eslint-disable-next-line @typescript-eslint/ban-types
export type Union = (Primitive | Object)[];

/**
 * Complex types.
 */

export type Array = {
  items: Schema;
  type: 'array';
};

export type Enum = {
  aliases?: string[];
  default?: string;
  doc?: string;
  name: string;
  namespace?: string;
  symbols: string[];
  type: 'enum';
};

export type Fixed = {
  aliases?: string[];
  doc?: string;
  name: string;
  namespace?: string;
  size: number;
  type: 'fixed';
};

export type Map = {
  type: 'map';
  values: Schema;
};

export type PrimitiveObject = {
  type: Primitive;
};

export type Record = {
  aliases?: string[];
  doc?: string;
  fields: {
    default?: Array | boolean | null | number | object | string;
    doc?: string;
    name: string;
    order?: 'ascending' | 'descending' | 'ignore';
    type: Schema;
  }[];
  name: string;
  namespace?: string;
  type: 'record' | 'error';
};

/**
 * Logical types.
 */

export type LogicalDate = PrimitiveObject & {
  type: 'int';
  logicalType: 'date';
};

export type LogicalDecimal = (
  | Fixed
  | (PrimitiveObject & {
      type: 'bytes';
    })
) & { logicalType: 'decimal'; precision: number; scale?: number };

export type LogicalDuration = Fixed & {
  size: 12;
  logicalType: 'duration';
};

export type LogicalLocalTimestampMicros = PrimitiveObject & {
  type: 'long';
  logicalType: 'local-timestamp-micros';
};

export type LogicalLocalTimestampMillis = PrimitiveObject & {
  type: 'long';
  logicalType: 'local-timestamp-millis';
};

export type LogicalTimeMicros = PrimitiveObject & {
  type: 'long';
  logicalType: 'time-micros';
};

export type LogicalTimeMillis = PrimitiveObject & {
  type: 'int';
  logicalType: 'time-millis';
};

export type LogicalTimestampMicros = PrimitiveObject & {
  type: 'long';
  logicalType: 'timestamp-micros';
};

export type LogicalTimestampMillis = PrimitiveObject & {
  type: 'long';
  logicalType: 'timestamp-millis';
};

export type LogicalUUID = PrimitiveObject & {
  type: 'string';
  logicalType: 'uuid';
};

/**
 * Type lists.
 */

export enum COMPLEX {
  array = 'array',
  enum = 'enum',
  fixed = 'fixed',
  map = 'map',
  record = 'record',
}

export enum LOGICAL {
  'date' = 'date',
  'decimal' = 'decimal',
  'duration' = 'duration',
  'local-timestamp-micros' = 'local-timestamp-micros',
  'local-timestamp-millis' = 'local-timestamp-millis',
  'time-micros' = 'time-micros',
  'time-millis' = 'time-millis',
  'timestamp-micros' = 'timestamp-micros',
  'timestamp-millis' = 'timestamp-millis',
  'uuid' = 'uuid',
}

export enum PRIMITIVE {
  boolean = 'boolean',
  bytes = 'bytes',
  double = 'double',
  float = 'float',
  int = 'int',
  long = 'long',
  null = 'null',
  string = 'string',
}

export type TypeNamed = Extract<
  COMPLEX,
  COMPLEX.enum | COMPLEX.fixed | COMPLEX.record
>;

export const NAMED: Readonly<globalThis.Record<TypeNamed, TypeNamed>> = {
  [COMPLEX.enum]: COMPLEX.enum,
  [COMPLEX.fixed]: COMPLEX.fixed,
  [COMPLEX.record]: COMPLEX.record,
};

export type TYPE = PRIMITIVE | COMPLEX | LOGICAL;

/**
 * Type Guards.
 */

export function isArray(schema: Schema): schema is Array {
  return isObject(schema) && schema.type === COMPLEX.array;
}

export function isEnum(schema: Schema): schema is Enum {
  return isObject(schema) && schema.type === NAMED.enum;
}

export function isFixed(schema: Schema): schema is Fixed {
  return isObject(schema) && schema.type === NAMED.fixed;
}

// Loose check, no strict type combination check (type/logicalType).
export function isLogical(schema: Schema): schema is Logical {
  return (
    isObject(schema) &&
    'logicalType' in schema &&
    isTypeLogical(schema.logicalType as TYPE)
  );
}

export function isLogicalDecimalBytes(
  schema: Schema
): schema is LogicalDecimal {
  return (
    isLogical(schema) &&
    schema.logicalType === LOGICAL.decimal &&
    schema.type === PRIMITIVE.bytes
  );
}

export function isLogicalDecimalFixed(
  schema: Schema
): schema is LogicalDecimal {
  return (
    isLogical(schema) &&
    schema.logicalType === LOGICAL.decimal &&
    schema.type === NAMED.fixed
  );
}

export function isLogicalDuration(schema: Schema): schema is LogicalDuration {
  return isLogical(schema) && schema.logicalType === LOGICAL.duration;
}

export function isMap(schema: Schema): schema is Map {
  return isObject(schema) && schema.type === COMPLEX.map;
}

export function isNamed(schema: Schema): schema is Named {
  return isObject(schema) && isTypeNamed(schema.type as TYPE);
}

// Loose check, no strict type check (primitive/complex/logical).
// eslint-disable-next-line @typescript-eslint/ban-types
export function isObject(schema: Schema): schema is Object {
  return typeof schema === 'object' && 'type' in schema;
}

export function isPrimitiveObject(schema: Schema): schema is PrimitiveObject {
  return (
    isObject(schema) &&
    isTypePrimitive(schema.type as TYPE) &&
    !isLogical(schema)
  );
}

export function isRecord(schema: Schema): schema is Record {
  return isObject(schema) && schema.type === NAMED.record;
}

export function isUnion(schema: Schema): schema is Union {
  return Array.isArray(schema);
}

/**
 * Type Guards for the type/logicalType string value.
 */

export function isTypeComplex(type: TYPE): type is COMPLEX {
  return globalThis.Object.values(COMPLEX).includes(type as COMPLEX);
}

export function isTypeLogical(logicalType: TYPE): logicalType is LOGICAL {
  return globalThis.Object.values(LOGICAL).includes(logicalType as LOGICAL);
}

export function isTypeNamed(type: TYPE): type is TypeNamed {
  return globalThis.Object.values(NAMED).includes(type as TypeNamed);
}

export function isTypePrimitive(type: TYPE): type is PRIMITIVE {
  return globalThis.Object.values(PRIMITIVE).includes(type as PRIMITIVE);
}
