import { createContext, useContext, useEffect, useState } from 'react';
import { useUser, useClerk, useAuth as useClerkAuth } from '@clerk/clerk-react';
import api, { setTokenProvider } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const { user: clerkUser, isLoaded, isSignedIn } = useUser();
    const { signOut } = useClerk();
    const { getToken } = useClerkAuth();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Initialize the token provider for API requests
    useEffect(() => {
        setTokenProvider(getToken);
    }, [getToken]);

    // 1. Sync state from Clerk to App whenever Clerk user updates
    useEffect(() => {
        if (isLoaded) {
            if (isSignedIn && clerkUser) {
                // Adapt Clerk user to our app's user structure
                setUser({
                    id: clerkUser.id,
                    name: clerkUser.fullName,
                    email: clerkUser.primaryEmailAddress?.emailAddress,
                    role: clerkUser.publicMetadata?.role || 'user',
                });
            } else {
                setUser(null);
            }
            setLoading(false);
        }
    }, [isLoaded, isSignedIn, clerkUser]);

    // 2. Sync Backend (Once per session/login) to promote Admin
    useEffect(() => {
        const syncBackend = async () => {
            if (isLoaded && isSignedIn && clerkUser) {
                try {
                    // Trigger backend sync/promotion
                    // Use /api/health/sync assuming it is mounted under /api/health
                    // Wait, healthRoutes is mounted at /api/health
                    await api.get('/health/sync');

                    // Reload Clerk user metadata (force refresh)
                    // This updates clerkUser.publicMetadata which triggers the first useEffect
                    await clerkUser.reload();
                    console.log("[Auth] User synced and metadata reloaded");
                } catch (error) {
                    console.error("[Auth] Backend sync failed:", error);
                }
            }
        };

        syncBackend();
        // We only want to run this once when the user signs in.
        // But clerkUser reference changes on reload.
        // We should guard this?
        // Actually, if we use [isSignedIn], it runs when user logs in.
        // But if we refresh page, isSignedIn is true from start (after load).
        // So it runs on mount.
        // And if clerkUser.reload() runs, it updates clerkUser but isSignedIn stays true.
        // So this effect won't re-run if we only depend on `isSignedIn` (and `isLoaded`).
        // But we need `clerkUser` inside the closure. 
        // If we omit `clerkUser` from deps, we use stale `clerkUser`?
        // No, on mount `clerkUser` is available.
        // If we include `clerkUser` in deps, we loop.

        // Solution: Use a ref to track if we synced this session?
        // Or just omit `clerkUser` from deps and accept linter warning (safe here as we only need *a* reference to call reload).
    }, [isLoaded, isSignedIn]);

    const login = () => {
        console.warn("Login called programmatically. Use <SignIn /> component or Clerk hooks.");
    };

    const logout = async () => {
        await signOut();
        setUser(null);
    };

    const checkAuth = async () => {
        return user;
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, checkAuth, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
