import { describe, it, expect, vi } from 'vitest';
import getVisualBuilderRedirectionUrl from '../getVisualBuilderRedirectionUrl';
import Config from '../../../configManager/configManager';
import { extractDetailsFromCslp } from '../../../cslp';

vi.mock('../../../configManager/configManager');
vi.mock('../../../cslp');

describe('getVisualBuilderRedirectionUrl', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        delete window.location
        window.location = new URL('https://example.com')
    });

    it('should return the correct URL with branch and environment', () => {
        Config.get.mockReturnValue({
            stackDetails: {
                branch: 'main',
                apiKey: '12345',
                environment: 'production',
                locale: 'en-US'
            },
            clientUrlParams: {
                url: 'https://app.example.com'
            }
        });

        const result = getVisualBuilderRedirectionUrl();
        expect(result.toString()).toBe('https://app.example.com/#!/stack/12345/visual-editor?branch=main&environment=production&target-url=https%3A%2F%2Fexample.com%2F&locale=en-US');
    });

    it('should return the correct URL without branch and environment', () => {
        Config.get.mockReturnValue({
            stackDetails: {
                branch: '',
                apiKey: '12345',
                environment: '',
                locale: 'en-US'
            },
            clientUrlParams: {
                url: 'https://app.example.com'
            }
        });

        const result = getVisualBuilderRedirectionUrl();
        expect(result.toString()).toBe('https://app.example.com/#!/stack/12345/visual-editor?target-url=https%3A%2F%2Fexample.com%2F&locale=en-US');
    });

    it('should use locale from data-cslp attribute if present', () => {
        document.body.innerHTML = '<div data-cslp="some-cslp-data"></div>';
        Config.get.mockReturnValue({
            stackDetails: {
                branch: 'main',
                apiKey: '12345',
                environment: 'production',
                locale: 'en-US'
            },
            clientUrlParams: {
                url: 'https://app.example.com'
            }
        });

        extractDetailsFromCslp.mockReturnValue({ locale: 'fr-FR' });

        const result = getVisualBuilderRedirectionUrl();
        expect(result.toString()).toBe('https://app.example.com/#!/stack/12345/visual-editor?branch=main&environment=production&target-url=https%3A%2F%2Fexample.com%2F&locale=fr-FR');
    });

    it('should return the correct URL without locale', () => {
        document.body.innerHTML = '';
        Config.get.mockReturnValue({
            stackDetails: {
                branch: 'main',
                apiKey: '12345',
                environment: 'production',
                locale: ''
            },
            clientUrlParams: {
                url: 'https://app.example.com'
            }
        });

        const result = getVisualBuilderRedirectionUrl();
        expect(result.toString()).toBe('https://app.example.com/#!/stack/12345/visual-editor?branch=main&environment=production&target-url=https%3A%2F%2Fexample.com%2F');
    });

    it('should ignore invalid data-cslp attribute and use locale from config', () => {
        document.body.innerHTML = '<div data-cslp></div>';
        Config.get.mockReturnValue({
            stackDetails: {
                branch: 'main',
                apiKey: '12345',
                environment: 'production',
                locale: 'en-US'
            },
            clientUrlParams: {
                url: 'https://app.example.com'
            }
        });

        const result = getVisualBuilderRedirectionUrl();
        // Should use locale from config when data-cslp attribute is invalid (empty or no value)
        expect(result.toString()).toBe('https://app.example.com/#!/stack/12345/visual-editor?branch=main&environment=production&target-url=https%3A%2F%2Fexample.com%2F&locale=en-US');
        // Should not call extractDetailsFromCslp for invalid cslp
        expect(extractDetailsFromCslp).not.toHaveBeenCalled();
    });
});