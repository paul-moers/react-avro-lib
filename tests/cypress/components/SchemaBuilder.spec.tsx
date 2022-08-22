import * as Avro from 'src/components/SchemaBuilder/SchemaBuilder.schema.types';
import * as React from 'react';
import SchemaBuilderMount from '../../utils/SchemaBuilderMount';
import { INPUT_LISTS_DOC_REQUIRED } from 'src/components/SchemaBuilder/SchemaBuilder.constants';
import { mount } from '@cypress/react18';
import { testUtils as tu } from '../../utils/AvroSchema.utils';
import {
  SCHEMA_GROUPS_CHANGEABLE,
  SCHEMA_GROUPS_UNCHANGEABLE,
  SCHEMA_NESTED,
  SCHEMAS_RECURSIVE,
} from '../mocks/AvroSchema';

describe('SchemaBuilder', () => {
  describe('with any Schema', () => {
    const schema = { type: 'int' } as Avro.PrimitiveObject;

    beforeEach(() => {
      mount(<SchemaBuilderMount schema={schema} />);
    });

    it('should have a toggle to switch the UI', () => {
      tu.cy.getJSONInput().should('not.exist');
      tu.cy.toggleUI();
      tu.cy.getJSONInput().should('exist');
      tu.cy.toggleUI();
      tu.cy.getJSONInput().should('not.exist');
    });

    it('should do validation on the JSON', () => {
      tu.cy.toggleUI();

      tu.cy.clearSchemaJSON();
      tu.cy.submitForm();
      tu.cy.checkError('Please enter an Avro schema.');

      tu.cy.clearSchemaJSON();
      tu.cy.inputSchemaJSON('a');
      tu.cy.checkError('Please enter valid JSON.');

      tu.cy.clearSchemaJSON();
      tu.cy.inputSchemaJSON('{"type": "foo"}');
      tu.cy.checkError('Please enter an Avro schema structure.');

      tu.cy.clearSchemaJSON();
      tu.cy.inputSchemaJSON('{"type": "int"}');
      tu.cy.checkIsValid();
    });

    it('should not switch the UI when JSON is invalid', () => {
      tu.cy.toggleUI();

      tu.cy.inputSchemaJSON('a').blur();
      tu.cy.checkError('Please enter valid JSON.');
      tu.cy.toggleUI();
      tu.cy.getJSONInput().should('exist');

      tu.cy.inputSchemaJSON('{backspace}', true).blur();
      tu.cy.checkIsValid();
      tu.cy.toggleUI();
      tu.cy.getJSONInput().should('not.exist');
    });

    it('should reflect changes between JSON and Avro UI', () => {
      const name = 'newly_set_name';
      const nameChanged = 'changed_name';
      const symbols = ['a', 'b'];
      const type = 'enum';

      // Change type in JSON mode.
      tu.cy.toggleUI();
      tu.cy.inputSchemaJSON('{selectall}{backspace}', true);
      tu.cy.inputSchemaJSON(`{"type": "${type}"}`);
      tu.cy.toggleUI();

      // Check result in Avro UI.
      INPUT_LISTS_DOC_REQUIRED[type]?.forEach((fieldDetails) => {
        tu.cy
          .getInput(fieldDetails.name)
          .should('exist')
          .find('label')
          .should('have.text', fieldDetails.label)
          .parent()
          .find('input')
          .should('have.value', '');
      });

      // Change type
      tu.cy.getInput('name').type(name);

      // Check result in JSON mode.
      tu.cy.toggleUI();
      tu.cy
        .getJSONInput()
        .should(
          'have.value',
          JSON.stringify({ name, type, symbols: [] }, null, 2)
        );

      // Change name and symbols.
      let json = '';
      tu.cy
        .getJSONInput()
        .invoke('val')
        .then((value) => {
          json = (value as string)
            .replace(name, nameChanged)
            .replace('[]', `["${symbols.join('","')}"]`);
          tu.cy.inputSchemaJSON('{selectall}{backspace}', true);
          tu.cy.inputSchemaJSON(json);
        });

      // Check result in Avro UI.
      tu.cy.toggleUI();
      tu.cy.checkInputValue('name', nameChanged);
      tu.cy.checkInputValue('symbols', symbols.join(','));
    });
  });

  describe("with Schemas that don't have properties to change", () => {
    Object.values(SCHEMA_GROUPS_UNCHANGEABLE).forEach((schemaGroup) => {
      Object.values(schemaGroup.schemas).forEach((schema) => {
        const typeString =
          typeof schema === 'string'
            ? schema
            : schema.logicalType || schema.type;

        describe(`i.e. ${schemaGroup.label} types, e.g. ${typeString}`, () => {
          beforeEach(() => {
            mount(<SchemaBuilderMount schema={schema} fixedRoot={true} />);
          });

          it('should show no AVRO UI', () => {
            tu.cy.getAvroUI().should('be.empty');
          });
        });
      });
    });
  });

  describe('with Schemas that do have properties that can be changed', () => {
    Object.values(SCHEMA_GROUPS_CHANGEABLE).forEach((schemaGroup) => {
      Object.keys(schemaGroup.data.valid).forEach((typeName) => {
        // @ts-ignore
        const schema: Avro.Object = schemaGroup.data.valid[typeName];
        describe(`i.e. ${schemaGroup.label} types, e.g. ${schema.type}`, () => {
          beforeEach(() => {
            mount(<SchemaBuilderMount schema={schema} />);
          });

          it('should show the AVRO UI inputs', () => {
            // For all the Schema's properties, check input existence, label and value.
            INPUT_LISTS_DOC_REQUIRED[schema.type as Avro.COMPLEX]?.forEach(
              (fieldDetails) => {
                // @ts-ignore
                const valuePlain = schema[fieldDetails.name];
                const value = Array.isArray(valuePlain)
                  ? valuePlain.join(',')
                  : valuePlain;

                tu.cy
                  .getInput(fieldDetails.name)
                  .should('exist')
                  .find('label')
                  .should('have.text', fieldDetails.label)
                  .parent()
                  .find('input')
                  .should('have.value', value);
              }
            );

            // Check validity. Input each of the invalid values, submit (once), then check the error messages.
            // @ts-ignore
            const invalidValuesSet = schemaGroup.data.invalid[typeName];
            // @ts-ignore
            Object.values(invalidValuesSet).forEach((invalidValues, i) => {
              // @ts-ignore
              Object.keys(invalidValues).forEach((propertyName) => {
                tu.cy.getInput(propertyName).find('input').type(
                  // @ts-ignore
                  `{selectall}{backspace}${invalidValues[propertyName].value}`
                );
              });
              if (i === 0) tu.cy.submitForm();
              // @ts-ignore
              Object.keys(invalidValues).forEach((typeName) => {
                tu.cy
                  .getInput(typeName)
                  .find(
                    // @ts-ignore
                    `.Mui-error:contains("${invalidValues[typeName].error}")`
                  )
                  .should('exist');
              });
            });
          });
        });
      });
    });

    describe('with Schemas that have validation with more extensive error messages', () => {
      describe('i.e. for name and namespace', () => {
        beforeEach(() => {
          mount(
            <SchemaBuilderMount
              schema={SCHEMA_GROUPS_CHANGEABLE.complex.data.valid.enum}
            />
          );
        });

        it('should show additional info on the errors', () => {
          const invalidValues =
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            SCHEMA_GROUPS_CHANGEABLE.complex.data.invalid.enum![2];
          // @ts-ignore
          Object.keys(invalidValues).forEach((propertyName) => {
            tu.cy.getInput(propertyName).find('input').type(
              // @ts-ignore
              `{selectall}{backspace}${invalidValues[propertyName].value}`
            );
          });
          tu.cy.submitForm();
          cy.get(':contains("Name format:")')
            .should('exist')
            .parent()
            .find(
              ':contains("Non-accented character or underscore, followed by any amount of non-accented characters, numbers or underscores mixed.")'
            )
            .should('exist');
        });
      });
    });

    // Type select.
    Object.values(SCHEMAS_RECURSIVE).forEach((schemaData) => {
      describe(`and are recursive, like ${schemaData.schema.type}`, () => {
        beforeEach(() => {
          mount(<SchemaBuilderMount schema={schemaData.schema} />);
        });

        it('should show the type select', () => {
          tu.cy
            .getInput(schemaData.typePath)
            .should('exist')
            .click()
            .find('input')
            .should('have.value', '');

          // Select Boolean.
          tu.cy.selectType(`${schemaData.typePath}-menu-list`, 'boolean');
          tu.cy.checkSelectedType(schemaData.typePath, 'boolean');

          // Select Int.
          tu.cy.selectType(`${schemaData.typePath}-menu-list`, 'int');
          tu.cy.checkSelectedType(schemaData.typePath, 'boolean,int');

          // Deselect Boolean.
          tu.cy.selectType(`${schemaData.typePath}-menu-list`, 'boolean');
          tu.cy.checkSelectedType(schemaData.typePath, 'int');

          // Select Fixed.
          tu.cy.selectType(`${schemaData.typePath}-menu-list`, 'fixed +');
          tu.cy.checkSelectedType(schemaData.typePath, 'int,fixed');

          // Select Fixed.
          tu.cy.selectType(`${schemaData.typePath}-menu-list`, 'fixed +');
          tu.cy.checkSelectedType(schemaData.typePath, 'int,fixed 1,fixed 2');

          // Check resulting UI for both Fixed types.
          [1, 2].forEach((number) => {
            tu.cy
              .getInput(`${schemaData.typePath}-${number}-name`)
              .should('have.class', 'level-2')
              .parent()
              .parent()
              .should('have.class', 'level-2')
              .within(() => {
                cy.get('[data-testid="SubdirectoryArrowRightIcon"]').should(
                  'exist'
                );
                cy.get(`:contains("fixed ${number}:")`).should('exist');
              });
          });

          // Deselect all.
          tu.cy.selectType(`${schemaData.typePath}-menu-list`, 'int');
          tu.cy.selectType(`${schemaData.typePath}-menu-list`, 'fixed 1');
          tu.cy.selectType(`${schemaData.typePath}-menu-list`, 'fixed');
          // Hide type select menu by clicking on the menu (transparent) backdrop (left top to not click on menu itself).
          tu.cy
            .getInput(`${schemaData.typePath}-menu-list`)
            .parent()
            .parent()
            .click(10, 10);
          // Submit and check for error.
          tu.cy.submitForm();
          tu.cy
            .getInput(schemaData.typePath)
            .find(`.Mui-error:contains("Required")`)
            .should('exist');
        });
      });
    });
  });

  describe('with Record', () => {
    beforeEach(() => {
      mount(
        <SchemaBuilderMount
          schema={SCHEMA_GROUPS_CHANGEABLE.complex.data.valid.record}
        />
      );
    });

    it('should allow to add and remove fields', () => {
      tu.cy.checkNumberOfFields(1);

      // Add.
      cy.get(':contains("Add field")')
        .parent()
        .find('[data-testid="AddCircleIcon"]')
        .should('exist')
        .click()
        .click();
      tu.cy.checkNumberOfFields(3);

      // Remove.
      const name = (
        SCHEMA_GROUPS_CHANGEABLE.complex.data.valid.record as Avro.Record
      ).fields[0].name;
      tu.cy.checkInputValue('fields-0-name', name);
      cy.get(':contains("Fields")')
        .next('.bullet')
        .find('[data-testid="RemoveCircleIcon"]')
        .click({ force: true });
      tu.cy.checkInputValue('fields-0-name', '');
      tu.cy.checkNumberOfFields(2);
    });
  });

  describe('with nested Schemas', () => {
    // Get each of the recursive types and populate the type with nested Schemas.
    // Then test for deepest name inputs.
    Object.values(SCHEMAS_RECURSIVE).forEach((schemaData) => {
      describe(`on ${schemaData.schema.type}`, () => {
        const schemaRecursive = tu.copyJSON(schemaData.schema) as Avro.Schema;
        tu.setProperty(
          schemaRecursive as Avro.Object,
          schemaData.typePath,
          SCHEMA_NESTED
        );

        beforeEach(() => {
          mount(<SchemaBuilderMount schema={schemaRecursive} />);
        });

        it('should show the AVRO UI inputs nested', () => {
          tu.cy.checkInputValue(
            `${schemaData.typePath}-0-items-0-values-0-name`,
            'nested_record'
          );
          tu.cy.checkInputValue(
            `${schemaData.typePath}-0-items-0-values-0-fields-0-name`,
            'int_field'
          );
        });
      });
    });
  });
});
