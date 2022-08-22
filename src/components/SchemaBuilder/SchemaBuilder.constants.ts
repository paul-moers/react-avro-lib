import * as Avro from './SchemaBuilder.schema.types';
import * as yup from 'yup';
import { utils } from './SchemaBuilder.utils';
import {
  TYPE_NAME_LOGICAL,
  InputList,
  InputLists,
  TypesDefaults,
} from './SchemaBuilder.types';

/**
 * Miscellaneous.
 */

export const ID_PATH_ROOT = 'avro-schema-ui';

export const TYPE_NAME_LOGICAL_MAP: { [key: string]: TYPE_NAME_LOGICAL } = {
  'date:int': TYPE_NAME_LOGICAL.date,
  'decimal:bytes': TYPE_NAME_LOGICAL.decimal_bytes,
  'decimal:fixed': TYPE_NAME_LOGICAL.decimal_fixed,
  'duration:fixed': TYPE_NAME_LOGICAL.duration,
  'local-timestamp-micros:long': TYPE_NAME_LOGICAL.local_timestamp_μs,
  'local-timestamp-millis:long': TYPE_NAME_LOGICAL.local_timestamp_ms,
  'time-micros:long': TYPE_NAME_LOGICAL.time_μs,
  'time-millis:int': TYPE_NAME_LOGICAL.time_ms,
  'timestamp-micros:long': TYPE_NAME_LOGICAL.timestamp_μs,
  'timestamp-millis:long': TYPE_NAME_LOGICAL.timestamp_ms,
  'uuid:string': TYPE_NAME_LOGICAL.uuid,
};

export const TYPE_OPTIONS_ALL_STRINGS = [
  ...Object.values(Avro.PRIMITIVE),
  ...Object.values(Avro.COMPLEX),
  ...Object.values(TYPE_NAME_LOGICAL),
];

/**
 * Schema defaults.
 */

// Defaults for each of the Avro schemas, tailored for the inputs.
// Meaning that empty values are empty string instead of undefined, to have inputs initialised as controlled instead of uncontrolled.
// This can violate the type, those cases are ignored with @ts-ignore.
// Values that remain empty and are ok to be so are dropped on submit; for other values the input will return the correct type or are changed on submit.

export const DEFAULTS_RECORD_FIELD: Avro.Record['fields'][number] = {
  default: '',
  doc: '',
  name: '',
  type: [],
  // @ts-ignore -- Should be any of the allowed values or undefined.
  order: '',
};

const TYPE_DEFAULTS_DECIMAL_BYTES: Avro.LogicalDecimal = {
  logicalType: 'decimal',
  // @ts-ignore -- Should be a number.
  precision: '',
  // @ts-ignore -- Should be a number.
  scale: '',
  type: 'bytes',
};

const TYPE_DEFAULTS_FIXED: Avro.LogicalDecimal = {
  // @ts-ignore -- Should be an array, but simple csv input - is turned into array on submit.
  aliases: '',
  doc: '',
  name: '',
  namespace: '',
  // @ts-ignore -- Should be a number.
  size: '',
  type: 'fixed',
};

export const TYPES_DEFAULTS: TypesDefaults = {
  // Complex.
  [Avro.COMPLEX.array]: {
    items: [],
    type: 'array',
  },
  [Avro.COMPLEX.enum]: {
    // @ts-ignore -- Should be an array, but simple csv input.
    aliases: '',
    default: '',
    doc: '',
    name: '',
    namespace: '',
    // @ts-ignore -- Should be an array, but simple csv input.
    symbols: '',
    type: 'enum',
  },
  [Avro.COMPLEX.fixed]: TYPE_DEFAULTS_FIXED,
  [Avro.COMPLEX.map]: {
    values: [],
    type: 'map',
  },
  [Avro.COMPLEX.record]: {
    // @ts-ignore -- Should be an array, but simple csv input.
    aliases: '',
    doc: '',
    fields: [],
    name: '',
    namespace: '',
    type: 'record',
  },

  // Logical.
  [TYPE_NAME_LOGICAL.date]: {
    type: 'int',
    logicalType: 'date',
  },
  [TYPE_NAME_LOGICAL.decimal_bytes]: TYPE_DEFAULTS_DECIMAL_BYTES,
  [TYPE_NAME_LOGICAL.decimal_fixed]: {
    ...TYPE_DEFAULTS_FIXED,
    ...TYPE_DEFAULTS_DECIMAL_BYTES,
    type: 'fixed',
  } as Avro.LogicalDecimal,
  [TYPE_NAME_LOGICAL.duration]: {
    ...TYPE_DEFAULTS_FIXED,
    size: 12,
    logicalType: 'duration',
  },
  [TYPE_NAME_LOGICAL.local_timestamp_ms]: {
    type: 'long',
    logicalType: 'local-timestamp-millis',
  },
  [TYPE_NAME_LOGICAL.local_timestamp_μs]: {
    type: 'long',
    logicalType: 'local-timestamp-micros',
  },
  [TYPE_NAME_LOGICAL.time_ms]: {
    type: 'int',
    logicalType: 'time-millis',
  },
  [TYPE_NAME_LOGICAL.time_μs]: {
    type: 'long',
    logicalType: 'time-micros',
  },
  [TYPE_NAME_LOGICAL.timestamp_ms]: {
    type: 'long',
    logicalType: 'timestamp-millis',
  },
  [TYPE_NAME_LOGICAL.timestamp_μs]: {
    type: 'long',
    logicalType: 'timestamp-micros',
  },
  [TYPE_NAME_LOGICAL.uuid]: {
    type: 'string',
    logicalType: 'uuid',
  },
};

/**
 * Input lists.
 */

const INPUT_LIST_ARRAY: InputList = [{ name: 'items', label: 'Items*' }];

const INPUT_LIST_DECIMAL: InputList = [
  {
    name: 'precision',
    label: 'Precision*',
  },
  {
    name: 'scale',
    label: 'Scale',
  },
];

const INPUT_LIST_ENUM: InputList = [
  { name: 'name', label: 'Name*', className: 'input-name' },
  { name: 'doc', label: 'Doc', className: 'size-2' },
  { name: 'aliases', label: 'Aliases' },
  {
    name: 'namespace',
    label: 'Namespace',
  },
  {
    name: 'symbols',
    label: 'Symbols*',
    className: 'size-2',
  },
  {
    name: 'default',
    label: 'Default',
  },
];

const INPUT_LIST_ENUM_DOC_REQUIRED: InputList = [
  ...INPUT_LIST_ENUM.slice(0, 1),
  {
    ...INPUT_LIST_ENUM[1],
    label: 'Doc*',
  },
  ...INPUT_LIST_ENUM.slice(2),
];

const INPUT_LIST_FIXED: InputList = [
  { name: 'name', label: 'Name*', className: 'input-name' },
  { name: 'doc', label: 'Doc', className: 'size-2' },
  {
    name: 'size',
    label: 'Size*',
    className: 'size-05 input-size',
  },
  { name: 'aliases', label: 'Aliases' },
  {
    name: 'namespace',
    label: 'Namespace',
  },
];

const INPUT_LIST_FIXED_DOC_REQUIRED: InputList = [
  ...INPUT_LIST_FIXED.slice(0, 1),
  {
    ...INPUT_LIST_FIXED[1],
    label: 'Doc*',
  },
  ...INPUT_LIST_FIXED.slice(2),
];

// Duration annotates Fixed, with strictly size 12.
const INPUT_LIST_DURATION: InputList = [
  ...INPUT_LIST_FIXED.slice(0, 2),
  { ...INPUT_LIST_FIXED[2], disabled: true },
  ...INPUT_LIST_FIXED.slice(3),
];

const INPUT_LIST_DURATION_DOC_REQUIRED: InputList = [
  ...INPUT_LIST_FIXED_DOC_REQUIRED.slice(0, 2),
  { ...INPUT_LIST_FIXED_DOC_REQUIRED[2], disabled: true },
  ...INPUT_LIST_FIXED_DOC_REQUIRED.slice(3),
];

const INPUT_LIST_MAP: InputList = [{ name: 'values', label: 'Values*' }];

const INPUT_LIST_RECORD: InputList = [
  { name: 'name', label: 'Name*', className: 'input-name' },
  { name: 'aliases', label: 'Aliases' },
  {
    name: 'namespace',
    label: 'Namespace',
  },
  { name: 'doc', label: 'Doc', className: 'size-2' },
];

const INPUT_LIST_RECORD_DOC_REQUIRED: InputList = [
  ...INPUT_LIST_RECORD.slice(0, 3),
  {
    ...INPUT_LIST_RECORD[3],
    label: 'Doc*',
  },
];

export const INPUT_LISTS: InputLists = {
  // Complex.
  [Avro.COMPLEX.array]: INPUT_LIST_ARRAY,
  [Avro.COMPLEX.enum]: INPUT_LIST_ENUM,
  [Avro.COMPLEX.fixed]: INPUT_LIST_FIXED,
  [Avro.COMPLEX.map]: INPUT_LIST_MAP,
  [Avro.COMPLEX.record]: INPUT_LIST_RECORD,

  // Logical.
  [TYPE_NAME_LOGICAL.date]: undefined,
  [TYPE_NAME_LOGICAL.decimal_bytes]: INPUT_LIST_DECIMAL,
  [TYPE_NAME_LOGICAL.decimal_fixed]: [
    ...INPUT_LIST_FIXED,
    ...INPUT_LIST_DECIMAL,
  ],
  [TYPE_NAME_LOGICAL.duration]: INPUT_LIST_DURATION,
  [TYPE_NAME_LOGICAL.local_timestamp_ms]: undefined,
  [TYPE_NAME_LOGICAL.local_timestamp_μs]: undefined,
  [TYPE_NAME_LOGICAL.time_ms]: undefined,
  [TYPE_NAME_LOGICAL.time_μs]: undefined,
  [TYPE_NAME_LOGICAL.timestamp_ms]: undefined,
  [TYPE_NAME_LOGICAL.timestamp_μs]: undefined,
  [TYPE_NAME_LOGICAL.uuid]: undefined,
};

export const INPUT_LISTS_DOC_REQUIRED: InputLists = {
  ...INPUT_LISTS,
  [Avro.COMPLEX.enum]: INPUT_LIST_ENUM_DOC_REQUIRED,
  [Avro.COMPLEX.fixed]: INPUT_LIST_FIXED_DOC_REQUIRED,
  [Avro.COMPLEX.record]: INPUT_LIST_RECORD_DOC_REQUIRED,
  [TYPE_NAME_LOGICAL.decimal_fixed]: [
    ...INPUT_LIST_FIXED_DOC_REQUIRED,
    ...INPUT_LIST_DECIMAL,
  ],
  [TYPE_NAME_LOGICAL.duration]: INPUT_LIST_DURATION_DOC_REQUIRED,
};

export const INPUT_LIST_RECORD_FIELD: InputList = [
  { name: 'name', label: 'Name*', className: 'input-name' },
  {
    name: 'default',
    label: 'Default',
  },
  { name: 'doc', label: 'Doc', className: 'size-2' },
];

export const INPUT_LIST_RECORD_FIELD_DOC_REQUIRED: InputList = [
  ...INPUT_LIST_RECORD_FIELD.slice(0, 2),
  {
    ...INPUT_LIST_RECORD_FIELD[2],
    label: 'Doc*',
  },
];

/**
 * Validation.
 */

const REGEX_NAME_PART = '[A-Za-z_][A-Za-z0-9_]*';

const REGEX_NAME = new RegExp(`^${REGEX_NAME_PART}$`);

const REGEX_NAMESPACE = new RegExp(
  `^${REGEX_NAME_PART}(\\.${REGEX_NAME_PART})*$`
);

const VALIDATION_SCHEMA_ARRAY_REQUIRED = yup
  .array()
  .min(1, 'Required')
  .required('Required');

const VALIDATION_SCHEMA_STRING_REQUIRED = yup.string().required('Required');

const VALIDATION_SCHEMA_INTEGER_POSITIVE = yup
  .number()
  .typeError('Number')
  .positive('Positive')
  .integer('Integer');

const VALIDATION_SCHEMA_INTEGER_POSITIVE_REQUIRED =
  VALIDATION_SCHEMA_INTEGER_POSITIVE.required('Required');

const VALIDATION_SCHEMA_ENUM = {
  default: yup
    .string()
    .test('enum--is-default-of-symbols', 'Not a symbol', function (value) {
      let symbols: string[];
      if (value === undefined) return true;
      if (this.parent.symbols === undefined) return true;
      if (Array.isArray(this.parent.symbols)) {
        symbols = this.parent.symbols;
      } else {
        symbols = this.parent.symbols
          .split(',')
          .map((symbol: string) => symbol.trim());
      }
      return symbols.includes(value);
    }),
  name: VALIDATION_SCHEMA_STRING_REQUIRED.matches(REGEX_NAME, 'Format*'),
  namespace: yup.string().matches(REGEX_NAMESPACE, 'Format*'),
  // @ts-ignore
  symbols: yup.lazy((schema) => {
    if (typeof schema === 'string') return VALIDATION_SCHEMA_STRING_REQUIRED;
    return VALIDATION_SCHEMA_ARRAY_REQUIRED;
  }),
};

const VALIDATION_SCHEMA_ENUM_DOC_REQUIRED = {
  ...VALIDATION_SCHEMA_ENUM,
  doc: VALIDATION_SCHEMA_STRING_REQUIRED,
};

const VALIDATION_SCHEMA_SIZE = yup
  .number()
  .typeError('Number')
  .required('Required')
  .min(12, '12')
  .max(12, '12');

const VALIDATION_SCHEMA_FIXED = {
  name: VALIDATION_SCHEMA_STRING_REQUIRED.matches(REGEX_NAME, 'Format*'),
  namespace: yup.string().matches(REGEX_NAMESPACE, 'Format*'),
  size: VALIDATION_SCHEMA_INTEGER_POSITIVE_REQUIRED,
};

const VALIDATION_SCHEMA_FIXED_DOC_REQUIRED = {
  ...VALIDATION_SCHEMA_FIXED,
  doc: VALIDATION_SCHEMA_STRING_REQUIRED,
};

const VALIDATION_SCHEMA_LOGICAL_DECIMAL = {
  precision: VALIDATION_SCHEMA_INTEGER_POSITIVE_REQUIRED,
  scale: VALIDATION_SCHEMA_INTEGER_POSITIVE,
};

const VALIDATION_SCHEMA_UNION = VALIDATION_SCHEMA_ARRAY_REQUIRED.of(
  yup.lazy((schema) => getObjectValidationSchema(schema, false))
);

const VALIDATION_SCHEMA_UNION_DOC_REQUIRED =
  VALIDATION_SCHEMA_ARRAY_REQUIRED.of(
    yup.lazy((schema) => getObjectValidationSchema(schema, true))
  );

const VALIDATION_SCHEMA_RECORD = {
  fields: VALIDATION_SCHEMA_ARRAY_REQUIRED.of(
    yup.lazy(() => {
      return yup.object({
        name: VALIDATION_SCHEMA_STRING_REQUIRED.matches(REGEX_NAME, 'Format*'),
        type: VALIDATION_SCHEMA_AVRO,
      });
    })
  ),
  name: VALIDATION_SCHEMA_STRING_REQUIRED.matches(REGEX_NAME, 'Format*'),
  namespace: yup.string().matches(REGEX_NAMESPACE, 'Format*'),
};

const VALIDATION_SCHEMA_RECORD_DOC_REQUIRED = {
  doc: VALIDATION_SCHEMA_STRING_REQUIRED,
  fields: VALIDATION_SCHEMA_ARRAY_REQUIRED.of(
    yup.lazy(() => {
      return yup.object({
        doc: VALIDATION_SCHEMA_STRING_REQUIRED,
        name: VALIDATION_SCHEMA_STRING_REQUIRED.matches(REGEX_NAME, 'Format*'),
        type: VALIDATION_SCHEMA_AVRO_DOC_REQUIRED,
      });
    })
  ),
  name: VALIDATION_SCHEMA_STRING_REQUIRED.matches(REGEX_NAME, 'Format*'),
  namespace: yup.string().matches(REGEX_NAMESPACE, 'Format*'),
};

export const VALIDATION_SCHEMA_AVRO = yup.lazy((schema) => {
  if (Avro.isUnion(schema)) return VALIDATION_SCHEMA_UNION;
  else return getObjectValidationSchema(schema, false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}) as any;

export const VALIDATION_SCHEMA_AVRO_DOC_REQUIRED = yup.lazy((schema) => {
  if (Avro.isUnion(schema)) return VALIDATION_SCHEMA_UNION_DOC_REQUIRED;
  else return getObjectValidationSchema(schema, true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}) as any;

export const VALIDATION_SCHEMA_JSON_AVRO = yup
  .string()
  .trim()
  .required('Please enter an Avro schema.')
  .test('is-json-structure', 'Please enter valid JSON.', (value) => {
    return utils.isJsonStructure(value);
  })
  .test('is-avro-schema', 'Please enter an Avro schema structure.', (value) => {
    return (
      utils.isJsonStructure(value) && utils.isAvroStructure(JSON.parse(value))
    );
  });

/**
 * helper functions.
 */

const getObjectValidationSchema = (
  schema: Avro.Object,
  isDocRequired: boolean
): yup.ObjectSchema<object> | yup.MixedSchema => {
  // Logical.
  // (Logical before Complex, otherwise they would be evaluated as plain Complex instead of the annotated version.)
  if (Avro.isLogicalDecimalBytes(schema)) {
    return yup.object(VALIDATION_SCHEMA_LOGICAL_DECIMAL);
  }
  if (Avro.isLogicalDecimalFixed(schema)) {
    return yup.object({
      ...(isDocRequired
        ? VALIDATION_SCHEMA_FIXED_DOC_REQUIRED
        : VALIDATION_SCHEMA_FIXED),
      ...VALIDATION_SCHEMA_LOGICAL_DECIMAL,
    });
  }
  if (Avro.isLogicalDuration(schema)) {
    return yup.object({
      ...(isDocRequired
        ? VALIDATION_SCHEMA_FIXED_DOC_REQUIRED
        : VALIDATION_SCHEMA_FIXED),
      size: VALIDATION_SCHEMA_SIZE,
    });
  }

  // Complex.
  if (Avro.isArray(schema)) {
    return yup.object({
      items: isDocRequired
        ? VALIDATION_SCHEMA_AVRO_DOC_REQUIRED
        : VALIDATION_SCHEMA_AVRO,
    });
  }
  if (Avro.isEnum(schema)) {
    return yup.object(
      isDocRequired
        ? VALIDATION_SCHEMA_ENUM_DOC_REQUIRED
        : VALIDATION_SCHEMA_ENUM
    );
  }
  if (Avro.isFixed(schema)) {
    return yup.object(
      isDocRequired
        ? VALIDATION_SCHEMA_FIXED_DOC_REQUIRED
        : VALIDATION_SCHEMA_FIXED
    );
  }
  if (Avro.isMap(schema)) {
    return yup.object({
      values: isDocRequired
        ? VALIDATION_SCHEMA_AVRO_DOC_REQUIRED
        : VALIDATION_SCHEMA_AVRO,
    });
  }
  if (Avro.isRecord(schema)) {
    return yup.object(
      isDocRequired
        ? VALIDATION_SCHEMA_RECORD_DOC_REQUIRED
        : VALIDATION_SCHEMA_RECORD
    );
  }
  return yup.mixed();
};
