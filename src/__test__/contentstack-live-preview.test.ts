import { vi } from 'vitest';
import type { OnEntryChangeCallback, OnEntryChangeConfig } from '../livePreview/types/onEntryChangeCallback.type';
import type { IStackSdk, IExportedConfig, IInitData } from '../types/types';

// Store original env and window
const originalEnv = process.env;
const originalWindow = global.window;

describe('ContentstackLivePreview HOC Class Integration Tests', () => {
  let ContentstackLivePreview: any;
  let ContentstackLivePreviewHOC: any;

  beforeEach(() => {
    // Reset modules and env before each test
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.clearAllMocks();
    
    // Restore window to original state
    Object.defineProperty(global, 'window', {
      value: originalWindow,
      writable: true,
      configurable: true
    });
  });

  describe('SDK Selection Tests', () => {
    test('should use LightLivePreviewHoC when PURGE_PREVIEW_SDK is true', async () => {
      process.env.PURGE_PREVIEW_SDK = 'true';
      
      const { default: CSLivePreview } = await import('../index');
      const { default: CSLivePreviewHOC } = await import('../preview/contentstack-live-preview-HOC');
      
      ContentstackLivePreview = CSLivePreview;
      ContentstackLivePreviewHOC = CSLivePreviewHOC;
      
      expect(ContentstackLivePreview.name).toBe('LightLivePreviewHoC');
    });

    test('should use LightLivePreviewHoC when REACT_APP_PURGE_PREVIEW_SDK is true', async () => {
      process.env.REACT_APP_PURGE_PREVIEW_SDK = 'true';
      
      const { default: CSLivePreview } = await import('../index');
      ContentstackLivePreview = CSLivePreview;
      
      expect(ContentstackLivePreview.name).toBe('LightLivePreviewHoC');
    });

    test('should use ContentstackLivePreviewHOC by default', async () => {
      process.env.PURGE_PREVIEW_SDK = 'false';
      process.env.REACT_APP_PURGE_PREVIEW_SDK = 'false';
      
      const { default: CSLivePreview } = await import('../index');
      const { default: CSLivePreviewHOC } = await import('../preview/contentstack-live-preview-HOC');
      
      ContentstackLivePreview = CSLivePreview;
      ContentstackLivePreviewHOC = CSLivePreviewHOC;
      
      expect(ContentstackLivePreview).toBe(ContentstackLivePreviewHOC);
    });
  });

  describe('LightLivePreviewHoC Functionality Tests', () => {
    beforeEach(async () => {
      process.env.PURGE_PREVIEW_SDK = 'true';
      const { default: CSLivePreview } = await import('../index');
      ContentstackLivePreview = CSLivePreview;
    });

    test('should initialize with empty constructors', async () => {
      const result = await ContentstackLivePreview.init();
      expect(result).toEqual({
        livePreview: {},
        visualBuilder: {},
      });
    });

    test('should return empty hash', () => {
      expect(ContentstackLivePreview.hash).toBe('');
    });

    test('should return empty config', () => {
      const config = ContentstackLivePreview.config as IExportedConfig;
      expect(config).toEqual({});
    });

    test('should allow access to stackDetails from config without type error', () => {
      expect(ContentstackLivePreview.config.stackDetails).toEqual(undefined);
    });

    test('should handle onEntryChange with immediate callback execution', () => {
      const mockCallback = vi.fn() as OnEntryChangeCallback;
      const config: OnEntryChangeConfig = { skipInitialRender: false };
      
      const callbackId = ContentstackLivePreview.onEntryChange(mockCallback, config);
      
      expect(callbackId).toBe('live-preview-id');
      expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    test('should handle onEntryChange with skipped initial render', () => {
      const mockCallback = vi.fn() as OnEntryChangeCallback;
      const config: OnEntryChangeConfig = { skipInitialRender: true };
      
      const callbackId = ContentstackLivePreview.onEntryChange(mockCallback, config);
      
      expect(callbackId).toBe('live-preview-id');
      expect(mockCallback).not.toHaveBeenCalled();
    });

    test('should handle onLiveEdit', () => {
      const mockCallback = vi.fn() as OnEntryChangeCallback;
      const result = ContentstackLivePreview.onLiveEdit(mockCallback);
      expect(result).toBe('live-preview-id');
    });

    test('should handle unsubscribeOnEntryChange without errors', () => {
      const mockCallback = vi.fn() as OnEntryChangeCallback;
      const callbackId = ContentstackLivePreview.onEntryChange(mockCallback);
      expect(() => {
        ContentstackLivePreview.unsubscribeOnEntryChange(callbackId);
      }).not.toThrow();
    });

    test('should return package version from environment', () => {
      process.env.PACKAGE_VERSION = '1.0.0';
      expect(ContentstackLivePreview.getSdkVersion()).toBe('1.0.0');
    });
  });

  describe('Browser Environment Tests', () => {
    beforeEach(async () => {
      process.env.PURGE_PREVIEW_SDK = 'true';
      vi.resetModules();
      const { default: CSLivePreview } = await import('../index');
      ContentstackLivePreview = CSLivePreview;
    });

    test('should handle initialization in non-browser environment', async () => {
      // Mock window as undefined
      Object.defineProperty(global, 'window', {
        value: undefined,
        writable: true,
        configurable: true
      });

      const result = await ContentstackLivePreview.init();
      
      expect(result).toEqual({});
    });

    test('should initialize properly in browser environment', async () => {
      // Mock window with minimum required properties
      Object.defineProperty(global, 'window', {
        value: {
          location: {
            search: '',
            hash: ''
          }
        },
        writable: true,
        configurable: true
      });

      const result = await ContentstackLivePreview.init();
      
      expect(result).toEqual({
        livePreview: {},
        visualBuilder: {},
      });
    });
  });
});
