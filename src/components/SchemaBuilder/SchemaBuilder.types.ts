import * as Avro from './SchemaBuilder.schema.types';
import { FormikErrors, FormikProps } from 'formik/dist/types';

/**
 * Miscellaneous.
 */

export type ErrorsInfoNeed = {
  name?: boolean;
  namespace?: boolean;
};

export type InputList = {
  readonly className?: string;
  readonly disabled?: boolean;
  readonly label: string;
  readonly name: string;
}[];

export type InputLists = {
  readonly [key in TYPE_NAME_OBJECT]: InputList | undefined;
};

export type TypesDefaults = {
  readonly [key in TYPE_NAME_OBJECT]: Avro.Object;
};

export enum RECORD_FIELD_ORDER_ITEMS {
  none = '',
  ascending = 'ascending',
  descending = 'descending',
  ignore = 'ignore',
}

/**
 * Avro schema extensions.
 */

export type ObjectWithId = Avro.Object & { readonly id: string };

export type RecordFieldWithId = Avro.Record['fields'][number] & {
  readonly id: string;
};

/**
 * Type names.
 */

export enum TYPE_NAME_LOGICAL {
  date = 'date',
  decimal_bytes = 'decimal (bytes)',
  decimal_fixed = 'decimal (fixed)',
  duration = 'duration',
  local_timestamp_ms = 'local timestamp ms',
  local_timestamp_μs = 'local timestamp μs',
  time_ms = 'time ms',
  time_μs = 'time μs',
  timestamp_ms = 'timestamp ms',
  timestamp_μs = 'timestamp μs',
  uuid = 'uuid',
}

export type TYPE_NAME_OBJECT = Avro.COMPLEX | TYPE_NAME_LOGICAL;

export type TYPE_NAME = Avro.PRIMITIVE | TYPE_NAME_OBJECT;

/**
 * Props.
 */

export type ArrayOrMapProps = {
  readonly docRequired?: boolean;
  readonly errors: FormikErrors<Avro.Array | Avro.Map> | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly formik: FormikProps<any>;
  readonly idPath: string;
  readonly level?: number;
  readonly namePath: string;
  readonly values: Avro.Array | Avro.Map;
};

export type ErrorsInfoProps = {
  readonly errors: FormikErrors<Avro.Schema> | undefined;
};

export type RecordFieldsProps = {
  readonly docRequired: boolean;
  readonly errors: FormikErrors<Avro.Record['fields']> | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly formik: FormikProps<any>;
  readonly idPath: string;
  readonly level?: number;
  readonly namePath: string;
  readonly values: Avro.Record['fields'];
};

export type RecordProps = {
  readonly docRequired?: boolean;
  readonly errors: FormikErrors<Avro.Record> | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly formik: FormikProps<any>;
  readonly idPath: string;
  readonly level?: number;
  readonly namePath: string;
  readonly values: Avro.Record;
};

export type SchemaBuilderProps = {
  readonly docRequired?: boolean;
  readonly fixedRoot?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly formik: FormikProps<any>;
  readonly idPath?: string;
  readonly level?: number;
  readonly namePath: string;
  readonly namePathJSON?: string;
};

export type TypeProps = {
  readonly docRequired?: boolean;
  readonly errors: FormikErrors<Avro.Object> | undefined;
  readonly fixedRoot?: boolean;
  readonly formik: FormikProps<any>;
  readonly idPath: string;
  readonly level?: number;
  readonly namePath: string;
  readonly typeName?: string;
  readonly values: Avro.Object;
};

export type TypesProps = {
  readonly docRequired?: boolean;
  readonly errors: FormikErrors<Avro.Object[]> | undefined;
  readonly fixedRoot?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly formik: FormikProps<any>;
  readonly idPath: string;
  readonly level?: number;
  readonly namePath: string;
  readonly typeNames?: string[];
  readonly values: Avro.Object[];
};
