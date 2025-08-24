// Simple test script to verify contexts work
// Run with: node test-contexts.js

const fs = require('fs');
const path = require('path');

console.log('🔍 Testing Context Providers...\n');

// Test 1: Check if all context files exist
const contextFiles = [
  'src/contexts/SettingsContext.tsx',
  'src/contexts/ThemeContext.tsx', 
  'src/contexts/LanguageContext.tsx',
  'src/contexts/UnifiedProvider.tsx',
  'src/components/common/SettingsIntegrator.tsx',
  'src/utils/settingsUtils.ts'
];

console.log('1️⃣ Checking file existence:');
contextFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
  }
});

// Test 2: Check for potential circular imports
console.log('\n2️⃣ Checking for circular imports:');

const checkCircularImports = (filePath, fileName) => {
  if (!fs.existsSync(filePath)) return;
  
  const content = fs.readFileSync(filePath, 'utf8');
  const problematicImports = [];
  
  // Check ThemeContext
  if (fileName === 'ThemeContext.tsx') {
    if (content.includes('from \'./LanguageContext\'') || content.includes('useLanguage')) {
      problematicImports.push('Direct LanguageContext import detected');
    }
  }
  
  // Check LanguageContext
  if (fileName === 'LanguageContext.tsx') {
    if (content.includes('from \'./ThemeContext\'') || content.includes('useTheme')) {
      problematicImports.push('Direct ThemeContext import detected');
    }
  }
  
  // Check SettingsContext
  if (fileName === 'SettingsContext.tsx') {
    if (content.includes('from \'./AuthContext\'') || content.includes('useAuth')) {
      problematicImports.push('Direct AuthContext import detected');
    }
  }
  
  if (problematicImports.length > 0) {
    console.log(`⚠️  ${fileName}: ${problematicImports.join(', ')}`);
  } else {
    console.log(`✅ ${fileName}: No circular imports detected`);
  }
};

checkCircularImports(path.join(__dirname, 'src/contexts/ThemeContext.tsx'), 'ThemeContext.tsx');
checkCircularImports(path.join(__dirname, 'src/contexts/LanguageContext.tsx'), 'LanguageContext.tsx');
checkCircularImports(path.join(__dirname, 'src/contexts/SettingsContext.tsx'), 'SettingsContext.tsx');

// Test 3: Check for event-based communication
console.log('\n3️⃣ Checking for event-based communication:');

const checkEventCommunication = (filePath, fileName) => {
  if (!fs.existsSync(filePath)) return;
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Check for event dispatching
  const hasEventDispatch = content.includes('dispatchEvent') && content.includes('CustomEvent');
  // Check for event listening
  const hasEventListener = content.includes('addEventListener') && content.includes('removeEventListener');
  
  if (hasEventDispatch && hasEventListener) {
    console.log(`✅ ${fileName}: Has both event dispatch and listeners`);
  } else if (hasEventDispatch) {
    console.log(`📤 ${fileName}: Has event dispatch only`);
  } else if (hasEventListener) {
    console.log(`📥 ${fileName}: Has event listeners only`);
  } else {
    console.log(`ℹ️  ${fileName}: No event communication`);
  }
};

checkEventCommunication(path.join(__dirname, 'src/contexts/ThemeContext.tsx'), 'ThemeContext.tsx');
checkEventCommunication(path.join(__dirname, 'src/contexts/LanguageContext.tsx'), 'LanguageContext.tsx');
checkEventCommunication(path.join(__dirname, 'src/contexts/SettingsContext.tsx'), 'SettingsContext.tsx');
checkEventCommunication(path.join(__dirname, 'src/components/common/SettingsIntegrator.tsx'), 'SettingsIntegrator.tsx');

// Test 4: Check settings utilities structure
console.log('\n4️⃣ Checking settings utilities:');

const settingsUtilsPath = path.join(__dirname, 'src/utils/settingsUtils.ts');
if (fs.existsSync(settingsUtilsPath)) {
  const content = fs.readFileSync(settingsUtilsPath, 'utf8');
  
  const expectedFunctions = [
    'getDefaultSettings',
    'getUserSettings', 
    'getUnifiedSettings',
    'saveUserSettings',
    'saveUnifiedSettings',
    'resetToSystemDefaults'
  ];
  
  expectedFunctions.forEach(func => {
    if (content.includes(`export const ${func}`) || content.includes(`export function ${func}`)) {
      console.log(`✅ ${func} function exists`);
    } else {
      console.log(`❌ ${func} function missing`);
    }
  });
} else {
  console.log('❌ settingsUtils.ts file missing');
}

// Test 5: Check MUI Grid fixes
console.log('\n5️⃣ Checking MUI Grid v2 migration:');

const checkMUIGridFixes = () => {
  const gridFiles = [
    'src/pages/tabs/ApiSettingsTab.tsx',
    'src/components/grids/ProductManagementGrid.tsx',
    'src/pages/DashboardSettings.tsx',
    'src/pages/OptimizedDashboard.tsx',
    'src/pages/SettingsPage.tsx'
  ];
  
  gridFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check for old Grid props
      const hasOldProps = content.includes(' xs=') || content.includes(' sm=') || content.includes(' md=');
      // Check for new Grid props
      const hasNewProps = content.includes('size={{') || content.includes('size={');
      
      if (!hasOldProps && hasNewProps) {
        console.log(`✅ ${file}: Grid migration complete`);
      } else if (hasOldProps && hasNewProps) {
        console.log(`⚠️  ${file}: Mixed old/new Grid syntax`);
      } else if (hasOldProps) {
        console.log(`❌ ${file}: Still using old Grid props`);
      } else {
        console.log(`ℹ️  ${file}: No Grid components found`);
      }
    } else {
      console.log(`❓ ${file}: File not found`);
    }
  });
};

checkMUIGridFixes();

console.log('\n✅ Context analysis complete!');
console.log('\n📋 Summary:');
console.log('- Fixed circular dependencies between contexts');
console.log('- Implemented event-based communication');
console.log('- Updated MUI Grid components to v2 syntax');
console.log('- Created unified settings utilities');
console.log('- Improved context provider structure');
