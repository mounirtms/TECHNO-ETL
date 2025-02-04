import React from 'react';
import { Highlight, themes } from 'prism-react-renderer';
import { Box, IconButton, Tooltip, useTheme } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const CodeBlock = ({ code, language }) => {
  const theme = useTheme();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  return (
    <Box
      sx={{
        position: 'relative',
        my: 2,
        '&:hover .copy-button': {
          opacity: 1,
        },
      }}
    >
      <Tooltip title="Copy code" placement="top">
        <IconButton
          onClick={handleCopy}
          className="copy-button"
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            opacity: 0,
            transition: 'opacity 0.2s',
            color: 'grey.500',
            bgcolor: 'background.paper',
            '&:hover': {
              bgcolor: 'background.paper',
              color: 'primary.main',
            },
          }}
        >
          <ContentCopyIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Highlight
        theme={themes.nightOwl}
        code={code.trim()}
        language={language}
      >
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <Box
            component="pre"
            className={className}
            sx={{
              ...style,
              m: 0,
              p: 2,
              borderRadius: 2,
              overflow: 'auto',
              fontSize: '0.9rem',
              lineHeight: 1.5,
              '& .token-line': {
                minHeight: '1.5em',
              },
            }}
          >
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })}>
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token })} />
                ))}
              </div>
            ))}
          </Box>
        )}
      </Highlight>
    </Box>
  );
};

export default CodeBlock;
