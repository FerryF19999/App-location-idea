import { useEffect, type FC } from 'react';
import { getEnvValue } from '../utils/env';

const SCRIPT_ID = '__vercel_analytics_script';
const SCRIPT_SRC = 'https://va.vercel-scripts.com/v1/script.debug.js';
const TOKEN_ATTRIBUTE = 'data-token';

const isDevEnvironment = (): boolean => {
    try {
        if (typeof import.meta !== 'undefined' && (import.meta as any)?.env?.DEV !== undefined) {
            return Boolean((import.meta as any).env.DEV);
        }
    } catch {
        // Some runtimes do not allow accessing import.meta – ignore and fall back to process.env.
    }

    if (typeof process !== 'undefined' && typeof process.env !== 'undefined' && process.env.NODE_ENV) {
        return process.env.NODE_ENV !== 'production';
    }

    return false;
};

const VercelAnalytics: FC = () => {
    useEffect(() => {
        if (typeof window === 'undefined' || typeof document === 'undefined') {
            return;
        }

        const existingScript = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
        if (existingScript) {
            return;
        }

        const token = getEnvValue('VERCEL_ANALYTICS_ID', 'VITE_VERCEL_ANALYTICS_ID');
        if (!token) {
            if (isDevEnvironment()) {
                console.warn(
                    'Vercel Analytics token is not set. Add VITE_VERCEL_ANALYTICS_ID to enable analytics tracking.'
                );
            }
            return;
        }

        const script = document.createElement('script');
        script.id = SCRIPT_ID;
        script.defer = true;
        script.src = SCRIPT_SRC;
        script.setAttribute(TOKEN_ATTRIBUTE, token);

        document.head.appendChild(script);

        return () => {
            if (script.parentNode) {
                script.parentNode.removeChild(script);
            }
        };
    }, []);

    return null;
};

export default VercelAnalytics;
