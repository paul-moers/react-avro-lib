import styled from 'styled-components';
import {
  Box,
  FormHelperText,
  MenuItem as MUIMenuItem,
  TextField as MUITextField,
  Typography,
  alpha,
} from '@mui/material';

export const ButtonAdd = styled(Box)`
  color: ${({ theme }) => theme.palette.primary.light};
  cursor: pointer;
  display: inline-block;
  margin: ${({ theme }) => theme.spacing(1, 0)};
  transition: color 0.15s ease-in;

  :hover {
    color: ${({ theme }) => theme.palette.primary.dark};
  }

  svg {
    vertical-align: middle;
    margin: 0 4px 2px 0;
  }
`;

export const ButtonDelete = styled(Box).attrs({
  className: 'only-show-on-section-hover',
})`
  color: ${({ theme }) => theme.palette.grey[300]};
  cursor: pointer;
  margin-top: 16px;
  padding: 6px 4px 0px 3px;
  position: absolute;
  right: -20.5px;
  top: 0;
  transition: color 0.15s ease-in;

  svg {
    background: ${({ theme }) => theme.palette.common.white};
  }

  :hover {
    color: ${({ theme }) => theme.palette.error.main};
  }
`;

export const DropdownOption = styled(MUIMenuItem)`
  font-size: 12px;
  line-height: 10px;
`;

export const DropdownSeparator = styled.li`
  background-color: ${({ theme }) => theme.palette.grey[400]};
  height: 1px;
  margin: 4px 0;
`;

export const ErrorsInfoContainer = styled(FormHelperText)`
  color: ${({ theme }) => theme.palette.error.main};
  padding: 4px 0 8px;

  & > span {
    padding-top: 8px;
    display: flex;
    line-height: 12px;
  }
  & > span > span {
    display: block;
    white-space: nowrap;
    padding-right: 8px;
  }
`;

export const FieldsTitle = styled(Typography).attrs({
  variant: 'subtitle1',
})`
  font-size: 0.9rem;
  line-height: 1.35;
  margin-top: ${({ theme }) => theme.spacing(1)};

  &.level-1 {
    font-size: 1rem;
    line-height: 1.75;
  }
  &.level-2 {
    font-size: 0.95rem;
    line-height: 1.55;
  }
`;

export const Input = styled(MUITextField).attrs({
  InputLabelProps: { shrink: true },
  size: 'small',
})`
  width: auto;
  min-width: 75px;

  .MuiInputBase-input {
    font-size: 11px;
    padding: ${({ theme }) => theme.spacing(0.6, 0.6, 0.5, 0.6)};
    width: 100%;
  }
  &.level-1 > div > .MuiInputBase-input {
    font-size: 13px;
    padding: ${({ theme }) => theme.spacing(1, 1, 0.7, 1)};
  }
  &.level-2 > div > .MuiInputBase-input {
    font-size: 12px;
    padding: ${({ theme }) => theme.spacing(0.8, 0.8, 0.6, 0.8)};
  }

  .MuiSelect-select {
    font-size: 11px;
    line-height: 16px;
    padding: ${({ theme }) => theme.spacing(0.6, 2.6, 0.45, 0.6)} !important;
    width: 100%;
  }
  &.level-1 > div > .MuiSelect-select {
    font-size: 13px;
    line-height: 19px;
    padding: ${({ theme }) => theme.spacing(1, 3, 0.7, 1)} !important;
  }
  &.level-2 > div > .MuiSelect-select {
    font-size: 12px;
    line-height: 18px;
    padding: ${({ theme }) => theme.spacing(0.8, 2.8, 0.5, 0.8)} !important;
  }

  &.input-name > .MuiInputBase-root {
    background: ${({ theme }) => alpha(theme.palette.primary.light, 0.2)};
  }

  &.input-size {
    min-width: 50px;
  }
  // Don't have size with class 'size-05' smaller on level 2 as that would have the next input shift to the first row, causing poorer layout.
  &.level-2.input-size {
    flex-basis: 20%;
    flex-grow: 1;
  }

  &.input-type > .MuiInputBase-root {
    display: grid; // To prevent content from increasing size.
    background: ${({ theme }) => theme.palette.grey[300]};

    .MuiInputBase-input {
      width: auto; // To have the input not extend outside container.
    }
  }

  .MuiSelect-icon {
    right: 1px;
  }

  .MuiFormHelperText-root {
    margin: 0;
  }
` as typeof MUITextField; // Casting to fix weird type issue appearing with long CSS block.

export const Inputs = styled(Box)`
  display: flex;
  flex-wrap: wrap;
  width: 100%;

  & > .MuiFormControl-root {
    flex-basis: 20%;
    flex-grow: 1;
  }

  & > .size-05 {
    flex-basis: 10%;
    flex-grow: 0.5;
  }

  & > .size-2 {
    flex-basis: 40%;
    flex-grow: 2;
  }
`;

export const InputSection = styled(Box)`
  position: relative;
  width: 100%;

  &:not(.inline) {
    padding: ${({ theme }) => theme.spacing(1, 0)};
  }

  &.bullet {
    :before {
      content: '•';
      left: -13px;
      position: absolute;
      top: 17px;
    }

    .level-1:before {
      top: 21px;
    }
    .level-2:before {
      top: 19px;
    }
  }

  .MuiFormControl-root {
    margin: ${({ theme }) => theme.spacing(1, 0.5, 0, 0)};
  }

  .only-show-on-section-hover {
    display: none;
  }
  &:hover > .only-show-on-section-hover {
    display: block;
  }
`;

export const InputSubSection = styled(Box)`
  align-items: stretch;
  display: flex;
  padding: 10px 0 2px;
  position: relative;

  &.level-1 {
    padding: 12px 0 4px;
  }
  &.level-2 {
    padding: 11px 0 3px;
  }
`;

export const InputSubSectionLabel = styled(Box)`
  align-items: center;
  display: flex;
  margin: ${({ theme }) => theme.spacing(1, 0, 0, 1)};
  max-height: 24.5px;

  &.level-1 {
    max-height: 28px;
  }

  & > svg {
    color: ${({ theme }) => theme.palette.grey[500]};
    height: ${({ theme }) => theme.spacing(2)};
    width: ${({ theme }) => theme.spacing(2)};
  }

  & > span {
    color: ${({ theme }) => theme.palette.grey[500]};
    display: inline-block;
    line-height: 11px;
    padding-top: 2px;
    width: 57px;
  }

  ${({ theme }) => theme.typography.caption}
`;

export const RecordContainer = styled(Box)`
  border: 1px solid ${({ theme }) => theme.palette.grey[400]};
  box-sizing: content-box;
  margin: 10px -5px 0px -8px;
  padding: 16px 6px 0 10px;
  position: relative;
  width: 100%;

  &.level-1 {
    margin: 20px -10px;
  }
`;

export const SwitchContainer = styled(Box)`
  display: flex;
  justify-content: flex-end;

  .MuiFormControlLabel-root {
    margin-right: 0;
  }

  .error {
    .MuiSwitch-switchBase {
      color: ${({ theme }) => theme.palette.error.main};
    }
    .MuiSwitch-track {
      background-color: ${({ theme }) => theme.palette.error.dark};
    }
  }
`;

export const Textarea = styled(MUITextField)`
  margin: 32px 0 4px;

  & textarea {
    font-size: 12px;
    line-height: 14px;
  }
`;
