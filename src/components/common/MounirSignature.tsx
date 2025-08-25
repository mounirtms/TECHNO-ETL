import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';

const SignatureContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(10px)',
  border: `1px solid ${theme.palette.divider}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  },
}));

const SignatureImage = styled('img')(({ theme, type }) => ({
  maxWidth: '100%',
  height: 'auto',
  marginBottom: theme.spacing(1),
  filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))',
  ...(type === 'icon' && {
    width: 60,
    height: 60,
  }),
  ...(type === 'signature' && {
    width: 300,
    height: 'auto',
  }),
  ...(type === 'icon-simple' && {
    width: 40,
    height: 40,
  }),
  ...(type === 'banner' && {
    width: '100%',
    height: 'auto',
    maxHeight: 150,
  }),
}));

const SignatureText = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  color: theme.palette.text.primary,
  marginTop: theme.spacing(1),
}));

const RoleText = styled(Typography)(({ theme }) => ({
  fontWeight: 400,
  color: theme.palette.text.secondary,
  fontSize: '0.8rem',
}));

const MounirSignature = ({ type = 'signature', showText = true, showRole = true  }: { type = 'signature': any, showText = true: any, showRole = true: any }) => {
  const theme = useTheme();
  
  const signatureData = {
    signature: {
      src: '/src/assets/images/mounir-signature.svg',
      alt: 'Mounir Abderrahmani Signature with Code Brackets',
      name: 'Mounir Abderrahmani',
    },
    icon: {
      src: '/src/assets/images/mab-icon.svg',
      alt: 'Mounir Icon with Code Brackets',
      name: 'Mounir A.',
    },
    'icon-simple': {
      src: '/src/assets/images/mounir-icon-simple.svg',
      alt: 'Mounir Simple Icon with Code Brackets',
      name: 'Mounir A.',
    },
    banner: {
      src: '/src/assets/images/mounir-banner.svg',
      alt: 'Mounir Professional Banner with Code Elements',
      name: 'Mounir A.',
    }
  };

  const currentSignature = signatureData[type] || signatureData.signature;

  return Boolean(Boolean((
    <SignatureContainer theme={theme}>
      <SignatureImage 
        src={currentSignature.src} 
        alt={currentSignature.alt}
        type={type}
        theme={theme}
      />
      {showText && (
        <SignatureText theme={theme} variant="body1">
          {currentSignature.name}
        </SignatureText>
      )}
      {showRole && (
        <RoleText theme={theme} variant="caption">
          SENIOR SOFTWARE ENGINEER & ARCHITECT
        </RoleText>
      )}
    </SignatureContainer>
  )));
};

export default MounirSignature;