
import { useState, useEffect } from 'react';
import { onAuthChange } from '../utils/firebaseAuth';

export const useFirebaseAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setUser(user);
      setLoading(false);
      setError(null);
    });

    return () => unsubscribe();
  }, []);

  return { user, loading, error, isAuthenticated: !!user };
};
