import * as Avro from './SchemaBuilder.schema.types';
import SchemaBuilder from './SchemaBuilder';
import { SchemaBuilderProps } from './SchemaBuilder.types';
import { utils } from './SchemaBuilder.utils';
import {
  VALIDATION_SCHEMA_AVRO,
  VALIDATION_SCHEMA_AVRO_DOC_REQUIRED,
  VALIDATION_SCHEMA_JSON_AVRO,
} from './SchemaBuilder.constants';

const { getSchema } = utils;

export type { SchemaBuilderProps };
export {
  Avro,
  getSchema,
  SchemaBuilder,
  VALIDATION_SCHEMA_AVRO,
  VALIDATION_SCHEMA_AVRO_DOC_REQUIRED,
  VALIDATION_SCHEMA_JSON_AVRO,
};
