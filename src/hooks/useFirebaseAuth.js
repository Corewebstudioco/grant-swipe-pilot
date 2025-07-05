
import { useState, useEffect } from 'react';
import { onAuthChange } from '../utils/firebaseAuth';

export const useFirebaseAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    
    const unsubscribe = onAuthChange((user) => {
      if (mounted) {
        setUser(user);
        setLoading(false);
        setError(null);
      }
    });

    // Handle case where onAuthChange returns an empty function (auth not initialized)
    if (!unsubscribe || typeof unsubscribe !== 'function') {
      if (mounted) {
        setError('Firebase Auth is not properly initialized');
        setLoading(false);
      }
      return () => {};
    }

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  return { user, loading, error, isAuthenticated: !!user };
};
