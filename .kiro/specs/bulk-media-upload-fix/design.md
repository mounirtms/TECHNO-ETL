# Design Document

## Overview

The bulk media upload system will be redesigned to eliminate the professional/basic mode complexity and focus on a single, advanced matching system that automatically adapts to different CSV structures. The core issue of only finding one match will be resolved by fixing the matching algorithm logic and improving the file processing workflow.

## Architecture

### Component Structure
```
BulkMediaUploadDialog (Simplified)
├── CSV Upload Step
├── Image Upload Step  
├── Advanced Matching Step (Unified)
├── Upload Process Step
└── Settings Panel (Always Advanced)
```

### Service Layer
```
MediaUploadService (Consolidated)
├── CSV Parser (Auto-detection)
├── Advanced Matching Engine
├── File Validation
└── Upload Manager
```

## Components and Interfaces

### 1. BulkMediaUploadDialog Component

**Purpose:** Simplified dialog with unified advanced matching
**Key Changes:**
- Remove mode selection (professional/basic)
- Always use advanced matching strategies
- Auto-detect CSV structure without user intervention
- Fix matching algorithm to find ALL matches, not just one

**Props Interface:**
```typescript
interface BulkMediaUploadDialogProps {
  open: boolean;
  onClose: () => void;
  onComplete: (results: UploadResult[]) => void;
}
```

### 2. Advanced Matching Engine

**Purpose:** Unified matching system that replaces mode-based logic
**Key Features:**
- Automatic CSV structure detection
- Multiple matching strategies running in parallel
- Support for multiple images per SKU
- Proper similarity scoring and ranking

**Matching Strategies:**
1. **Exact Match:** Direct SKU to filename matching
2. **Normalized Match:** Remove special characters and match
3. **Fuzzy Match:** Similarity-based matching with configurable threshold
4. **REF Column Match:** Automatic when REF column detected
5. **Multiple Image Support:** Handle _1, _2, _3 patterns

### 3. Settings Configuration

**Purpose:** Advanced settings always available, no mode switching
**Configuration Structure:**
```javascript
const ADVANCED_MATCHING_SETTINGS = {
  strategies: {
    exact: true,
    normalized: true, 
    fuzzy: true,
    ref: true, // Auto-enabled when REF column found
    multipleImages: true
  },
  thresholds: {
    fuzzyThreshold: 0.7,
    minKeyLength: 3,
    maxMatches: 10 // Prevent infinite matches
  },
  fileHandling: {
    caseSensitive: false,
    removeSpecialChars: true,
    supportNumberedImages: true
  }
}
```

## Data Models

### CSV Data Structure
```typescript
interface CSVData {
  headers: string[];
  data: CSVRow[];
  detectedColumns: {
    sku: string;
    image?: string;
    name?: string;
    ref?: string; // Auto-detected
  };
  totalRows: number;
}

interface CSVRow {
  [key: string]: string;
  _index: number;
}
```

### Match Result Structure
```typescript
interface MatchResult {
  sku: string;
  file: File;
  productName: string;
  matchStrategy: 'exact' | 'normalized' | 'fuzzy' | 'ref';
  confidence: number;
  imageIndex: number; // For multiple images (0, 1, 2...)
  totalImagesForSku: number;
  isMainImage: boolean;
}

interface MatchingStats {
  totalMatches: number;
  uniqueProducts: number;
  averageConfidence: number;
  strategyBreakdown: {
    exact: number;
    normalized: number;
    fuzzy: number;
    ref: number;
  };
  multipleImageProducts: number;
}
```

## Error Handling

### 1. CSV Processing Errors
- Invalid file format detection
- Missing required columns handling
- Empty or malformed data recovery
- Clear error messages with suggested fixes

### 2. Image Processing Errors
- File type validation with specific error messages
- File size limit enforcement
- Corrupted file detection
- Batch processing error isolation

### 3. Matching Process Errors
- No matches found scenarios
- Ambiguous matches resolution
- Performance timeout handling
- Memory usage optimization

### 4. Upload Process Errors
- Network failure recovery
- Partial upload handling
- Progress tracking accuracy
- Result validation

## Testing Strategy

### 1. Unit Tests
- CSV parsing with various formats
- Matching algorithm accuracy
- File validation logic
- Settings configuration handling

### 2. Integration Tests
- End-to-end upload workflow
- Error scenario handling
- Performance with large datasets
- UI responsiveness during processing

### 3. Performance Tests
- Large CSV file processing (1000+ products)
- Multiple image handling (100+ images)
- Memory usage optimization
- UI responsiveness benchmarks

### 4. User Experience Tests
- Intuitive workflow validation
- Error message clarity
- Progress indication accuracy
- Results presentation effectiveness

## Implementation Approach

### Phase 1: Core Fixes
1. Fix the matching algorithm to find ALL matches instead of just one
2. Remove professional/basic mode switching
3. Consolidate into single advanced matching system
4. Fix TypeScript errors and syntax issues

### Phase 2: Algorithm Enhancement
1. Improve fuzzy matching accuracy
2. Add support for multiple image patterns
3. Optimize performance for large datasets
4. Add comprehensive error handling

### Phase 3: UI/UX Improvements
1. Simplify interface by removing mode selection
2. Enhance progress indicators
3. Improve results display
4. Add better error messaging

### Phase 4: Code Cleanup
1. Remove unused professional mode code
2. Consolidate service files
3. Clean up redundant components
4. Update documentation

## Performance Considerations

### Memory Management
- Process images in batches to prevent memory overflow
- Clean up temporary file references
- Optimize large CSV processing

### UI Responsiveness
- Use Web Workers for heavy processing
- Implement proper loading states
- Batch UI updates to prevent blocking

### Algorithm Efficiency
- Optimize string matching algorithms
- Cache normalized strings
- Limit matching iterations for performance

## Security Considerations

### File Validation
- Strict file type checking
- File size limits enforcement
- Malicious file detection
- Content validation

### Data Processing
- Input sanitization
- Memory limit enforcement
- Process isolation
- Error information filtering