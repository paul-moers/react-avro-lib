import * as Avro from 'src/components/SchemaBuilder/SchemaBuilder.schema.types';
import * as yup from 'yup';
import CssBaseline from '@mui/material/CssBaseline';
import React from 'react';
import { Button } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { FormikHelpers, useFormik } from 'formik';
import { FormikProps } from 'formik/dist/types';
import { SCHEMA_GROUPS_CHANGEABLE } from '../tests/cypress/mocks/AvroSchema';
import { storiesOf } from '@storybook/react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import {
  SchemaBuilder,
  VALIDATION_SCHEMA_AVRO_DOC_REQUIRED,
  VALIDATION_SCHEMA_JSON_AVRO,
} from '../src';

export type FormValues = {
  schema?: Avro.Schema;
  schemaJSON?: string;
};

const stories = storiesOf('AvroBuilder', module);
const appTheme = createTheme();

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

const initialValues: FormValues = {
  schema: SCHEMA_GROUPS_CHANGEABLE.complex.data.valid.enum,
  schemaJSON: undefined,
};
const onSubmit = (
  values: FormValues,
  actions: FormikHelpers<FormValues>
): void => {
  actions.setSubmitting(false);
};

const TestComponent: React.FC = () => {
  const formik: FormikProps<FormValues> = useFormik({
    enableReinitialize: true,
    initialValues,
    onSubmit,
    validationSchema: getValidationSchema(
      () => formik.submitCount > 0 // Prevent validation on blur/change until submit.
    ),
  });
  return (
    <StyledThemeProvider theme={appTheme}>
      <ThemeProvider theme={appTheme}>
        <CssBaseline />
        <form
          data-test-id='schema-builder-container'
          onSubmit={formik.handleSubmit}
          style={{ width: '90%', margin: '20px auto 0' }}
        >
          <SchemaBuilder
            formik={formik}
            namePath='schema'
            namePathJSON='schemaJSON'
          />
          <Button
            data-test-id='schema-builder-button-submit'
            disabled={
              (!formik.isValid && formik.submitCount > 0) || formik.isSubmitting
            }
            type='submit'
          >
            Submit
          </Button>
        </form>
      </ThemeProvider>
    </StyledThemeProvider>
  );
};

stories.add('Simple schema', () => <TestComponent />);
