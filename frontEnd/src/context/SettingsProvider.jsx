import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { SettingsContext } from './SettingsContext';
import { profileService } from '../services/profileService';

export const SettingsProvider = ({ children }) => {
    const { user, updateUser } = useAuth();

    // Default settings
    const defaultSettings = {
        language: 'vi',
        timezone: 'gmt7',
        compactMode: false,
        notifications: {
            email: true,
            push: true,
            weeklyReport: false
        },
        twoFactorEnabled: false
    };

    const [settings, setSettings] = useState(defaultSettings);

    // Synchronize settings with user preferences whenever user object changes
    useEffect(() => {
        if (user && user.preferences) {
            setSettings(prev => ({
                ...defaultSettings,
                ...user.preferences,
                // Handle nested notifications
                notifications: {
                    ...(prev.notifications || defaultSettings.notifications),
                    ...(user.preferences.notifications || {})
                }
            }));
        } else {
            // Fallback to localStorage if no user or no preferences on user
            const savedItem = localStorage.getItem('appSettings');
            if (savedItem) {
                try {
                    setSettings({ ...defaultSettings, ...JSON.parse(savedItem) });
                } catch (e) {
                    console.error('Failed to parse settings from localStorage', e);
                }
            }
        }
    }, [user]);

    // We keep a separate pending state so changes aren't instantly applied until "Save" is clicked
    const [pendingSettings, setPendingSettings] = useState(settings);

    useEffect(() => {
        setPendingSettings(settings); // sync pending with saved when saved changes
    }, [settings]);

    const updatePendingSetting = (key, value) => {
        if (key.includes('.')) {
            const [parent, child] = key.split('.');
            setPendingSettings(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setPendingSettings(prev => ({
                ...prev,
                [key]: value
            }));
        }
    };

    const saveSettings = async () => {
        // 1. Update local state
        setSettings(pendingSettings);
        
        // 2. Persist to localStorage
        localStorage.setItem('appSettings', JSON.stringify(pendingSettings));

        // 3. Persist to Backend if logged in
        if (user) {
            const res = await profileService.updatePreferences(pendingSettings);
            if (res.success) {
                updateUser({ preferences: pendingSettings });
            }
            return res;
        }
        return { success: true };
    };

    useEffect(() => {
        // Apply global UI changes based on actual saved settings (not pending)
        if (settings.compactMode) {
            document.body.classList.add('compact-mode');
        } else {
            document.body.classList.remove('compact-mode');
        }
    }, [settings.compactMode]);

    return (
        <SettingsContext.Provider
            value={{
                settings,
                pendingSettings,
                updatePendingSetting,
                saveSettings,
                resetPending: () => setPendingSettings(settings)
            }}
        >
            {children}
        </SettingsContext.Provider>
    );
};
