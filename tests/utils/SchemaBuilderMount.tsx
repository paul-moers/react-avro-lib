import * as Avro from 'src/components/SchemaBuilder/SchemaBuilder.schema.types';
import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { Button } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { FormikHelpers, useFormik } from 'formik';
import { FormikProps } from 'formik/dist/types';
import { testUtils as tu } from './AvroSchema.utils';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { SchemaBuilder, SchemaBuilderProps } from 'src';

const appTheme = createTheme();

export type FormValues = {
  schema?: Avro.Schema;
  schemaJSON?: string;
};

export type SchemaBuilderMountProps = Omit<
  SchemaBuilderProps,
  'formik' | 'namePath' | 'namePathJSON'
> & {
  readonly schema: Avro.Schema | undefined;
  readonly schemaJSON?: string;
};

export default function SchemaBuilderMount({
  docRequired = true,
  schema,
  schemaJSON,
  ...rest
}: SchemaBuilderMountProps): React.ReactElement {
  const initialValues: FormValues = {
    schema,
    schemaJSON,
  };
  const onSubmit = async (
    values: FormValues,
    actions: FormikHelpers<FormValues>
  ): Promise<void> => {
    if (formik.submitCount === 1) {
      const errors = await formik.validateForm();
      if (tu.isObjectNotEmpty(errors)) {
        return;
      }
    }
    actions.setSubmitting(false);
  };

  const formik: FormikProps<FormValues> = useFormik({
    initialValues,
    onSubmit,
    validationSchema: tu.getValidationSchema(() => {
      return formik.submitCount > 0; // Prevent validation on blur/change until submit.
    }),
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
            docRequired={docRequired}
            formik={formik}
            namePath='schema'
            namePathJSON='schemaJSON'
            {...rest}
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
}
