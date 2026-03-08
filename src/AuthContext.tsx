import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { auth } from './firebase.ts';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  permissionStatus: string | null;
  setMockUser: (user: any) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: true,
  permissionStatus: null,
  setMockUser: () => { },
  logout: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [permissionStatus, setPermissionStatus] = useState<string | null>(null);

  useEffect(() => {
    // Check for mock user first
    const savedMockUser = localStorage.getItem('mockUser');
    if (savedMockUser) {
      setCurrentUser(JSON.parse(savedMockUser));
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const setMockUser = (user: any) => {
    if (user) {
      localStorage.setItem('mockUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('mockUser');
    }
    setCurrentUser(user);
  };

  const logout = async () => {
    localStorage.removeItem('mockUser');
    await signOut(auth);
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    loading,
    permissionStatus,
    setMockUser,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
