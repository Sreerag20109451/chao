import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  updateProfile as updateFirebaseProfile
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../config";

export const registerAdmin = async (name: string, email: string, password: string) => {
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
    // Map Firebase errors to user-friendly messages
    if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      throw new Error("Invalid email or password.");
    }
    throw error;
  }
};

export const logoutUser = async () => {
  return await signOut(auth);
};
