import * as Avro from 'src/components/SchemaBuilder/SchemaBuilder.schema.types';

export const SCHEMA: Avro.Record = {
  aliases: ['record_1', 'root'],
  name: 'record_root',
  type: 'record',
  fields: [
    {
      name: 'field_1',
      type: 'int',
    },
    {
      name: 'field_2',
      type: [
        {
          items: [
            'int',
            {
              aliases: ['fixy'],
              name: 'fixed',
              size: 2,
              type: 'fixed',
            },
            {
              logicalType: 'date',
              type: 'int',
            },
          ],
          type: 'array',
        },
        {
          type: 'map',
          values: [
            'int',
            {
              name: 'enum_1',
              symbols: ['symbol 1', 'symbol 2'],
              type: 'enum',
            },
            {
              name: 'enum_2',
              symbols: ['symbol'],
              type: 'enum',
            },
            {
              logicalType: 'decimal',
              precision: 1,
              type: 'bytes',
            },
          ],
        },
        'null',
      ],
    },
    {
      name: 'field_3',
      type: [
        {
          items: 'int',
          type: 'array',
        },
        {
          type: 'map',
          values: 'int',
        },
      ],
    },
    {
      name: 'sub_record',
      type: {
        name: 'sub_record',
        type: 'record',
        fields: [
          {
            name: 'sub_field_1',
            type: 'int',
          },
        ],
      },
    },
  ],
};

export const SCHEMA_PREPARED = {
  aliases: 'record_1,root',
  doc: '',
  fields: [
    {
      default: '',
      doc: '',
      name: 'field_1',
      type: [
        {
          type: 'int',
          id: expect.any(String),
        },
      ],
      order: '',
      id: expect.any(String),
    },
    {
      default: '',
      doc: '',
      name: 'field_2',
      type: [
        {
          items: [
            {
              type: 'int',
              id: expect.any(String),
            },
            {
              aliases: 'fixy',
              doc: '',
              name: 'fixed',
              namespace: '',
              size: 2,
              type: 'fixed',
              id: expect.any(String),
            },
            {
              type: 'int',
              logicalType: 'date',
              id: expect.any(String),
            },
          ],
          type: 'array',
          id: expect.any(String),
        },
        {
          values: [
            {
              type: 'int',
              id: expect.any(String),
            },
            {
              aliases: '',
              default: '',
              doc: '',
              name: 'enum_1',
              namespace: '',
              symbols: 'symbol 1,symbol 2',
              type: 'enum',
              id: expect.any(String),
            },
            {
              aliases: '',
              default: '',
              doc: '',
              name: 'enum_2',
              namespace: '',
              symbols: 'symbol',
              type: 'enum',
              id: expect.any(String),
            },
            {
              logicalType: 'decimal',
              precision: 1,
              scale: '',
              type: 'bytes',
              id: expect.any(String),
            },
          ],
          type: 'map',
          id: expect.any(String),
        },
        {
          type: 'null',
          id: expect.any(String),
        },
      ],
      order: '',
      id: expect.any(String),
    },
    {
      default: '',
      doc: '',
      name: 'field_3',
      type: [
        {
          items: [
            {
              type: 'int',
              id: expect.any(String),
            },
          ],
          type: 'array',
          id: expect.any(String),
        },
        {
          values: [
            {
              type: 'int',
              id: expect.any(String),
            },
          ],
          type: 'map',
          id: expect.any(String),
        },
      ],
      order: '',
      id: expect.any(String),
    },
    {
      default: '',
      doc: '',
      id: expect.any(String),
      name: 'sub_record',
      order: '',
      type: [
        {
          aliases: '',
          doc: '',
          fields: [
            {
              default: '',
              doc: '',
              id: expect.any(String),
              name: 'sub_field_1',
              order: '',
              type: [
                {
                  id: expect.any(String),
                  type: 'int',
                },
              ],
            },
          ],
          id: expect.any(String),
          name: 'sub_record',
          namespace: '',
          type: 'record',
        },
      ],
    },
  ],
  name: 'record_root',
  namespace: '',
  type: 'record',
  id: expect.any(String),
};
