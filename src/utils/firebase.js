
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../firebase';

// Generic function to get all documents from a collection
export const getCollection = async (collectionName) => {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    const documents = [];
    querySnapshot.forEach((doc) => {
      documents.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, data: documents };
  } catch (error) {
    console.error(`Error getting ${collectionName}:`, error);
    return { success: false, error: error.message };
  }
};

// Generic function to get a single document
export const getDocument = async (collectionName, docId) => {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
    } else {
      return { success: false, error: 'Document not found' };
    }
  } catch (error) {
    console.error(`Error getting document from ${collectionName}:`, error);
    return { success: false, error: error.message };
  }
};

// Generic function to add a document
export const addDocument = async (collectionName, data) => {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error(`Error adding document to ${collectionName}:`, error);
    return { success: false, error: error.message };
  }
};

// Generic function to update a document
export const updateDocument = async (collectionName, docId, data) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date()
    });
    return { success: true };
  } catch (error) {
    console.error(`Error updating document in ${collectionName}:`, error);
    return { success: false, error: error.message };
  }
};

// Generic function to delete a document
export const deleteDocument = async (collectionName, docId) => {
  try {
    await deleteDoc(doc(db, collectionName, docId));
    return { success: true };
  } catch (error) {
    console.error(`Error deleting document from ${collectionName}:`, error);
    return { success: false, error: error.message };
  }
};

// Function to query documents with conditions
export const queryCollection = async (collectionName, conditions = [], orderByField = null, limitCount = null) => {
  try {
    let q = collection(db, collectionName);
    
    // Apply where conditions
    conditions.forEach(condition => {
      q = query(q, where(condition.field, condition.operator, condition.value));
    });
    
    // Apply ordering
    if (orderByField) {
      q = query(q, orderBy(orderByField.field, orderByField.direction || 'asc'));
    }
    
    // Apply limit
    if (limitCount) {
      q = query(q, limit(limitCount));
    }
    
    const querySnapshot = await getDocs(q);
    const documents = [];
    querySnapshot.forEach((doc) => {
      documents.push({ id: doc.id, ...doc.data() });
    });
    
    return { success: true, data: documents };
  } catch (error) {
    console.error(`Error querying ${collectionName}:`, error);
    return { success: false, error: error.message };
  }
};

// Function to listen to real-time updates
export const listenToCollection = (collectionName, callback, conditions = []) => {
  try {
    let q = collection(db, collectionName);
    
    conditions.forEach(condition => {
      q = query(q, where(condition.field, condition.operator, condition.value));
    });
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const documents = [];
      querySnapshot.forEach((doc) => {
        documents.push({ id: doc.id, ...doc.data() });
      });
      callback({ success: true, data: documents });
    }, (error) => {
      console.error(`Error listening to ${collectionName}:`, error);
      callback({ success: false, error: error.message });
    });
    
    return unsubscribe;
  } catch (error) {
    console.error(`Error setting up listener for ${collectionName}:`, error);
    return null;
  }
};
