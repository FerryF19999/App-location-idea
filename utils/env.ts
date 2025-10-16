const isProcessDefined = (): process is NodeJS.Process => {
    return typeof process !== 'undefined' && typeof process.env !== 'undefined';
};

const getMetaEnv = (): Record<string, string | undefined> | undefined => {
    try {
        if (typeof import.meta !== 'undefined' && (import.meta as any)?.env) {
            return (import.meta as any).env as Record<string, string | undefined>;
        }
    } catch {
        // Accessing import.meta can throw in some runtimes; ignore and fall back to process.env only.
    }
    return undefined;
};

export const getEnvValue = (...keys: string[]): string | undefined => {
    if (isProcessDefined()) {
        for (const key of keys) {
            const value = process.env[key as keyof NodeJS.ProcessEnv];
            if (typeof value === 'string' && value.trim().length > 0) {
                return value;
            }
        }
    }

    const metaEnv = getMetaEnv();
    if (metaEnv) {
        for (const key of keys) {
            const value = metaEnv[key];
            if (typeof value === 'string' && value.trim().length > 0) {
                return value;
            }
        }
    }

    return undefined;
};
