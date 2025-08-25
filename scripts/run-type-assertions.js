/**
 * Type Assertion Test Runner
 * 
 * This script compiles and runs type assertion tests to verify
 * that TypeScript types are working as expected.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

console.log(chalk.blue('🧪 Running TypeScript Type Assertion Tests'));

// Configuration
const TEST_FILES_PATTERN = 'src/**/*.test.ts';
const OUTPUT_REPORT = 'type-assertion-report.json';

// Find all test files
const findTestFiles = () => {
  try {
    const output = execSync(`npx glob ${TEST_FILES_PATTERN}`, { encoding: 'utf8' });
    return output.split('\n').filter(Boolean);
  } catch (error) {
    console.error(chalk.red('Error finding test files:'), error.message);
    process.exit(1);
  }
};

// Compile a test file to check for type errors
const compileTestFile = (filePath) => {
  try {
    console.log(chalk.cyan(`Compiling ${filePath}...`));
    execSync(`npx tsc ${filePath} --noEmit --pretty`, { 
      stdio: ['ignore', 'pipe', 'pipe'] 
    });
    return { 
      filePath, 
      success: true 
    };
  } catch (error) {
    return {
      filePath,
      success: false,
      errors: error.stderr.toString() || error.stdout.toString()
    };
  }
};

// Count type assertions in a file
const countAssertions = (filePath) => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const assertTypeCount = (content.match(/assertType\(/g) || []).length;
    const assertAssignableCount = (content.match(/assertAssignable\(/g) || []).length;
    const assertNotAssignableCount = (content.match(/assertNotAssignable\(/g) || []).length;
    const tsExpectErrorCount = (content.match(/@ts-expect-error/g) || []).length;
    
    return {
      total: assertTypeCount + assertAssignableCount + assertNotAssignableCount + tsExpectErrorCount,
      details: {
        assertType: assertTypeCount,
        assertAssignable: assertAssignableCount,
        assertNotAssignable: assertNotAssignableCount,
        tsExpectError: tsExpectErrorCount
      }
    };
  } catch (error) {
    console.error(chalk.red(`Error counting assertions in ${filePath}:`), error.message);
    return { total: 0, details: {} };
  }
};

// Main execution
try {
  // Find all test files
  const testFiles = findTestFiles();
  console.log(chalk.green(`Found ${testFiles.length} type assertion test files`));
  
  // Compile each test file and collect results
  const results = [];
  let totalAssertions = 0;
  let totalFiles = testFiles.length;
  let successFiles = 0;
  
  for (const file of testFiles) {
    const result = compileTestFile(file);
    const assertionCount = countAssertions(file);
    totalAssertions += assertionCount.total;
    
    results.push({
      ...result,
      assertions: assertionCount
    });
    
    if (result.success) {
      successFiles++;
      console.log(chalk.green(`✓ ${file} (${assertionCount.total} type assertions)`));
    } else {
      console.log(chalk.red(`✗ ${file}`));
      console.log(chalk.yellow(result.errors));
    }
  }
  
  // Generate report
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalFiles,
      successFiles,
      failedFiles: totalFiles - successFiles,
      totalAssertions,
      success: successFiles === totalFiles
    },
    results
  };
  
  fs.writeFileSync(OUTPUT_REPORT, JSON.stringify(report, null, 2));
  
  // Print summary
  console.log('\n' + chalk.bold('Type Assertion Test Summary:'));
  console.log(chalk.cyan(`Total Test Files: ${totalFiles}`));
  console.log(chalk.green(`Success: ${successFiles}`));
  
  if (successFiles !== totalFiles) {
    console.log(chalk.red(`Failed: ${totalFiles - successFiles}`));
    console.log(chalk.yellow(`Report saved to ${OUTPUT_REPORT}`));
    process.exit(1);
  }
  
  console.log(chalk.green(`Total Type Assertions: ${totalAssertions}`));
  console.log(chalk.blue('All type assertion tests passed! ✨'));
  
  process.exit(0);
} catch (error) {
  console.error(chalk.red('Error running type assertion tests:'), error);
  process.exit(1);
}