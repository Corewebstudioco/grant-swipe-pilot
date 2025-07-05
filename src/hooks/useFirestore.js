
import { useState, useEffect } from 'react';
import { 
  getCollection, 
  getDocument, 
  addDocument, 
  updateDocument, 
  deleteDocument, 
  queryCollection,
  listenToCollection 
} from '../utils/firebase';

// Hook for getting a collection
export const useFirestoreCollection = (collectionName, conditions = [], realtime = false) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const result = conditions.length > 0 
        ? await queryCollection(collectionName, conditions)
        : await getCollection(collectionName);
      
      if (result.success) {
        setData(result.data);
        setError(null);
      } else {
        setError(result.error);
      }
      setLoading(false);
    };

    if (realtime) {
      const unsubscribe = listenToCollection(collectionName, (result) => {
        if (result.success) {
          setData(result.data);
          setError(null);
        } else {
          setError(result.error);
        }
        setLoading(false);
      }, conditions);

      return () => unsubscribe && unsubscribe();
    } else {
      fetchData();
    }
  }, [collectionName, JSON.stringify(conditions), realtime]);

  return { data, loading, error };
};

// Hook for getting a single document
export const useFirestoreDocument = (collectionName, docId) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!docId) {
      setLoading(false);
      return;
    }

    const fetchDocument = async () => {
      setLoading(true);
      const result = await getDocument(collectionName, docId);
      
      if (result.success) {
        setData(result.data);
        setError(null);
      } else {
        setError(result.error);
      }
      setLoading(false);
    };

    fetchDocument();
  }, [collectionName, docId]);

  return { data, loading, error };
};

// Hook with CRUD operations
export const useFirestoreCRUD = (collectionName) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const add = async (data) => {
    setLoading(true);
    setError(null);
    const result = await addDocument(collectionName, data);
    setLoading(false);
    
    if (!result.success) {
      setError(result.error);
    }
    
    return result;
  };

  const update = async (docId, data) => {
    setLoading(true);
    setError(null);
    const result = await updateDocument(collectionName, docId, data);
    setLoading(false);
    
    if (!result.success) {
      setError(result.error);
    }
    
    return result;
  };

  const remove = async (docId) => {
    setLoading(true);
    setError(null);
    const result = await deleteDocument(collectionName, docId);
    setLoading(false);
    
    if (!result.success) {
      setError(result.error);
    }
    
    return result;
  };

  return { add, update, remove, loading, error };
};
