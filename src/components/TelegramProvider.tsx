'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export interface TelegramUser {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
    is_premium?: boolean;
}

interface TelegramContextType {
    webApp?: any;
    user?: TelegramUser;
    isTelegram: boolean;
}

const TelegramContext = createContext<TelegramContextType>({
    isTelegram: false
});

export const TelegramProvider = ({ children }: { children: React.ReactNode }) => {
    const [webApp, setWebApp] = useState<any>(undefined);
    const [user, setUser] = useState<TelegramUser | undefined>(undefined);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        const initTelegram = () => {
            if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
                const tg = (window as any).Telegram.WebApp;
                
                try {
                    tg.ready();
                    tg.expand();
                    setWebApp(tg);

                    if (tg.initDataUnsafe?.user) {
                        setUser(tg.initDataUnsafe.user);
                    }

                    const applyTheme = () => {
                        const params = tg.themeParams;
                        const root = document.documentElement;
                        if (params) {
                            if (params.bg_color) root.style.setProperty('--tg-bg-color', params.bg_color);
                            if (params.text_color) root.style.setProperty('--tg-text-color', params.text_color);
                            if (params.hint_color) root.style.setProperty('--tg-hint-color', params.hint_color);
                            if (params.link_color) root.style.setProperty('--tg-link-color', params.link_color);
                            if (params.button_color) root.style.setProperty('--tg-button-color', params.button_color);
                            if (params.button_text_color) root.style.setProperty('--tg-button-text-color', params.button_text_color);
                        }
                    };

                    applyTheme();
                    tg.onEvent('themeChanged', applyTheme);
                    
                    if (interval) clearInterval(interval);
                    return true;
                } catch (e) {
                    console.warn('Telegram SDK initialization failed', e);
                }
            }
            return false;
        };

        // Initial attempt
        if (!initTelegram()) {
            // Poll for Telegram object if not found immediately (since it's afterInteractive)
            interval = setInterval(() => {
                if (initTelegram()) {
                    clearInterval(interval);
                }
            }, 100);
        }

        return () => {
            if (interval) clearInterval(interval);
            if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
                const tg = (window as any).Telegram.WebApp;
                // Note: We can't easily remove 'applyTheme' here because it's local,
                // but since it's a provider that lives for the app life, it's acceptable.
            }
        };
    }, []);

    return (
        <TelegramContext.Provider value={{ webApp, user, isTelegram: !!webApp }}>
            {children}
        </TelegramContext.Provider>
    );
};

export const useTelegram = () => useContext(TelegramContext);
