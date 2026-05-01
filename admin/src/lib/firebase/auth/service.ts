import { 
  signInWithEmailAndPassword, 
  signOut,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../config";

const getErrorCode = (error: unknown) =>
  typeof error === "object" && error !== null && "code" in error
    ? String((error as { code?: unknown }).code)
    : "";

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "An unexpected error occurred. Please try again.";

const mapAuthError = (error: unknown) => {
  const code = getErrorCode(error);
  console.warn(`Admin auth error: ${code || "unknown"}`);
  if (code === 'auth/invalid-credential' ||
      code === 'auth/user-not-found' ||
      code === 'auth/wrong-password') {
    return "Invalid email or password.";
  }
  if (code === 'auth/email-already-in-use') {
    return "This email is already registered. If you are a client, please use a different email for admin access.";
  }
  if (code === 'auth/too-many-requests') {
    return "Too many failed attempts. Please try again later.";
  }
  if (code === 'auth/internal-error') {
    return "A network error occurred. Please check your connection.";
  }
  if (code === 'auth/network-request-failed') {
    return "Network request failed. Check your internet connection.";
  }
  if (code === 'auth/weak-password') {
    return "Password is too weak. Please use at least 6 characters.";
  }
  return getErrorMessage(error);
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
      throw new Error("This account is for customer ordering. Please use the customer site.");
    }
    
    return userCredential;
  } catch (error: unknown) {
    throw new Error(mapAuthError(error));
  }
};

export const logoutUser = async () => {
  return await signOut(auth);
};
