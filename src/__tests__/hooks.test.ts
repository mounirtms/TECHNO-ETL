import { renderHook, act } from '@testing-library/react-hooks';
import { useTab } from '../contexts/TabContext';

describe('useTab Hook', () => {
  it('should open a new tab', () => {
    const { result } = renderHook(() => useTab());

    act(() => {
      result.current.openTab('new-tab');
    });

    expect(result.current.openTabs).toContain('new-tab');
    expect(result.current.activeTab).toBe('new-tab');
  });

  it('should close a tab', () => {
    const { result } = renderHook(() => useTab());

    act(() => {
      result.current.openTab('tab-to-close');
    });

    act(() => {
      result.current.closeTab('tab-to-close');
    });

    expect(result.current.openTabs).not.toContain('tab-to-close');
  });
});
