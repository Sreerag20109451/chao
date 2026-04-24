import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  updateProfile as updateFirebaseProfile,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../config";
import { toast } from "sonner";

/**
 * Maps Firebase Auth error codes to user-friendly messages.
 * @param error - The error object from Firebase.
 * @returns A string containing the user-friendly error message.
 */
const mapAuthError = (error: any) => {
  console.error("Auth Error:", error);
  if (error.code === 'auth/invalid-credential' || 
      error.code === 'auth/user-not-found' || 
      error.code === 'auth/wrong-password') {
    return "Invalid email or password.";
  }
  if (error.code === 'auth/email-already-in-use') {
    return "This email is already registered. If you are an admin, please use a different email for client access.";
  }
  if (error.code === 'auth/too-many-requests') {
    return "Too many failed attempts. Please try again later.";
  }
  if (error.code === 'auth/internal-error') {
    return "A network error occurred. Please check your connection.";
  }
  if (error.code === 'auth/network-request-failed') {
    return "Network request failed. Check your internet connection.";
  }
  if (error.code === 'auth/weak-password') {
    return "Password is too weak. Please use at least 6 characters.";
  }
  return error.message || "An unexpected error occurred. Please try again.";
};

/**
 * Registers a new client user.
 * 1. Creates a Firebase Auth account.
 * 2. Updates the user profile with the display name.
 * 3. Creates a corresponding user document in Firestore with the "client" role.
 * 
 * @param name - Full name of the user.
 * @param email - Unique email address.
 * @param password - Account password.
 * @returns The Firebase User object.
 */
export const registerClient = async (name: string, email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const { user: firebaseUser } = userCredential;
    
    await updateFirebaseProfile(firebaseUser, { displayName: name });
    
    try {
      await setDoc(doc(db, "users", firebaseUser.uid), {
        name,
        email,
        userrole: "client",
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("Firestore profile write failed:", err);
    }

    return firebaseUser;
  } catch (error: any) {
    throw new Error(mapAuthError(error));
  }
};

/**
 * Authenticates a client user.
 * Verifies the credentials and checks if the user has the "client" role in Firestore.
 * 
 * @param email - Registered email address.
 * @param password - Account password.
 * @returns The UserCredential object.
 * @throws Error if authentication fails or if the user is not a client.
 */
export const loginClient = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (!userDoc.exists()) {
      await signOut(auth);
      throw new Error("No account found. Please register as a client.");
    }
    
    const userData = userDoc.data();
    if (userData.userrole !== "client") {
      await signOut(auth);
      throw new Error("Access denied. Please use the admin portal.");
    }
    
    return userCredential;
  } catch (error: any) {
    throw new Error(mapAuthError(error));
  }
};

/**
 * Initiates a Google Sign-In popup.
 * If the user is new, a Firestore profile is created with the "client" role.
 * If the user is an admin, access is denied.
 * 
 * @returns The UserCredential object.
 */
export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      await setDoc(userDocRef, {
        name: user.displayName,
        email: user.email,
        userrole: "client",
        createdAt: serverTimestamp(),
      });
    } else {
      const userData = userDoc.data();
      if (userData.userrole === "admin") {
        await signOut(auth);
        throw new Error("This Google account is registered as an admin. Please use the admin portal.");
      }
      
      await updateDoc(userDocRef, {
        lastLogin: serverTimestamp(),
      });
    }

    return result;
  } catch (error: any) {
    throw new Error(mapAuthError(error));
  }
};

/**
 * Signs out the currently authenticated user.
 */
export const logoutUser = async () => {
  return await signOut(auth);
};

/**
 * Updates the user's profile document in Firestore.
 * @param uid - The unique user ID.
 * @param updates - An object containing the fields to update.
 */
export const updateUserProfile = async (uid: string, updates: any) => {
  const userDocRef = doc(db, "users", uid);
  return await updateDoc(userDocRef, updates);
};
