/**
 * RTL Context Unit Tests
 * Comprehensive tests for RTL functionality
 */

import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import '@testing-library/jest-dom';

import { 
  RTLProvider, 
  useRTL, 
  withRTL, 
  RTLBox, 
  RTLText,
  isRTLLanguage,
  getBrowserLanguage,
  detectRTL,
  createRTLUtils,
  RTL_LANGUAGES
} from '../RTLContext';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock navigator
Object.defineProperty(window, 'navigator', {
  value: {
    language: 'en-US',
    languages: ['en-US', 'en']
  },
  writable: true
});

describe('RTL Language Detection', () => {
  test('should detect RTL languages correctly', () => {
    expect(isRTLLanguage('ar')).toBe(true);
    expect(isRTLLanguage('he')).toBe(true);
    expect(isRTLLanguage('fa')).toBe(true);
    expect(isRTLLanguage('en')).toBe(false);
    expect(isRTLLanguage('fr')).toBe(false);
    expect(isRTLLanguage('ar-SA')).toBe(true); // Locale codes
    expect(isRTLLanguage('')).toBe(false);
    expect(isRTLLanguage(null)).toBe(false);
  });

  test('should get browser language', () => {
    expect(getBrowserLanguage()).toBe('en-US');
    
    // Test fallback
    Object.defineProperty(window, 'navigator', {
      value: {},
      writable: true
    });
    expect(getBrowserLanguage()).toBe('en');
  });

  test('should detect RTL from various sources', () => {
    // Test localStorage detection
    localStorageMock.getItem.mockReturnValue('true');
    expect(detectRTL()).toBe(true);
    
    localStorageMock.getItem.mockReturnValue('false');
    expect(detectRTL()).toBe(false);
    
    // Test HTML dir attribute
    localStorageMock.getItem.mockReturnValue(null);
    document.documentElement.dir = 'rtl';
    expect(detectRTL()).toBe(true);
    
    document.documentElement.dir = 'ltr';
    expect(detectRTL()).toBe(false);
    
    // Test browser language detection
    document.documentElement.dir = '';
    Object.defineProperty(window, 'navigator', {
      value: { language: 'ar-SA' },
      writable: true
    });
    expect(detectRTL()).toBe(true);
  });
});

describe('RTL Utils', () => {
  test('should create correct RTL utilities for LTR', () => {
    const utils = createRTLUtils(false);
    
    expect(utils.direction).toBe('ltr');
    expect(utils.opposite).toBe('rtl');
    expect(utils.marginLeft(10)).toEqual({ marginLeft: 10 });
    expect(utils.marginRight(10)).toEqual({ marginRight: 10 });
    expect(utils.textAlign('left')).toEqual({ textAlign: 'left' });
    expect(utils.textAlign('start')).toEqual({ textAlign: 'left' });
    expect(utils.flexDirection('row')).toEqual({ flexDirection: 'row' });
  });

  test('should create correct RTL utilities for RTL', () => {
    const utils = createRTLUtils(true);
    
    expect(utils.direction).toBe('rtl');
    expect(utils.opposite).toBe('ltr');
    expect(utils.marginLeft(10)).toEqual({ marginRight: 10 });
    expect(utils.marginRight(10)).toEqual({ marginLeft: 10 });
    expect(utils.textAlign('left')).toEqual({ textAlign: 'right' });
    expect(utils.textAlign('start')).toEqual({ textAlign: 'right' });
    expect(utils.flexDirection('row')).toEqual({ flexDirection: 'row-reverse' });
  });

  test('should handle conditional styling', () => {
    const ltrUtils = createRTLUtils(false);
    const rtlUtils = createRTLUtils(true);
    
    const rtlStyles = { color: 'red' };
    const ltrStyles = { color: 'blue' };
    
    expect(ltrUtils.when(rtlStyles, ltrStyles)).toEqual(ltrStyles);
    expect(rtlUtils.when(rtlStyles, ltrStyles)).toEqual(rtlStyles);
  });

  test('should provide CSS custom properties', () => {
    const ltrUtils = createRTLUtils(false);
    const rtlUtils = createRTLUtils(true);
    
    expect(ltrUtils.cssVars).toEqual({
      '--direction': 'ltr',
      '--start': 'left',
      '--end': 'right'
    });
    
    expect(rtlUtils.cssVars).toEqual({
      '--direction': 'rtl',
      '--start': 'right',
      '--end': 'left'
    });
  });
});

describe('RTLProvider', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    document.documentElement.dir = '';
    document.documentElement.lang = '';
  });

  test('should provide RTL context', () => {
    const TestComponent = () => {
      const { isRTL, language, direction } = useRTL();
      return (
        <div>
          <span data-testid="rtl">{isRTL.toString()}</span>
          <span data-testid="language">{language}</span>
          <span data-testid="direction">{direction}</span>
        </div>
      );
    };

    render(
      <RTLProvider defaultRTL={true} defaultLanguage="ar">
        <TestComponent />
      </RTLProvider>
    );

    expect(screen.getByTestId('rtl')).toHaveTextContent('true');
    expect(screen.getByTestId('language')).toHaveTextContent('ar');
    expect(screen.getByTestId('direction')).toHaveTextContent('rtl');
  });

  test('should toggle RTL state', () => {
    const TestComponent = () => {
      const { isRTL, toggleRTL } = useRTL();
      return (
        <div>
          <span data-testid="rtl">{isRTL.toString()}</span>
          <button data-testid="toggle" onClick={toggleRTL}>
            Toggle RTL
          </button>
        </div>
      );
    };

    render(
      <RTLProvider defaultRTL={false}>
        <TestComponent />
      </RTLProvider>
    );

    expect(screen.getByTestId('rtl')).toHaveTextContent('false');
    
    act(() => {
      fireEvent.click(screen.getByTestId('toggle'));
    });

    expect(screen.getByTestId('rtl')).toHaveTextContent('true');
  });

  test('should set language and auto-detect RTL', () => {
    const TestComponent = () => {
      const { language, isRTL, setLanguage } = useRTL();
      return (
        <div>
          <span data-testid="language">{language}</span>
          <span data-testid="rtl">{isRTL.toString()}</span>
          <button 
            data-testid="set-arabic" 
            onClick={() => setLanguage('ar')}
          >
            Set Arabic
          </button>
        </div>
      );
    };

    render(
      <RTLProvider defaultLanguage="en">
        <TestComponent />
      </RTLProvider>
    );

    expect(screen.getByTestId('language')).toHaveTextContent('en');
    expect(screen.getByTestId('rtl')).toHaveTextContent('false');
    
    act(() => {
      fireEvent.click(screen.getByTestId('set-arabic'));
    });

    expect(screen.getByTestId('language')).toHaveTextContent('ar');
    expect(screen.getByTestId('rtl')).toHaveTextContent('true');
  });

  test('should update document attributes', () => {
    render(
      <RTLProvider defaultRTL={true} defaultLanguage="ar">
        <div>Test</div>
      </RTLProvider>
    );

    expect(document.documentElement.dir).toBe('rtl');
    expect(document.documentElement.lang).toBe('ar');
  });

  test('should store preferences in localStorage', () => {
    render(
      <RTLProvider defaultRTL={true} defaultLanguage="ar">
        <div>Test</div>
      </RTLProvider>
    );

    expect(localStorageMock.setItem).toHaveBeenCalledWith('techno-etl-rtl', 'true');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('techno-etl-language', 'ar');
  });

  test('should call callbacks on changes', () => {
    const onRTLChange = jest.fn();
    const onLanguageChange = jest.fn();

    const TestComponent = () => {
      const { toggleRTL, setLanguage } = useRTL();
      return (
        <div>
          <button data-testid="toggle" onClick={toggleRTL}>Toggle</button>
          <button data-testid="set-lang" onClick={() => setLanguage('fr')}>Set French</button>
        </div>
      );
    };

    render(
      <RTLProvider 
        onRTLChange={onRTLChange} 
        onLanguageChange={onLanguageChange}
      >
        <TestComponent />
      </RTLProvider>
    );

    act(() => {
      fireEvent.click(screen.getByTestId('toggle'));
    });
    expect(onRTLChange).toHaveBeenCalledWith(true);

    act(() => {
      fireEvent.click(screen.getByTestId('set-lang'));
    });
    expect(onLanguageChange).toHaveBeenCalledWith('fr');
  });
});

describe('useRTL Hook', () => {
  test('should throw error when used outside provider', () => {
    const TestComponent = () => {
      useRTL();
      return <div>Test</div>;
    };

    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => render(<TestComponent />)).toThrow(
      'useRTL must be used within an RTLProvider'
    );
    
    consoleSpy.mockRestore();
  });

  test('should provide all context values', () => {
    const { result } = renderHook(() => useRTL(), {
      wrapper: ({ children }) => (
        <RTLProvider defaultRTL={true} defaultLanguage="ar">
          {children}
        </RTLProvider>
      )
    });

    expect(result.current.isRTL).toBe(true);
    expect(result.current.language).toBe('ar');
    expect(result.current.direction).toBe('rtl');
    expect(typeof result.current.toggleRTL).toBe('function');
    expect(typeof result.current.setLanguage).toBe('function');
    expect(typeof result.current.rtlUtils).toBe('object');
    expect(result.current.theme).toBeDefined();
    expect(result.current.emotionCache).toBeDefined();
  });
});

describe('withRTL HOC', () => {
  test('should wrap component with RTL context', () => {
    const TestComponent = ({ rtl }) => (
      <div data-testid="rtl-prop">{rtl.isRTL.toString()}</div>
    );

    const WrappedComponent = withRTL(TestComponent);

    render(
      <RTLProvider defaultRTL={true}>
        <WrappedComponent />
      </RTLProvider>
    );

    expect(screen.getByTestId('rtl-prop')).toHaveTextContent('true');
  });
});

describe('RTL Utility Components', () => {
  test('RTLBox should apply RTL styles', () => {
    render(
      <RTLProvider defaultRTL={true}>
        <RTLBox data-testid="rtl-box" sx={{ color: 'red' }}>
          Content
        </RTLBox>
      </RTLProvider>
    );

    const box = screen.getByTestId('rtl-box');
    expect(box).toHaveStyle('color: red');
  });

  test('RTLText should apply text alignment', () => {
    render(
      <RTLProvider defaultRTL={true}>
        <RTLText data-testid="rtl-text" align="start">
          Text content
        </RTLText>
      </RTLProvider>
    );

    const text = screen.getByTestId('rtl-text');
    expect(text).toHaveStyle('text-align: right');
  });
});

describe('RTL Languages Constant', () => {
  test('should contain expected RTL languages', () => {
    expect(RTL_LANGUAGES).toHaveProperty('ar');
    expect(RTL_LANGUAGES).toHaveProperty('he');
    expect(RTL_LANGUAGES).toHaveProperty('fa');
    expect(RTL_LANGUAGES.ar.direction).toBe('rtl');
    expect(RTL_LANGUAGES.ar.name).toBe('Arabic');
  });
});