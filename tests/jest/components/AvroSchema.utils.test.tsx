/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-assertion */

import * as Avro from 'src/components/SchemaBuilder/SchemaBuilder.schema.types';
import { FormikErrors, FormikProps } from 'formik';
import { SCHEMA, SCHEMA_PREPARED } from 'tests/jest/mocks/AvroSchema';
import { testUtils as tu } from 'tests/utils/AvroSchema.utils';
import { TYPE_NAME_LOGICAL } from 'src/components/SchemaBuilder/SchemaBuilder.types';
import { utils } from 'src/components/SchemaBuilder/SchemaBuilder.utils';
import {
  INPUT_LISTS,
  INPUT_LISTS_DOC_REQUIRED,
  TYPES_DEFAULTS,
} from 'src/components/SchemaBuilder/SchemaBuilder.constants';

describe('SchemaBuilder.utils', () => {
  it('addField should add new field to a Record', () => {
    const record: Avro.Record = tu.copyJSON(SCHEMA) as Avro.Record;
    expect(record.fields).toHaveLength(4);
    record.fields = utils.addField(record.fields);
    expect(record.fields).toHaveLength(5);
  });

  it('getId should generate random ids', () => {
    const ids = Array(100)
      .fill('')
      .map(() => utils.generateId());

    expect(new Set(ids).size).toBe(ids.length);
  });

  it('cleanSchema should clean schemas from data added for internal use', () => {
    // Default enum symbols to empty array.
    const enumWithoutSymbols = { type: 'enum', name: 'enum' };
    expect(
      utils.cleanSchema({
        ...TYPES_DEFAULTS[Avro.COMPLEX.enum],
        ...enumWithoutSymbols,
      } as Avro.Enum)
    ).toEqual({
      ...enumWithoutSymbols,
      symbols: [],
    });

    // Record.
    expect(utils.cleanSchema(SCHEMA_PREPARED as Avro.Schema)).toEqual(SCHEMA);

    // Union.
    expect(
      utils.cleanSchema(SCHEMA_PREPARED.fields[1].type as Avro.Object[])
    ).toEqual((SCHEMA as Avro.Record).fields[1].type);
    expect(utils.cleanSchema([])).toEqual([]);
  });

  it('getErrorsInfoNeed should check if errors need additional info', () => {
    expect(utils.getErrorsInfoNeed(undefined)).toBeUndefined();

    expect(
      utils.getErrorsInfoNeed({
        name: 'Required',
      } as FormikErrors<any>)
    ).toBeUndefined();

    expect(
      utils.getErrorsInfoNeed({
        name: 'Format*',
      } as FormikErrors<any>)
    ).toEqual({ name: true });

    expect(
      utils.getErrorsInfoNeed({
        namespace: 'Format*',
      } as FormikErrors<any>)
    ).toEqual({ namespace: true });

    expect(
      utils.getErrorsInfoNeed({
        fields: [
          null,
          {
            type: [
              {
                items: [
                  null,
                  {
                    namespace: 'Format*',
                  },
                ],
              },
            ],
          },
        ],
        name: 'Format*',
      } as FormikErrors<any>)
    ).toEqual({ name: true, namespace: true });
  });

  it('getInputList should get the list of input fields details for an Avro Type', () => {
    expect(utils.getInputList(Avro.PRIMITIVE.boolean, false)).toBeUndefined();
    expect(utils.getInputList(Avro.PRIMITIVE.boolean, true)).toBeUndefined();

    expect(utils.getInputList(Avro.COMPLEX.array, false)).toBe(
      INPUT_LISTS[Avro.COMPLEX.array]
    );
    expect(utils.getInputList(Avro.COMPLEX.array, true)).toBe(
      INPUT_LISTS[Avro.COMPLEX.array]
    );

    expect(utils.getInputList(Avro.COMPLEX.fixed, false)).toBe(
      INPUT_LISTS[Avro.COMPLEX.fixed]
    );
    expect(utils.getInputList(Avro.COMPLEX.fixed, true)).toBe(
      INPUT_LISTS_DOC_REQUIRED[Avro.COMPLEX.fixed]
    );

    expect(utils.getInputList(TYPE_NAME_LOGICAL.date, false)).toBe(
      INPUT_LISTS[TYPE_NAME_LOGICAL.date]
    );
    expect(utils.getInputList(TYPE_NAME_LOGICAL.date, true)).toBe(
      INPUT_LISTS[TYPE_NAME_LOGICAL.date]
    );

    expect(utils.getInputList(TYPE_NAME_LOGICAL.decimal_bytes, false)).toBe(
      INPUT_LISTS[TYPE_NAME_LOGICAL.decimal_bytes]
    );
    expect(utils.getInputList(TYPE_NAME_LOGICAL.decimal_bytes, true)).toBe(
      INPUT_LISTS[TYPE_NAME_LOGICAL.decimal_bytes]
    );
  });

  it('getSchema should get the Schema value or false if invalid', () => {
    const schemaPreparedCopy = tu.copyJSON(SCHEMA_PREPARED);
    const formik = {
      values: {
        schema: schemaPreparedCopy,
      },
    } as FormikProps<any>;

    expect(utils.getSchema(formik, 'schema')).toEqual(SCHEMA);
    expect(utils.getSchema(formik, 'schema', true)).toBe(false);

    formik.values.schema.fields[0].name = 'invalid-name';
    expect(utils.getSchema(formik, 'schema')).toBe(false);
  });

  it('getTypeObjects should get the type/Schema objects (existing Schema values or defaults) corresponding to type strings', () => {
    let objects: Avro.Object[] | undefined = [];
    let objectsNew: Avro.Object[] = [];
    let strings: (Avro.TYPE | string)[];
    let stringsOld: (Avro.TYPE | string)[];

    // Int.
    objects = undefined;
    strings = ['int'];
    stringsOld = [];
    objectsNew = utils.getTypeObjects(
      strings,
      objects,
      stringsOld
    ) as Avro.Object[];
    expect(objectsNew).toEqual([
      { type: Avro.PRIMITIVE.int, id: expect.any(String) },
    ]);

    // Adding Fixed.
    objects = objectsNew;
    strings = ['int', 'fixed +'];
    stringsOld = ['int'];
    objectsNew = utils.getTypeObjects(
      strings,
      objects,
      stringsOld
    ) as Avro.Object[];
    expect(objectsNew).toEqual([
      ...objects,
      {
        ...TYPES_DEFAULTS[Avro.COMPLEX.fixed],
        id: expect.any(String),
      },
    ]);

    // Adding Enum.
    objects = objectsNew;
    strings = ['int', 'fixed', 'enum +'];
    stringsOld = ['int', 'fixed'];
    objectsNew = utils.getTypeObjects(
      strings,
      objects,
      stringsOld
    ) as Avro.Object[];

    // With Enum before Fixed.
    expect(objectsNew).toEqual([
      ...objects.slice(0, 1),
      {
        ...TYPES_DEFAULTS[Avro.COMPLEX.enum],
        id: expect.any(String),
      },
      ...objects.slice(1),
    ]);

    // Adding Float.
    objects = objectsNew;
    strings = ['int', 'enum', 'fixed', 'float'];
    stringsOld = ['int', 'enum', 'fixed'];
    objectsNew = utils.getTypeObjects(
      strings,
      objects,
      stringsOld
    ) as Avro.Object[];
    // With Float first.
    expect(objectsNew).toEqual([
      { type: Avro.PRIMITIVE.float, id: expect.any(String) },
      ...objects,
    ]);

    // Adding Duration.
    objects = objectsNew;
    strings = ['float', 'int', 'enum', 'fixed', 'duration'];
    stringsOld = ['float', 'int', 'enum', 'fixed'];
    objectsNew = utils.getTypeObjects(
      strings,
      objects,
      stringsOld
    ) as Avro.Object[];
    expect(objectsNew).toEqual([
      ...objects,
      {
        ...TYPES_DEFAULTS[TYPE_NAME_LOGICAL.duration],
        id: expect.any(String),
      },
    ]);

    // Removing Int.
    objects = objectsNew;
    strings = ['float', 'enum', 'fixed', 'duration'];
    stringsOld = ['float', 'int', 'enum', 'fixed', 'duration'];
    objectsNew = utils.getTypeObjects(
      strings,
      objects,
      stringsOld
    ) as Avro.Object[];
    expect(objectsNew).toEqual([objects[0], ...objects.slice(2)]);

    // Removing Fixed.
    objects = objectsNew;
    strings = ['float', 'enum', 'duration'];
    stringsOld = ['float', 'enum', 'fixed', 'duration'];
    objectsNew = utils.getTypeObjects(
      strings,
      objects,
      stringsOld
    ) as Avro.Object[];
    expect(objectsNew).toEqual([...objects.slice(0, 2), ...objects.slice(3)]);
  });

  it('isAvroStructure should check whether value is an Avro structure (has valid Avro nesting and all types are valid Avro types)', () => {
    const schemaCopy = tu.copyJSON(SCHEMA) as Avro.Record;
    const schemaPreparedCopy = tu.copyJSON(SCHEMA_PREPARED) as Avro.Record;

    expect(utils.isAvroStructure(schemaCopy)).toBe(true);
    expect(utils.isAvroStructure(schemaPreparedCopy)).toBe(true);

    // @ts-ignore
    schemaCopy.fields[0].type = 'integer';
    // @ts-ignore
    schemaPreparedCopy.fields[0].type = 'integer';
    expect(utils.isAvroStructure(schemaCopy)).toBe(false);
    expect(utils.isAvroStructure(schemaPreparedCopy)).toBe(false);

    expect(utils.isAvroStructure({ type: [] })).toBe(true);
    expect(utils.isAvroStructure({ type: ['int', { type: 'long' }] })).toBe(
      true
    );
  });

  it('getTypeString should get the string corresponding to the Schema type, possibly appended with numbering for named types', () => {
    const schemas: { [key: string]: Avro.Object } = {
      enum: {
        name: 'test enum',
        symbols: ['symbol 1', 'symbol 2'],
        type: 'enum',
      },
      int: { type: 'int' },
    };
    expect(utils.getTypeName(schemas.int)).toBe(schemas.int.type);
    expect(utils.getTypeName(schemas.enum)).toBe(schemas.enum.type);
    expect(utils.getTypeName(schemas.enum, 2)).toBe(`${schemas.enum.type} 2`);
  });

  it('getTypeStrings should get the strings corresponding to the Schema objects, each possibly appended with numbering for named union', () => {
    expect(utils.getTypeNames([])).toStrictEqual([]);

    const schemas: Avro.Object[] = [
      { type: 'int' },
      {
        logicalType: 'duration',
        name: 'duration',
        size: 12,
        type: 'fixed',
      },
      {
        name: 'test enum',
        symbols: ['symbol 1', 'symbol 2'],
        type: 'enum',
      },
    ];
    expect(utils.getTypeNames(schemas)).toStrictEqual([
      'int',
      'duration',
      'enum',
    ]);

    schemas.push(
      {
        name: 'test enum 2',
        symbols: [],
        type: 'enum',
      },
      { name: 'test fixed 1', size: 1, type: 'fixed' },
      { name: 'test fixed 2', size: 1, type: 'fixed' },
      { fields: [], name: 'test record 1', size: 1, type: 'record' },
      { fields: [], name: 'test record 1', size: 1, type: 'record' }
    );
    expect(utils.getTypeNames(schemas)).toStrictEqual([
      'int',
      'duration',
      'enum 1',
      'enum 2',
      'fixed 1',
      'fixed 2',
      'record 1',
      'record 2',
    ]);
  });

  test('isJsonStructure should check whether the passed value is a valid JSON structure', () => {
    expect(utils.isJsonStructure('{"x":true}')).toBeTruthy();
    expect(utils.isJsonStructure('[1, false, null]')).toBeTruthy();

    expect(utils.isJsonStructure('{"x":true')).toBeFalsy();
    expect(utils.isJsonStructure('true')).toBeFalsy();
    expect(utils.isJsonStructure(undefined)).toBeFalsy();
  });

  it('prepareSchema should copy and prepare a Schema for internal usage', () => {
    // Record.
    expect(utils.prepareSchema(SCHEMA)).toEqual(SCHEMA_PREPARED);

    // Union.
    expect(utils.prepareSchema((SCHEMA as Avro.Record).fields[1].type)).toEqual(
      SCHEMA_PREPARED.fields[1].type
    );

    // Already prepared schema.
    expect(
      utils.prepareSchema(SCHEMA_PREPARED as unknown as Avro.Record)
    ).toEqual(SCHEMA_PREPARED);
  });

  it('removeField should remove a field from a Record', () => {
    const record: Avro.Record = tu.copyJSON(SCHEMA) as Avro.Record;
    expect(record.fields).toHaveLength(4);
    record.fields = utils.removeField(record.fields, 1);
    expect(record.fields).toHaveLength(3);
    expect(record.fields[0]).toStrictEqual(SCHEMA.fields[0]);
    expect(record.fields[1]).toStrictEqual(SCHEMA.fields[2]);
  });

  it('stripTypeSuffix should remove the suffix (space with digit or +) from the type string', () => {
    expect(utils.stripTypeNameSuffix('type +')).toBe('type');
    expect(utils.stripTypeNameSuffix('type 123')).toBe('type');
    expect(utils.stripTypeNameSuffix('type €')).toBe('type €');
  });
});
