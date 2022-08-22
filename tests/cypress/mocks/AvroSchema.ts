import * as Avro from 'src/components/SchemaBuilder/SchemaBuilder.schema.types';

type KeysOfUnion<T> = T extends T ? keyof T : never;

type SchemaGroupChangeable<
  TypeName extends Avro.TYPE,
  Type extends Avro.Schema
> = {
  label: string;
  data: {
    invalid: {
      [key in TypeName]?: {
        [key in KeysOfUnion<Type>]?: {
          value: string | number;
          error: string;
        };
      }[];
    };
    valid: { [key in TypeName]?: Type };
  };
};

type SchemaGroupUnchangeable<
  TypeName extends Avro.TYPE,
  Type extends Avro.Schema
> = {
  label: string;
  schemas: {
    [key in TypeName]?: Type;
  };
};

type SchemasRecursive = {
  array: {
    typePath: string;
    schema: Avro.Array;
  };
  map: {
    typePath: string;
    schema: Avro.Map;
  };
  record: {
    typePath: string;
    schema: Avro.Record;
  };
};

// Changeable Schema groups, i.e. Complex and some Logical.
// With as data for each, the valid Schemas to initialise with, and one or more sets of invalid Schema values along with the error messages for those.
export const SCHEMA_GROUPS_CHANGEABLE: {
  complex: SchemaGroupChangeable<Avro.COMPLEX, Avro.Complex>;
  logical: SchemaGroupChangeable<Avro.LOGICAL, Avro.Logical>;
} = {
  complex: {
    label: 'Complex',
    data: {
      invalid: {
        array: [],
        enum: [
          {
            default: { value: 'c', error: 'Not a symbol' },
          },
          {
            doc: { value: '', error: 'Required' },
            name: { value: '', error: 'Required' },
            symbols: { value: '', error: 'Required' },
          },
          {
            name: { value: 'invalid name', error: 'Format*' },
            namespace: { value: 'invalid-namespace', error: 'Format*' },
          },
        ],
        record: [
          {
            doc: { value: '', error: 'Required' },
            name: { value: '', error: 'Required' },
          },
          {
            name: { value: 'invalid name', error: 'Format*' },
            namespace: { value: 'invalid-namespace', error: 'Format*' },
          },
        ],
      },
      valid: {
        array: {
          items: ['int'],
          type: 'array',
        },
        enum: {
          aliases: ['enum alias'],
          default: 'a',
          doc: 'enum doc',
          name: 'enum',
          namespace: 'test.enum',
          symbols: ['a', 'b'],
          type: 'enum',
        },
        record: {
          aliases: ['record alias'],
          doc: 'record doc',
          fields: [
            {
              default: 1,
              doc: 'field doc',
              name: 'field_name',
              type: 'int',
            },
          ],
          name: 'record',
          namespace: 'test.record',
          type: 'record',
        },
      },
    },
  },
  logical: {
    label: 'some Logical',
    data: {
      invalid: {
        date: [
          {
            precision: { value: 'no number', error: 'Number' },
            scale: { value: 'no number', error: 'Number' },
          },
          {
            precision: { value: '', error: 'Required' },
          },
        ],
        duration: [
          {
            doc: { value: '', error: 'Required' },
            name: { value: '', error: 'Required' },
          },
          {
            name: { value: 'invalid-name', error: 'Format*' },
            namespace: { value: 'invalid namespace', error: 'Format*' },
          },
        ],
      },
      valid: {
        date: {
          type: 'bytes',
          logicalType: 'decimal',
          precision: 1,
          scale: 2,
        },
        duration: {
          aliases: ['duration alias'],
          doc: 'duration doc',
          logicalType: 'duration',
          name: 'duration',
          namespace: 'test.duration',
          size: 12,
          type: 'fixed',
        },
      },
    },
  },
};

// Unchangeable Schema groups, i.e. Primitive and some Logical.
export const SCHEMA_GROUPS_UNCHANGEABLE: {
  primitive: SchemaGroupUnchangeable<
    Avro.PRIMITIVE,
    Avro.Primitive | Avro.PrimitiveObject
  >;
  logical: SchemaGroupUnchangeable<Avro.LOGICAL, Avro.Logical>;
} = {
  primitive: {
    label: 'Primitive',
    schemas: {
      int: { type: 'int' },
      boolean: 'boolean',
    },
  },
  logical: {
    label: 'some Complex',
    schemas: {
      date: { type: 'int', logicalType: 'date' },
      'local-timestamp-micros': {
        type: 'long',
        logicalType: 'local-timestamp-micros',
      },
    },
  },
};

export const SCHEMA_NESTED: Avro.Schema = {
  items: {
    values: {
      fields: [
        {
          name: 'int_field',
          type: 'boolean',
        },
      ],
      name: 'nested_record',
      type: 'record',
    },
    type: 'map',
  },
  type: 'array',
};

// Recursive Schemas, i.e. Array, Map and Record.
export const SCHEMAS_RECURSIVE: SchemasRecursive = {
  array: {
    typePath: 'items',
    schema: {
      items: [],
      type: 'array',
    },
  },
  map: {
    typePath: 'values',
    schema: { values: [], type: 'map' },
  },
  record: {
    typePath: 'fields-0-type',
    schema: {
      fields: [
        {
          name: 'field',
          type: [],
        },
      ],
      name: 'record',
      type: 'record',
    },
  },
};
