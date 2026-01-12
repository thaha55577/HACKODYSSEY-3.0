import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { ref, onValue, get, set } from 'firebase/database';
import { auth, db } from './firebase.ts';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  permissionStatus: 'pending' | 'approved' | 'rejected' | null;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: true,
  permissionStatus: null,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [permissionStatus, setPermissionStatus] = useState<'pending' | 'approved' | 'rejected' | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        const isAdmin = user.email === '99230040469@klu.ac.in' || user.email === '99220041803@gmail.com';

        if (isAdmin) {
          setPermissionStatus('approved');
          setLoading(false);
          return;
        }

        // Check if user is already approved in permissions collection
        const permissionRef = ref(db, `permissions/${user.uid}`);
        onValue(permissionRef, async (snapshot) => {
          if (snapshot.exists()) {
            setPermissionStatus(snapshot.val().status);
            setLoading(false);
          } else {
            // New user or Old user without permission record
            // Check if they are an old user (already in teams)
            const teamsRef = ref(db, 'teams');
            const teamsSnapshot = await get(teamsRef);
            let isOldUser = false;

            if (teamsSnapshot.exists()) {
              const teams = teamsSnapshot.val();
              for (const team of Object.values(teams) as any[]) {
                if (team.createdBy === user.email) {
                  isOldUser = true;
                  break;
                }
              }
            }

            if (isOldUser) {
              // Auto-approve old users
              await set(permissionRef, {
                email: user.email,
                displayName: user.displayName || user.email?.split('@')[0],
                status: 'approved',
                timestamp: new Date().toISOString(),
                isOldUser: true
              });
              setPermissionStatus('approved');
            } else {
              // New user, set to pending
              await set(permissionRef, {
                email: user.email,
                displayName: user.displayName || user.email?.split('@')[0],
                status: 'pending',
                timestamp: new Date().toISOString(),
                isOldUser: false
              });
              setPermissionStatus('pending');
            }
            setLoading(false);
          }
        });
      } else {
        setPermissionStatus(null);
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loading,
    permissionStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
