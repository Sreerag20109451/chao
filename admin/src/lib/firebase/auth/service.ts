import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  updateProfile as updateFirebaseProfile
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../config";

const mapAuthError = (error: any) => {
  console.error("Admin Auth Error:", error);
  if (error.code === 'auth/invalid-credential' || 
      error.code === 'auth/user-not-found' || 
      error.code === 'auth/wrong-password') {
    return "Invalid email or password.";
  }
  if (error.code === 'auth/email-already-in-use') {
    return "This email is already registered. If you are a client, please use a different email for admin access.";
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

export const registerAdmin = async (name: string, email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const { user: firebaseUser } = userCredential;
    
    await updateFirebaseProfile(firebaseUser, { displayName: name });
    
    try {
      await setDoc(doc(db, "users", firebaseUser.uid), {
        name,
        email,
        userrole: "admin",
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("Firestore admin write failed:", err);
    }

    return firebaseUser;
  } catch (error: any) {
    throw new Error(mapAuthError(error));
  }
};

export const loginAdmin = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (!userDoc.exists()) {
      await signOut(auth);
      throw new Error("No admin account found. Please contact support.");
    }
    
    const userData = userDoc.data();
    if (userData.userrole !== "admin") {
      await signOut(auth);
      throw new Error("Access denied. You do not have admin privileges.");
    }
    
    return userCredential;
  } catch (error: any) {
    throw new Error(mapAuthError(error));
  }
};

export const logoutUser = async () => {
  return await signOut(auth);
};
