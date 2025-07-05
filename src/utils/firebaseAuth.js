
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

// Helper function to get user-friendly error messages
const getAuthErrorMessage = (errorCode) => {
  switch (errorCode) {
    case 'auth/user-not-found':
      return 'No account found with this email address.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/configuration-not-found':
      return 'Authentication service is not properly configured. Please try again.';
    case 'auth/invalid-credential':
    case 'auth/invalid-login-credentials':
      return 'Invalid email or password. Please check your credentials.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
};

// Sign in with email and password
export const signInUser = async (email, password) => {
  try {
    console.log('Attempting to sign in user with email:', email);
    
    if (!auth) {
      throw new Error('Firebase Auth is not initialized');
    }
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('Sign in successful:', userCredential.user.uid);
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error('Error signing in:', error);
    const friendlyMessage = getAuthErrorMessage(error.code);
    return { success: false, error: { message: friendlyMessage, code: error.code } };
  }
};

// Create user with email and password
export const createUser = async (email, password, userData = {}) => {
  try {
    console.log('Attempting to create user with email:', email);
    
    if (!auth) {
      throw new Error('Firebase Auth is not initialized');
    }
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log('User created successfully:', user.uid);
    
    // Update profile if display name is provided
    if (userData.displayName) {
      await updateProfile(user, { displayName: userData.displayName });
    }
    
    // Create user profile in Firestore with error handling
    try {
      const profileData = {
        email: user.email,
        uid: user.uid,
        displayName: userData.displayName || '',
        ...userData
      };
      
      await addDocument('profiles', profileData);
      console.log('User profile created in Firestore');
    } catch (firestoreError) {
      console.error('Error creating user profile in Firestore:', firestoreError);
      // Don't fail the entire signup if profile creation fails
    }
    
    return { success: true, user };
  } catch (error) {
    console.error('Error creating user:', error);
    const friendlyMessage = getAuthErrorMessage(error.code);
    return { success: false, error: { message: friendlyMessage, code: error.code } };
  }
};

// Sign out user
export const signOutUser = async () => {
  try {
    if (!auth) {
      throw new Error('Firebase Auth is not initialized');
    }
    
    await signOut(auth);
    console.log('User signed out successfully');
    return { success: true };
  } catch (error) {
    console.error('Error signing out:', error);
    return { success: false, error: { message: 'Failed to sign out. Please try again.' } };
  }
};

// Send password reset email
export const resetPassword = async (email) => {
  try {
    if (!auth) {
      throw new Error('Firebase Auth is not initialized');
    }
    
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    const friendlyMessage = getAuthErrorMessage(error.code);
    return { success: false, error: { message: friendlyMessage, code: error.code } };
  }
};

// Listen to auth state changes
export const onAuthChange = (callback) => {
  if (!auth) {
    console.error('Firebase Auth is not initialized');
    return () => {}; // Return empty unsubscribe function
  }
  
  return onAuthStateChanged(auth, (user) => {
    console.log('Auth state changed:', user ? user.uid : 'No user');
    callback(user);
  });
};

// Get current user profile from Firestore
export const getUserProfile = async (uid) => {
  return await getDocument('profiles', uid);
};

// Update user profile in Firestore
export const updateUserProfile = async (uid, data) => {
  return await updateDocument('profiles', uid, data);
};
