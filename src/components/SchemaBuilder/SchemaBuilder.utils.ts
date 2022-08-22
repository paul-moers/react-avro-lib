import * as Avro from './SchemaBuilder.schema.types';
import { FormikErrors, FormikProps } from 'formik/dist/types';
import {
  ErrorsInfoNeed,
  InputList,
  ObjectWithId,
  RecordFieldWithId,
  TYPE_NAME,
  TYPE_NAME_LOGICAL,
  TYPE_NAME_OBJECT,
} from './SchemaBuilder.types';
import {
  DEFAULTS_RECORD_FIELD,
  INPUT_LISTS,
  INPUT_LISTS_DOC_REQUIRED,
  TYPE_NAME_LOGICAL_MAP,
  TYPE_OPTIONS_ALL_STRINGS,
  TYPES_DEFAULTS,
  VALIDATION_SCHEMA_AVRO,
  VALIDATION_SCHEMA_AVRO_DOC_REQUIRED,
} from './SchemaBuilder.constants';

/**
 * Add new field to a Record.
 * @param fields - The Record fields to add one to.
 * @returns The extended fields list.
 */
function addField(fields: Avro.Record['fields']): Avro.Record['fields'] {
  return fields.concat({
    ...DEFAULTS_RECORD_FIELD,
    id: generateId(),
  } as RecordFieldWithId);
}

/**
 * Copy and clean Schema from modifications made for internal use.
 * - Remove defaults that were left unchanged, i.e. drop empty values.
 * - Change Unions with a single Schema into just that Schema.
 * - Make Primitive Objects into simple strings.
 * - Drop the added ids.
 * - Make Enum symbols and Named Schema's aliases into array.
 * @param schema - The Schema to clean.
 * @returns The cleaned Schema copy.
 */
function cleanSchema(schema: Avro.Schema): Avro.Schema {
  const schemaCopy = copySchema(schema);
  return Avro.isUnion(schemaCopy)
    ? cleanTypes(schemaCopy, false)
    : cleanType(schemaCopy as Avro.Object, false);
}

/**
 * @see cleanSchema
 * For Record.
 */
function cleanRecord(record: Avro.Record): Avro.Record {
  record.fields.forEach((field) => {
    removeEmptyProperties(field);
    // @ts-ignore -- Drop the added id.
    delete field.id;
    field.type = cleanTypes(field.type as Avro.Object[]);
  });
  return record;
}

/**
 * @see cleanSchema
 * For non-Union.
 */
function cleanType(schema: Avro.Object, changePrimitive = true): Avro.Schema {
  // @ts-ignore -- Drop the added id.
  delete schema.id;
  if (
    Avro.isPrimitiveObject(schema) &&
    Object.keys(schema).length === 1 &&
    changePrimitive
  ) {
    return schema.type;
  }
  removeEmptyProperties(schema);
  if (Avro.isArray(schema)) {
    schema.items = cleanTypes(schema.items as Avro.Object[]);
  } else if (Avro.isMap(schema)) {
    schema.values = cleanTypes(schema.values as Avro.Object[]);
  } else if (Avro.isNamed(schema)) {
    // @ts-ignore -- From input string to array.
    if (schema.aliases) schema.aliases = CSVToArray(schema.aliases);
    if (Avro.isEnum(schema)) {
      // @ts-ignore -- From input string to array.
      schema.symbols = schema.symbols ? CSVToArray(schema.symbols) : [];
    } else if (Avro.isRecord(schema)) {
      return cleanRecord(schema);
    }
  }
  return schema;
}

/**
 * @see cleanSchema
 * For Union.
 */
function cleanTypes(union: Avro.Union, changePrimitive = true): Avro.Schema {
  if (union.length === 0) return union;
  return union.length > 1
    ? (union.map((type) => cleanType(type as Avro.Object)) as Avro.Union)
    : cleanType(union[0] as Avro.Object, changePrimitive);
}

/**
 * Make deep copy of Schema.
 * @param schema - The Schema to copy.
 * @returns The copied Schema.
 */
function copySchema(schema: Avro.Schema): Avro.Schema {
  return JSON.parse(JSON.stringify(schema));
}

/**
 * Turn comma separated value into array.
 * @param value - The CSV value.
 * @returns The array.
 */
function CSVToArray(value: string): string[] {
  return value
    .replace(/\s*,(\s|,)*/g, ',') // Replace any amount of empty space with one or more commas with just a single comma.
    .replace(/^,|,$/g, '') // Replace any remaining heading or trailing comma.
    .split(',');
}

/**
 * Generate random id.
 * @returns Random id.
 */
function generateId() {
  return Math.random().toString(36).replace('0.', '');
}

/**
 * Check if errors need additional info.
 * @param errors - The Formik errors.
 * @returns The items that need additional info or undefined.
 */
function getErrorsInfoNeed(
  errors: FormikErrors<Avro.Schema> | undefined
): ErrorsInfoNeed | undefined {
  if (!errors) return;
  const errorsInfoNeed: ErrorsInfoNeed = {};
  const errorsJSON = JSON.stringify(errors);
  if (errorsJSON.includes('"name":"Format*"')) errorsInfoNeed.name = true;
  if (errorsJSON.includes('"namespace":"Format*"'))
    errorsInfoNeed.namespace = true;
  if (Object.keys(errorsInfoNeed).length > 0) return errorsInfoNeed;
}

/**
 * Get list of input fields details for type name.
 * @param typeName - The type name to get the list for.
 * @param docRequired - Option to have the doc marked as required.
 * @returns The list of input fields details.
 */
function getInputList(
  typeName: TYPE_NAME,
  docRequired: boolean
): InputList | undefined {
  const inputList = docRequired ? INPUT_LISTS_DOC_REQUIRED : INPUT_LISTS;

  if (Avro.isTypeComplex(typeName as Avro.COMPLEX)) {
    return inputList[typeName as Avro.COMPLEX];
  }
  if (isTypeNameLogical(typeName)) {
    return inputList[typeName];
  }
}

/**
 * Get Schema value or false if invalid.
 * @param formik - The Formik data.
 * @param namePath - The name path of the schema value.
 * @returns The Schema value or false if invalid.
 */
function getSchema(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formik: FormikProps<any>,
  namePath: string,
  docRequired = false
): Avro.Schema | false {
  const schema = cleanSchema(formik.values[namePath]);
  try {
    (docRequired
      ? VALIDATION_SCHEMA_AVRO_DOC_REQUIRED
      : VALIDATION_SCHEMA_AVRO
    ).validateSync(schema);
    return schema;
  } catch (error) {
    return false;
  }
}

/**
 * Get type name corresponding to the Schema type object, possibly appended with numbering for named types.
 * @param schema - The Schema object.
 * @param [number] - The optional number.
 * @returns The type string.
 */
function getTypeName(schema: Avro.Object, number?: number): TYPE_NAME | string {
  if (Avro.isLogical(schema)) {
    return TYPE_NAME_LOGICAL_MAP[`${schema.logicalType}:${schema.type}`];
  }
  if (number) return `${schema.type} ${number}`;
  return schema.type;
}

/**
 * Get names corresponding to the Schema objects, each possibly appended with numbering for named union.
 * @param union - The Schema objects.
 * @returns The types strings.
 */
function getTypeNames(union: Avro.Object[]): (TYPE_NAME | string)[] {
  if (union.length == 0) return [];

  let enumCount = 0;
  let enumTotal = 0;
  let fixedCount = 0;
  let fixedTotal = 0;
  let recordCount = 0;
  let recordTotal = 0;

  // Count total of each of the named Schema.
  for (let i = union.length - 1; i >= 0; i--) {
    if (!Avro.isLogical(union[i])) {
      if (union[i].type.indexOf('enum') === 0) {
        enumTotal++;
      } else if (union[i].type.indexOf('fixed') === 0) {
        fixedTotal++;
      } else if (union[i].type.indexOf('record') === 0) {
        recordTotal++;
      }
    }
  }

  return union.map((schema) => {
    // For each of the named schemas, add numbering if there are multiple.
    if (!Avro.isLogical(schema)) {
      if (enumTotal > 1 && schema.type.indexOf('enum') === 0) {
        enumCount++;
        return getTypeName(schema, enumCount);
      }
      if (fixedTotal > 1 && schema.type.indexOf('fixed') === 0) {
        fixedCount++;
        return getTypeName(schema, fixedCount);
      }
      if (recordTotal > 1 && schema.type.indexOf('record') === 0) {
        recordCount++;
        return getTypeName(schema, recordCount);
      }
    }
    // Other Schemas can not have multiple, so plain string.
    return getTypeName(schema);
  });
}

/**
 * Get Schema objects (existing Schema values or defaults) corresponding to type names.
 * @param typeNames - The type names.
 * @param typeObjects - The existing type objects.
 * @param typeNamesOld - The previous type names.
 * @returns The type objects.
 */
function getTypeObjects(
  typeNames: (TYPE_NAME | string)[],
  typeObjects: Avro.Object[] = [],
  typeNamesOld: (TYPE_NAME | string)[]
): Avro.Schema {
  let removedItemIndex: number;

  // Item removed.
  if (typeNamesOld.length > typeNames.length) {
    removedItemIndex = typeNamesOld.findIndex(
      (typeName, index) => typeNames[index] !== typeName
    );
    return [
      ...typeObjects.slice(0, removedItemIndex),
      ...typeObjects.slice(removedItemIndex + 1),
    ];
  }

  // Item added, always last item.
  // Get Type.
  const addedTypeName: TYPE_NAME = stripTypeNameSuffix(
    typeNames[typeNames.length - 1]
  );
  let addedType: Avro.Schema;
  if (Avro.isTypePrimitive(addedTypeName as Avro.TYPE)) {
    addedType = {
      type: addedTypeName,
      id: generateId(),
    } as ObjectWithId;
  } else {
    addedType = {
      ...TYPES_DEFAULTS[addedTypeName as TYPE_NAME_OBJECT],
      id: generateId(),
    } as ObjectWithId;
  }
  // Get index to insert item at, ordering according to AVRO_TYPE_OPTIONS_STRINGS.
  const addedTypeOptionIndex = TYPE_OPTIONS_ALL_STRINGS.findIndex(
    (typeName) => typeName === addedTypeName
  );
  const possiblePrecedingOptions = TYPE_OPTIONS_ALL_STRINGS.slice(
    0,
    addedTypeOptionIndex +
      (Avro.isTypeNamed(addedTypeName as Avro.TYPE) ? 1 : 0) // Including added type if it's a named type as there can be multiple of those.
  );
  let previousItemIndex: number | undefined;
  for (let i = typeNamesOld.length - 1; i >= 0; i--) {
    if (
      possiblePrecedingOptions.includes(stripTypeNameSuffix(typeNamesOld[i]))
    ) {
      previousItemIndex = i;
      break;
    }
  }
  // Construct list.
  if (previousItemIndex !== undefined) {
    return [
      ...typeObjects.slice(0, previousItemIndex + 1),
      addedType,
      ...typeObjects.slice(previousItemIndex + 1),
    ];
  }
  return [addedType, ...typeObjects];
}

/**
 * Check whether value is an Avro structure (valid Avro nesting and all types are valid Avro types).
 * @param value - The value to check.
 * @returns True when value is a valid Avro structure.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isAvroStructure(value: any): boolean {
  if (Avro.isUnion(value)) {
    return value.every(isAvroStructure);
  }
  if (typeof value === 'string') {
    return Avro.isTypePrimitive(value as Avro.TYPE);
  }
  if (Avro.isPrimitiveObject(value)) {
    return Avro.isTypePrimitive(value.type as Avro.TYPE);
  }
  if (Avro.isLogical(value)) {
    return (
      TYPE_NAME_LOGICAL_MAP[`${value.logicalType}:${value.type}`] !== undefined
    );
  }
  if (Avro.isObject(value) && Array.isArray(value.type)) {
    return value.type.every(isAvroStructure);
  }

  return (
    Avro.isTypeComplex(value.type as Avro.TYPE) &&
    (!Avro.isRecord(value) ||
      value.fields.every((field) => isAvroStructure(field.type))) &&
    (!Avro.isArray(value) || isAvroStructure(value.items)) &&
    (!Avro.isMap(value) || isAvroStructure(value.values))
  );
}

/**
 * Check whether value is a JSON structure.
 * @param value - The value to check.
 * @returns True when value is a valid JSON structure.
 */
function isJsonStructure(value: string | undefined): boolean {
  if (typeof value !== 'string') return false;
  try {
    const result = JSON.parse(value);
    const type = Object.prototype.toString.call(result);
    return type === '[object Object]' || type === '[object Array]';
  } catch (err) {
    return false;
  }
}

/**
 * @see prepareSchema
 * For Array.
 */
function prepareArray(array: Avro.Array): Avro.Array {
  return {
    ...TYPES_DEFAULTS[Avro.COMPLEX.array],
    ...array,
    // @ts-ignore
    id: generateId(),
    items: prepareTypes(
      Avro.isUnion(array.items) ? array.items : [array.items]
    ),
  };
}

/**
 * @see prepareSchema
 * For Map.
 */
function prepareMap(map: Avro.Map): Avro.Map {
  return {
    ...TYPES_DEFAULTS[Avro.COMPLEX.map],
    ...map,
    // @ts-ignore
    id: generateId(),
    values: prepareTypes(Avro.isUnion(map.values) ? map.values : [map.values]),
  };
}

/**
 * @see prepareSchema
 * For Record.
 */
function prepareRecord(record: Avro.Record): Avro.Record {
  return {
    ...(TYPES_DEFAULTS[Avro.COMPLEX.record] as Avro.Record),
    ...record,
    // @ts-ignore
    aliases: Array.isArray(record.aliases)
      ? record.aliases.join(',')
      : record.aliases || '',
    fields: record.fields.map((field) => {
      return {
        ...DEFAULTS_RECORD_FIELD,
        ...field,
        id: generateId(),
        type: prepareTypes(
          Avro.isUnion(field.type) ? field.type : [field.type]
        ),
      };
    }),
    // @ts-ignore
    id: generateId(),
  };
}

/**
 * Copy and prepare Schema for internal usage:
 * - Set defaults, so inputs are initialised as controlled inputs.
 * - Make types always as Unions, for the select field needing an array.
 * - Make Schema always an object, for easier handling throughout the code, but also being able to give it an id.
 * - Add a unique id to each Schema and Record field, for the key of each rendered item (as type is not possible because there can be multiple of the named types).
 * @param schema - The Schema to prepare.
 * @returns The prepared Schema copy.
 */
function prepareSchema(schema: Avro.Schema): Avro.Schema {
  const schemaCopy = copySchema(schema);
  return Avro.isUnion(schemaCopy)
    ? prepareTypes(schemaCopy)
    : prepareType(schemaCopy);
}

/**
 * @see prepareSchema
 * For non-Union.
 */
function prepareType(schema: Avro.Schema): Avro.Object {
  if (Avro.isRecord(schema)) {
    return prepareRecord(schema);
  }
  if (Avro.isArray(schema)) {
    return prepareArray(schema);
  }
  if (Avro.isMap(schema)) {
    return prepareMap(schema);
  }
  if (Avro.isObject(schema)) {
    return {
      ...TYPES_DEFAULTS[getTypeName(schema) as TYPE_NAME_OBJECT],
      ...schema,
      ...((schema as Avro.Enum).symbols
        ? {
            symbols: Array.isArray((schema as Avro.Enum).symbols)
              ? (schema as Avro.Enum).symbols.join(',')
              : (schema as Avro.Enum).symbols,
          }
        : {}),
      ...((schema as Avro.Named).aliases
        ? {
            aliases: Array.isArray((schema as Avro.Enum).aliases)
              ? // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                (schema as Avro.Named).aliases!.join(',')
              : (schema as Avro.Enum).aliases,
          }
        : {}),
      id: generateId(),
    } as ObjectWithId;
  }
  return {
    type: schema,
    id: generateId(),
  } as ObjectWithId;
}

/**
 * @see prepareSchema
 * For Union.
 */
function prepareTypes(union: Avro.Union): Avro.Union {
  return union.map(prepareType);
}

/**
 * Check if type name is Logical.
 * @param type - The type name.
 * @returns True if type name is Logical.
 */
function isTypeNameLogical(type: TYPE_NAME): type is TYPE_NAME_LOGICAL {
  return Object.values(TYPE_NAME_LOGICAL).includes(type as TYPE_NAME_LOGICAL);
}

/**
 * Remove empty string properties of object.
 * @param object - The object to drop the empty string properties from.
 */
function removeEmptyProperties(object: object): void {
  Object.keys(object).forEach(
    // @ts-ignore
    (k) => object[k] === '' && delete object[k]
  );
}

/**
 * Remove field from Record.
 * @param fields - The Record fields to remove from.
 * @param index - The field number to remove, with fields counting from 0.
 * @returns The reduced fields list.
 */
function removeField(
  fields: Avro.Record['fields'],
  index: number
): Avro.Record['fields'] {
  return fields.slice(0, index).concat(fields.slice(index + 1));
}

/**
 * Remove the suffix (space with digit or +) from the type name.
 * @param typeName - The type name.
 * @returns The type name without suffix.
 */
function stripTypeNameSuffix(typeName: string): TYPE_NAME {
  return typeName.replace(/\s(\d+|\+)/, '') as TYPE_NAME;
}

export const utils = {
  addField,
  cleanSchema,
  generateId,
  getErrorsInfoNeed,
  getInputList,
  getSchema,
  getTypeName,
  getTypeNames,
  getTypeObjects,
  isAvroStructure,
  isJsonStructure,
  prepareSchema,
  removeField,
  stripTypeNameSuffix,
};
