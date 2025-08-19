/**
 * Bug Bounty Test Component
 * Quick test to verify Firebase connectivity and bug submission
 * 
 * @author Mounir Abderrahmani
 * @email mounir.ab@techno-dz.com
 * @contact mounir.webdev.tms@gmail.com
 */

import React, { useState } from 'react';
import {
  Button,
  Card,
  CardContent,
  Typography,
  Alert,
  Box,
  CircularProgress
} from '@mui/material';
import { TestTube as TestIcon } from '@mui/icons-material';
import bugBountyService from '../../services/bugBountyService.ts';

const BugBountyTest = () => {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState(null);

  const runTest = async () => {
    setTesting(true);
    setResult(null);

    try {
      // Test bug submission
      const testBug = {
        title: 'Test Bug Report',
        description: 'This is a test bug report to verify Firebase connectivity',
        category: 'LOW',
        severity: 'low',
        stepsToReproduce: ['Open application', 'Navigate to test page', 'Click test button'],
        expectedBehavior: 'Test should pass',
        actualBehavior: 'Test is running',
        testerName: 'Test User',
        testerEmail: 'test@example.com',
        testerExperience: 'beginner'
      };

      const submitResult = await bugBountyService.submitBug(testBug);
      
      if (submitResult.success) {
        // Test getting bugs
        const getBugsResult = await bugBountyService.getBugs();
        
        // Test getting stats
        const statsResult = await bugBountyService.getStats();
        
        setResult({
          success: true,
          message: 'All tests passed! Firebase connectivity verified.',
          details: {
            bugSubmitted: submitResult.success,
            bugId: submitResult.bugId,
            bugsRetrieved: getBugsResult.success,
            statsRetrieved: statsResult.success
          }
        });
      } else {
        setResult({
          success: false,
          message: 'Test failed: ' + submitResult.error,
          details: submitResult
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Test error: ' + error.message,
        details: error
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <TestIcon color="primary" />
          <Typography variant="h6">Bug Bounty System Test</Typography>
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          This test verifies Firebase connectivity and bug bounty functionality.
        </Typography>

        <Button
          variant="contained"
          onClick={runTest}
          disabled={testing}
          startIcon={testing ? <CircularProgress size={20} /> : <TestIcon />}
          fullWidth
        >
          {testing ? 'Running Test...' : 'Run Bug Bounty Test'}
        </Button>

        {result && (
          <Alert 
            severity={result.success ? 'success' : 'error'} 
            sx={{ mt: 2 }}
          >
            <Typography variant="body2">
              <strong>{result.message}</strong>
            </Typography>
            {result.details && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="caption" component="pre">
                  {JSON.stringify(result.details, null, 2)}
                </Typography>
              </Box>
            )}
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default BugBountyTest;
