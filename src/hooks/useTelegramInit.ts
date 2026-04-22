'use client';

import { useTelegram } from '@/components/TelegramProvider';

/**
 * Hook to access Telegram WebApp instance and user information.
 * Works only when encapsulated within TelegramProvider.
 */
export const useTelegramInit = () => {
    const { webApp, user, isTelegram } = useTelegram();

    return {
        webApp,
        user,
        isTelegram,
        // Utility for forcing expand if needed elsewhere
        expand: () => webApp?.expand?.(),
        // Check if platform is available
        platform: webApp?.platform || 'unknown',
    };
};
