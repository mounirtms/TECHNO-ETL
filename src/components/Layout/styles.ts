import { styled } from '@mui/material/styles';

export const Root = styled('div')(({ theme }) => ({
  display: 'flex',
}));

export const Toolbar = styled('div')(({ theme }) => ({
  ...theme.mixins.toolbar,
}));

export const Content = styled('main')(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
}));
