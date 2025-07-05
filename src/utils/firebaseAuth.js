
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '../firebase';
import { addDocument, getDocument, updateDocument } from './firebase';

// Sign in with email and password
export const signInUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error('Error signing in:', error);
    return { success: false, error: error.message };
  }
};

// Create user with email and password
export const createUser = async (email, password, userData = {}) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update profile if display name is provided
    if (userData.displayName) {
      await updateProfile(user, { displayName: userData.displayName });
    }
    
    // Create user profile in Firestore
    const profileData = {
      email: user.email,
      uid: user.uid,
      displayName: userData.displayName || '',
      ...userData
    };
    
    await addDocument('users', profileData);
    
    return { success: true, user };
  } catch (error) {
    console.error('Error creating user:', error);
    return { success: false, error: error.message };
  }
};

// Sign out user
export const signOutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Error signing out:', error);
    return { success: false, error: error.message };
  }
};

// Send password reset email
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return { success: false, error: error.message };
  }
};

// Listen to auth state changes
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Get current user profile from Firestore
export const getUserProfile = async (uid) => {
  return await getDocument('users', uid);
};

// Update user profile in Firestore
export const updateUserProfile = async (uid, data) => {
  return await updateDocument('users', uid, data);
};
