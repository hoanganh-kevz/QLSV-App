import { useEffect } from 'react';

/**
 * Hook to automatically save form data to localStorage
 * @param {string} key - Unique key for localStorage
 * @param {Object} watch - Function from react-hook-form to watch fields
 * @param {function} reset - Function from react-hook-form to reset fields
 */
export const useFormAutoSave = (key, watch, reset) => {
    // Load saved data on mount
    useEffect(() => {
        const savedData = localStorage.getItem(key);
        if (savedData && reset) {
            try {
                const parsed = JSON.parse(savedData);
                // We don't want to reset everything if it's empty
                if (Object.keys(parsed).length > 0) {
                    reset(parsed);
                }
            } catch (e) {
                console.error('Failed to parse auto-saved data', e);
            }
        }
    }, [key, reset]);

    // Watch all fields and save to localStorage
    const formValues = watch();

    useEffect(() => {
        if (formValues && Object.keys(formValues).length > 0) {
            localStorage.setItem(key, JSON.stringify(formValues));
        }
    }, [key, formValues]);

    const clearAutoSave = () => {
        localStorage.removeItem(key);
    };

    return { clearAutoSave };
};
