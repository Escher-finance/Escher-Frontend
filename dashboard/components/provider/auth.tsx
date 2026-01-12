'use client';

import { usePathname, useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useState } from 'react';

type User = {
    email: string;
    role: string;
};

type AuthContextType = {
    user: User | undefined;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | undefined>(undefined);
    const router = useRouter();
    const pathName = usePathname();

    useEffect(() => {
        const cookieMap = Object.fromEntries(
            document.cookie.split('; ').map((c) => c.split('='))
        );

        let loggedInUser: User | undefined;

        if (cookieMap['auth'] === 'true' && cookieMap['user']) {
            try {
                loggedInUser = JSON.parse(decodeURIComponent(cookieMap['user']));
            } catch {
                loggedInUser = undefined;
            }
        }

        setUser(loggedInUser);

        if (loggedInUser) {
            if (pathName === '/login') {
                router.replace('/');
            }
            if (loggedInUser.role === "union") {
                router.replace('/union');
            }
        } else {
            if (pathName !== '/login') {
                router.replace('/login');
            }
        }
    }, [router, pathName]);

    const login = async (email: string, password: string) => {
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        if (res.ok) {
            router.push('/');
        } else {
            const data = await res.json();
            throw (data.error || 'Login failed');
        }
    };

    const logout = async () => {
        await fetch('/api/logout', { method: 'GET' });
        setUser(undefined);
        router.replace('/login');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used inside <AuthProvider>');
    }
    return context;
}
