import * as Avro from './SchemaBuilder.schema.types';
import React from 'react';
import { Alert, FormControlLabel, FormHelperText, Switch } from '@mui/material';
import { FormikErrors } from 'formik/dist/types';
import { utils } from './SchemaBuilder.utils';
import { ValidationError } from 'yup';
import {
  ArrayOrMapProps,
  ErrorsInfoProps,
  InputList,
  ObjectWithId,
  RECORD_FIELD_ORDER_ITEMS,
  RecordFieldsProps,
  RecordFieldWithId,
  RecordProps,
  SchemaBuilderProps,
  TYPE_NAME,
  TYPE_NAME_LOGICAL,
  TypeProps,
  TypesProps,
} from './SchemaBuilder.types';
import {
  AddCircle,
  RemoveCircle,
  SubdirectoryArrowRight,
} from '@mui/icons-material';
import {
  ButtonAdd,
  ButtonDelete,
  DropdownOption,
  DropdownSeparator,
  ErrorsInfoContainer,
  FieldsTitle,
  Input,
  Inputs,
  InputSection,
  InputSubSection,
  InputSubSectionLabel,
  RecordContainer,
  SwitchContainer,
  Textarea,
} from './SchemaBuilder.styles';
import {
  ID_PATH_ROOT,
  INPUT_LIST_RECORD_FIELD,
  INPUT_LIST_RECORD_FIELD_DOC_REQUIRED,
  INPUT_LISTS,
  INPUT_LISTS_DOC_REQUIRED,
  VALIDATION_SCHEMA_JSON_AVRO,
} from './SchemaBuilder.constants';

function ArrayOrMap({
  docRequired = false,
  formik,
  level = 1,
  ...props
}: ArrayOrMapProps): React.ReactElement {
  let idPath: string;
  let label: string;
  let namePath: string;
  let typeErrors: FormikErrors<Avro.Object[]>;
  let types: Avro.Object[];

  if (Avro.isArray(props.values)) {
    idPath = `${props.idPath || ID_PATH_ROOT}-items`;
    label = 'Items*';
    namePath = `${props.namePath}.items`;
    typeErrors =
      (((props.errors || {}) as FormikErrors<Avro.Array>)
        .items as unknown as FormikErrors<Avro.Object[]>) || [];
    types = (props.values as Avro.Array).items as Avro.Object[];
  } else {
    idPath = `${props.idPath || ID_PATH_ROOT}-values`;
    label = 'Values*';
    namePath = `${props.namePath}.values`;
    typeErrors =
      (((props.errors || {}) as FormikErrors<Avro.Map>)
        .values as unknown as FormikErrors<Avro.Object[]>) || [];
    types = (props.values as Avro.Map).values as Avro.Object[];
  }
  const typeNames = utils.getTypeNames(types);

  return (
    <InputSection className='inline'>
      <Inputs>
        <Input
          className={`input-type level-${level}`}
          data-test-id={idPath}
          // Only show error when it's a string, as object typeErrors are displayed by children.
          error={typeof typeErrors === 'string'}
          helperText={typeof typeErrors === 'string' && typeErrors}
          InputLabelProps={{ shrink: true }}
          label={label}
          name={namePath}
          onChange={(e) => {
            formik.setFieldValue(
              namePath,
              utils.getTypeObjects(
                e.target.value as unknown as TYPE_NAME[],
                types,
                typeNames
              )
            );
          }}
          select
          SelectProps={{
            MenuProps: {
              MenuListProps: {
                // @ts-ignore
                'data-test-id': `${idPath}-menu-list`,
              },
            },
            multiple: true,
          }}
          size='small'
          value={typeNames}
        >
          {TypeOptions(typeNames)}
        </Input>
      </Inputs>

      <Types
        docRequired={docRequired}
        errors={typeErrors}
        formik={formik}
        idPath={idPath}
        level={level + 1}
        namePath={namePath}
        typeNames={typeNames}
        values={types}
      />
    </InputSection>
  );
}

function ErrorsInfo({ errors }: ErrorsInfoProps): React.ReactElement {
  const errorsInfoNeed = utils.getErrorsInfoNeed(errors);

  if (!errorsInfoNeed) return <></>;

  return (
    <ErrorsInfoContainer>
      {(errorsInfoNeed.name || errorsInfoNeed.namespace) && (
        <span>
          <span>*Name format:</span>Non-accented character or underscore,
          followed by any amount of non-accented characters, numbers or
          underscores mixed.
        </span>
      )}
      {errorsInfoNeed.namespace && (
        <span>
          <span>*Namespace format:</span>One or more parts with name format,
          separated by a dot.
        </span>
      )}
    </ErrorsInfoContainer>
  );
}

function RecordFields({
  docRequired,
  errors: fieldsErrors = [],
  formik,
  idPath: fieldsIdPath,
  level = 1,
  namePath: fieldsNamePath,
  values: fieldsValues,
}: RecordFieldsProps): React.ReactElement {
  const inputList = docRequired
    ? INPUT_LIST_RECORD_FIELD_DOC_REQUIRED
    : INPUT_LIST_RECORD_FIELD;

  return (
    <>
      {fieldsValues.map((field, index) => {
        const errors = fieldsErrors[index] || {};
        const idPath = `${fieldsIdPath}-${index}`;
        const namePath = `${fieldsNamePath}[${index}]`;
        const values = fieldsValues[index] || {};
        const types = values.type as Avro.Object[];
        const typeNames = utils.getTypeNames(types);

        return (
          <InputSection
            className={`bullet level-${level}`}
            key={(field as RecordFieldWithId).id}
          >
            <Inputs>
              <Input
                className={`input-type level-${level}`}
                data-test-id={`${idPath}-type`}
                // Only show error when it's a string, as object errors are displayed by children.
                error={typeof errors.type === 'string'}
                helperText={typeof errors.type === 'string' && errors.type}
                InputLabelProps={{ shrink: true }}
                label='Type*'
                name={`${namePath}.type`}
                onChange={(e) => {
                  formik.setFieldValue(
                    `${namePath}.type`,
                    utils.getTypeObjects(
                      e.target.value as unknown as TYPE_NAME[],
                      types,
                      typeNames
                    )
                  );
                }}
                select
                SelectProps={{
                  MenuProps: {
                    MenuListProps: {
                      // @ts-ignore
                      'data-test-id': `${idPath}-type-menu-list`,
                    },
                  },
                  multiple: true,
                }}
                size='small'
                value={typeNames}
              >
                {TypeOptions(typeNames)}
              </Input>

              {inputList.map((fieldDetails) => {
                const name =
                  fieldDetails.name as keyof Avro.Record['fields'][number];
                const error = errors[name];

                return (
                  <Input
                    className={`${fieldDetails.className || ''} level-${level}`}
                    data-test-id={`${idPath}-${name}`}
                    disabled={fieldDetails.disabled}
                    error={Boolean(error)}
                    helperText={error}
                    key={name}
                    label={fieldDetails.label}
                    name={`${namePath}.${name}`}
                    onChange={formik.handleChange}
                    value={values[name]}
                  />
                );
              })}

              <Input
                className={`level-${level}`}
                data-test-id={`${idPath}-order`}
                error={Boolean(errors.order)}
                helperText={errors.order}
                InputLabelProps={{ shrink: true }}
                label='Order'
                name={`${namePath}.order`}
                onChange={(e) => {
                  formik.setFieldValue(`${namePath}.order`, e.target.value);
                }}
                select
                size='small'
                value={values.order}
              >
                {Object.keys(RECORD_FIELD_ORDER_ITEMS).map((orderItem) => (
                  <DropdownOption
                    key={orderItem}
                    // @ts-ignore
                    value={RECORD_FIELD_ORDER_ITEMS[orderItem]}
                  >
                    {orderItem}
                  </DropdownOption>
                ))}
              </Input>
            </Inputs>

            <ButtonDelete>
              <RemoveCircle
                fontSize='small'
                onClick={() => {
                  formik.setFieldValue(
                    `${fieldsNamePath}`,
                    utils.removeField(fieldsValues, index)
                  );
                }}
              />
            </ButtonDelete>

            <Types
              docRequired={docRequired}
              errors={errors.type as unknown as FormikErrors<Avro.Object[]>}
              formik={formik}
              idPath={`${idPath}-type`}
              level={level + 1}
              namePath={`${namePath}.type`}
              typeNames={typeNames}
              values={types}
            />
          </InputSection>
        );
      })}
    </>
  );
}

function Record({
  docRequired = false,
  errors = {},
  formik,
  idPath,
  level = 1,
  namePath,
  values,
}: RecordProps): React.ReactElement {
  return (
    <RecordContainer className={`level-${level}`}>
      <InputSection className={`level-${level}`}>
        <Inputs>
          {(
            (docRequired ? INPUT_LISTS_DOC_REQUIRED : INPUT_LISTS)[
              Avro.COMPLEX.record
            ] as InputList
          ).map((fieldDetails) => {
            const name = fieldDetails.name as keyof Avro.Schema;
            const error = errors[name];
            const value = values[name];

            return (
              <Input
                className={`${fieldDetails.className || ''} level-${level}`}
                data-test-id={`${idPath}-${name}`}
                disabled={fieldDetails.disabled}
                error={Boolean(error)}
                helperText={error}
                key={name}
                label={fieldDetails.label}
                name={`${namePath}.${name}`}
                onChange={formik.handleChange}
                value={value}
              />
            );
          })}
        </Inputs>
      </InputSection>

      <FieldsTitle className={`level-${level}`}>Fields</FieldsTitle>

      {values.fields.length === 0 ? (
        formik.submitCount > 0 && (
          <FormHelperText error>Please add at least one field.</FormHelperText>
        )
      ) : (
        <RecordFields
          docRequired={docRequired}
          errors={errors.fields as FormikErrors<Avro.Record['fields']>}
          formik={formik}
          idPath={`${idPath}-fields`}
          level={level}
          namePath={`${namePath}.fields`}
          values={values.fields}
        />
      )}

      <ButtonAdd
        onClick={() => {
          formik.setFieldValue(
            `${namePath}.fields`,
            utils.addField(values.fields)
          );
        }}
      >
        <AddCircle fontSize='small' />
        Add field
      </ButtonAdd>
    </RecordContainer>
  );
}

function Type({
  docRequired = false,
  errors = {},
  formik,
  fixedRoot = false,
  idPath,
  level = 1,
  namePath,
  values,
  ...props
}: TypeProps): React.ReactElement {
  const typeName = props.typeName || utils.getTypeName(values);
  const typeNameWithoutSuffix = utils.stripTypeNameSuffix(typeName);
  const inputList = utils.getInputList(typeNameWithoutSuffix, docRequired);

  if (!inputList) return <></>;

  return (
    <InputSubSection
      className={`level-${level}`}
      key={(values as ObjectWithId).id}
    >
      {(level > 1 || !fixedRoot) && (
        <InputSubSectionLabel className={`level-${level}`}>
          <SubdirectoryArrowRight />
          <span>{typeName}:</span>
        </InputSubSectionLabel>
      )}

      {Avro.isRecord(values) ? (
        <Record
          docRequired={docRequired}
          errors={errors}
          formik={formik}
          idPath={idPath}
          level={level}
          namePath={namePath}
          values={values}
        />
      ) : Avro.isArray(values) || Avro.isMap(values) ? (
        <ArrayOrMap
          docRequired={docRequired}
          errors={errors}
          formik={formik}
          idPath={idPath}
          level={level}
          namePath={namePath}
          values={values}
        />
      ) : (
        <Inputs>
          {inputList.map((fieldDetails) => {
            const name = fieldDetails.name as keyof Avro.Schema;
            const error = errors[name];
            const value = values[name];

            return (
              <Input
                className={`${fieldDetails.className || ''} level-${level}`}
                data-test-id={`${idPath}-${name}`}
                disabled={fieldDetails.disabled}
                error={Boolean(error)}
                helperText={error}
                key={name}
                label={fieldDetails.label}
                name={`${namePath}.${name}`}
                onChange={formik.handleChange}
                value={value}
              />
            );
          })}
        </Inputs>
      )}
    </InputSubSection>
  );
}

function Types({
  docRequired = false,
  errors: typesErrors = [],
  fixedRoot = false,
  formik,
  idPath: typesIdPath = ID_PATH_ROOT,
  level = 1,
  namePath: typesNamePath,
  values: typesValues,
  ...props
}: TypesProps): React.ReactElement {
  const typeNames = props.typeNames || utils.getTypeNames(typesValues);

  return (
    <>
      {typeNames.map((typeName, typeIndex) => {
        const errors = typesErrors[typeIndex] || {};
        const idPath = `${typesIdPath}-${typeIndex}`;
        const namePath = `${typesNamePath}[${typeIndex}]`;
        const values = typesValues[typeIndex];

        return (
          <Type
            docRequired={docRequired}
            errors={errors}
            fixedRoot={fixedRoot}
            formik={formik}
            idPath={idPath}
            key={(values as ObjectWithId).id}
            level={level}
            namePath={namePath}
            typeName={typeName}
            values={values}
          />
        );
      })}
    </>
  );
}

// Dropdown option for type name.
function TypeOption(typeName: TYPE_NAME | string): React.ReactElement {
  return (
    <DropdownOption key={typeName} value={typeName}>
      {typeName}
    </DropdownOption>
  );
}

// Type dropdown options, with dynamic options for possible multiple named types within the passed types names.
function TypeOptions(typeNames: string[]): React.ReactElement[] {
  let enumCount = 0;
  let fixedCount = 0;
  let recordCount = 0;

  // Count named types by getting last of type and either getting its number or defaulting to 1.
  for (let i = typeNames.length - 1; i >= 0; i--) {
    const typeName = typeNames[i];
    if (typeName.indexOf('enum') === 0) {
      if (enumCount) continue;
      enumCount = Number(typeName.substring(5) || 1);
    } else if (typeName.indexOf('fixed') === 0) {
      if (fixedCount) continue;
      fixedCount = Number(typeName.substring(6) || 1);
    } else if (typeName.indexOf('record') === 0) {
      if (recordCount) continue;
      recordCount = Number(typeName.substring(7) || 1);
    }
  }

  return [
    ...Object.values(Avro.PRIMITIVE).map(TypeOption),
    <DropdownSeparator key='separator1' />,
    TypeOption(Avro.COMPLEX.array),
    ...TypeOptionsNumbered(Avro.COMPLEX.enum, enumCount),
    TypeOption('enum +'),
    ...TypeOptionsNumbered(Avro.COMPLEX.fixed, fixedCount),
    TypeOption('fixed +'),
    TypeOption(Avro.COMPLEX.map),
    ...TypeOptionsNumbered(Avro.COMPLEX.record, recordCount),
    TypeOption('record +'),
    <DropdownSeparator key='separator2' />,
    ...Object.values(TYPE_NAME_LOGICAL).map(TypeOption),
  ];
}

// Dropdown options for a number of a named type name, with each one numbered.
function TypeOptionsNumbered(
  typeName: Avro.TypeNamed,
  total: number
): React.ReactElement[] {
  return Array(total)
    .fill(0)
    .map((_, i) => {
      return TypeOption(`${typeName}${total > 1 ? ` ${i + 1}` : ''}`); // If multiple then add numbering.
    });
}

export default function SchemaBuilder({
  docRequired = false,
  fixedRoot = false,
  formik,
  idPath = ID_PATH_ROOT,
  level = 1,
  namePath,
  namePathJSON = '',
}: SchemaBuilderProps): React.ReactElement {
  const [isAvroSchemaInvalid, setIsAvroSchemaInvalid] = React.useState<
    boolean | undefined
  >();
  const [isJSONMode, setIsJSONMode] = React.useState(false);
  const [isUIToggleDisabled, setIsUIToggleDisabled] = React.useState(false);
  const errors = formik.errors || {};
  const values = formik.values;
  let UI: React.ReactElement;

  // On mount.
  React.useEffect(() => {
    if (utils.isAvroStructure(values[namePath])) {
      const schema = utils.prepareSchema(values[namePath]);
      values[namePath] = schema;
      formik.setFieldValue(namePath, schema);
      setIsAvroSchemaInvalid(false);
    } else {
      setIsAvroSchemaInvalid(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Loading.
  if (isAvroSchemaInvalid === undefined) {
    return <></>;
  }

  // Error.
  if (isAvroSchemaInvalid) {
    return (
      <Alert severity='error'>
        The passed Avro Schema is invalid. The structure or types are invalid.
      </Alert>
    );
  }

  // Switch UI mode and set source value to target; when switching from JSON check structure validity first.
  function toggleUI(): void {
    if (isJSONMode) {
      if (tryApplyingJSON(false)) {
        setIsJSONMode(false);
      }
    } else {
      formik.setFieldValue(
        namePathJSON,
        JSON.stringify(
          utils.cleanSchema(formik.values[namePath] as Avro.Schema),
          null,
          2
        )
      );
      setIsJSONMode(true);
    }
  }

  // Check if JSON is valid and if so set value to Avro field.
  // Then optionally validate the Avro schema and switch to Avro UI when invalid.
  function tryApplyingJSON(
    validateJSON: boolean,
    validateAvro = false,
    disableToggle = false
  ): boolean {
    if (validateJSON) {
      try {
        VALIDATION_SCHEMA_JSON_AVRO.validateSync(formik.values[namePathJSON]);
      } catch (error) {
        formik.setErrors({
          ...errors,
          [namePathJSON]: (error as ValidationError).message,
        });
        return false;
      }
    } else if (errors.schemaJSON) {
      return false;
    }
    const schemaJSON = formik.values[namePathJSON] || '{}';
    const schema = utils.prepareSchema(JSON.parse(schemaJSON));
    formik.values[namePath] = schema; // Also on values to have the correct value reflected already before rerender.
    formik.setFieldValue(namePath, schema);

    if (validateAvro) {
      if (!utils.getSchema(formik, namePath, docRequired)) {
        setIsJSONMode(false);
        if (disableToggle) {
          setIsUIToggleDisabled(true);
          setTimeout(() => setIsUIToggleDisabled(false), 200);
        }
      }
    }

    return true;
  }

  if (isJSONMode) {
    UI = (
      <Textarea
        error={Boolean(errors[namePathJSON])}
        fullWidth
        helperText={errors[namePathJSON] as string}
        inputProps={{
          'data-test-id': `${idPath}-json-input`,
        }}
        maxRows={30}
        minRows={4}
        multiline
        name='schemaJSON'
        onBlur={() => {
          // Try applying JSON and validate it as Avro, switch to Avro UI if invalid, then disable toggle to prevent another UI switch that would happen if blur was due to click on toggle.
          // On blur to make the schema value set correctly should a submit happen subsequently.
          tryApplyingJSON(formik.submitCount === 0, true, true);
        }}
        onChange={formik.handleChange}
        value={values[namePathJSON]}
      />
    );
  } else {
    const schemaErrors =
      (errors[namePath] as FormikErrors<Avro.Object[]>) || {};
    const schemaValues = values[namePath];
    const schemaType = Avro.isUnion(schemaValues)
      ? schemaValues
      : [schemaValues];
    const schemaTypeNames = utils.getTypeNames(schemaType);

    UI = (
      <InputSection
        className={`level-0 inline`}
        data-test-id={`${idPath}-avro-ui`}
      >
        {!fixedRoot && (
          <Inputs>
            <Input
              className={`input-type level-${level}`}
              data-test-id={idPath}
              // Only show error when it's a string, as object typeErrors are displayed by children.
              error={typeof schemaErrors === 'string'}
              helperText={typeof schemaErrors === 'string' && schemaErrors}
              InputLabelProps={{ shrink: true }}
              label='Type*'
              name={namePath}
              onChange={(e) => {
                formik.setFieldValue(
                  namePath,
                  utils.getTypeObjects(
                    e.target.value as unknown as TYPE_NAME[],
                    schemaType,
                    schemaTypeNames
                  )
                );
              }}
              select
              SelectProps={{
                MenuProps: {
                  MenuListProps: {
                    // @ts-ignore
                    'data-test-id': `${idPath}-menu-list`,
                  },
                },
                multiple: true,
              }}
              size='small'
              value={schemaTypeNames}
            >
              {TypeOptions(schemaTypeNames)}
            </Input>
          </Inputs>
        )}

        {Avro.isUnion(schemaValues) ? (
          <Types
            docRequired={docRequired}
            errors={schemaErrors as FormikErrors<Avro.Object[]>}
            fixedRoot={fixedRoot}
            formik={formik}
            idPath={idPath}
            level={level}
            namePath={namePath}
            values={schemaValues as Avro.Object[]}
          />
        ) : (
          <Type
            docRequired={docRequired}
            errors={schemaErrors as FormikErrors<Avro.Object>}
            fixedRoot={fixedRoot}
            formik={formik}
            idPath={idPath}
            level={level}
            namePath={namePath}
            values={schemaValues as Avro.Object}
          />
        )}
        <ErrorsInfo errors={errors} />
      </InputSection>
    );
  }

  return (
    <>
      {UI}
      {namePathJSON && (
        <SwitchContainer>
          <FormControlLabel
            componentsProps={{ typography: { variant: 'subtitle2' } }}
            control={
              <Switch
                checked={!isJSONMode}
                className={errors[namePathJSON] && isJSONMode ? 'error' : ''}
                color='default'
                data-test-id={`${idPath}-ui-toggle`}
                onChange={() => !isUIToggleDisabled && toggleUI()}
                size='small'
              />
            }
            label='Textarea/AvroUI'
          />
        </SwitchContainer>
      )}
    </>
  );
}
