import * as yup from 'yup';
import {
  ID_PATH_ROOT,
  VALIDATION_SCHEMA_AVRO_DOC_REQUIRED,
  VALIDATION_SCHEMA_JSON_AVRO,
} from 'src/components/SchemaBuilder/SchemaBuilder.constants';

function checkError(errorMessage: string): void {
  cy.get(`.Mui-error:contains("${errorMessage}")`).should('exist');
}

function checkInputValue(inputPath: string, value: string): void {
  getInput(inputPath).find('input').should('have.value', value);
}

function checkIsValid(): void {
  cy.get('[data-test-id="schema-builder-container"] .Mui-error').should(
    'not.exist'
  );
  getSubmitButton().should('not.be.disabled');
}

function checkNumberOfFields(number: number): void {
  cy.get(':contains("Fields")')
    .nextUntil(':not(.bullet)')
    .should('have.length', number);
}

function checkSelectedType(inputPath: string, type: string): void {
  getInput(inputPath).find('input').should('have.value', type);
}

function clearSchemaJSON(): void {
  inputSchemaJSON('{selectall}{backspace}', true);
}

function copyJSON(json: object): object {
  return JSON.parse(JSON.stringify(json));
}

function getAvroUI(): Cypress.Chainable<JQuery<HTMLElement>> {
  return cy.get(`[data-test-id="${ID_PATH_ROOT}-avro-ui"]`);
}

function getInput(inputPath: string): Cypress.Chainable<JQuery<HTMLElement>> {
  return cy.get(`[data-test-id="${ID_PATH_ROOT}-${inputPath}"]`);
}

function getJSONInput(): Cypress.Chainable<JQuery<HTMLElement>> {
  return cy.get(`[data-test-id="${ID_PATH_ROOT}-json-input"]`);
}

function getSubmitButton(): Cypress.Chainable<JQuery<HTMLElement>> {
  return cy.get('[data-test-id="schema-builder-button-submit"]');
}

function getValidationSchema(
  checkIsValidationEnabled: () => boolean
): yup.AnyObject {
  return yup.lazy(() => {
    if (!checkIsValidationEnabled()) return yup.mixed();

    return yup.object({
      schemaJSON: VALIDATION_SCHEMA_JSON_AVRO,
      schema: VALIDATION_SCHEMA_AVRO_DOC_REQUIRED,
    });
  });
}

function inputSchemaJSON(
  value: string,
  parseSpecialCharSequences = false
): Cypress.Chainable<JQuery<HTMLElement>> {
  return getJSONInput().type(value, {
    delay: 1,
    parseSpecialCharSequences,
  });
}

function isObjectNotEmpty(object: object): boolean {
  return typeof object === 'object' && Object.keys(object).length > 0;
}

function selectType(
  inputPath: string,
  type: string
): Cypress.Chainable<JQuery<HTMLLIElement>> {
  return (
    getInput(inputPath)
      .find('li')
      // With regex to do strict string matching, to not have Named unnumbered type select both the type and the option to add one.
      .contains(
        new RegExp(
          '^' + type.replaceAll(' ', '\\s').replace('+', '\\+' + '$'),
          'g'
        )
      )
      .click()
  );
}

function setProperty(object: object, path: string, value: any) {
  let i;
  const pathFragments: (number | string)[] = path.includes('-')
    ? path.split('-')
    : [path];
  let nestedObject = object;
  for (i = 0; i < pathFragments.length - 1; i++) {
    // @ts-ignore
    nestedObject = nestedObject[pathFragments[i]];
  }

  // @ts-ignore
  nestedObject[pathFragments[i]] = value;
}

function submitForm(): Cypress.Chainable<JQuery<HTMLElement>> {
  return getSubmitButton().scrollIntoView().click();
}

function toggleUI(): Cypress.Chainable<JQuery<HTMLElement>> {
  return cy.get(`[data-test-id="${ID_PATH_ROOT}-ui-toggle"]`).click();
}

export const testUtils = {
  copyJSON,
  getValidationSchema,
  isObjectNotEmpty,
  setProperty,
  cy: {
    checkError,
    checkInputValue,
    checkIsValid,
    checkNumberOfFields,
    checkSelectedType,
    clearSchemaJSON,
    getAvroUI,
    getInput,
    getJSONInput,
    inputSchemaJSON,
    selectType,
    submitForm,
    toggleUI,
  },
};
