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

export const registerClient = async (name: string, email: string, password: string) => {
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
};

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
    // Map Firebase errors to user-friendly messages
    if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      throw new Error("Invalid email or password.");
    }
    throw error;
  }
};

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  const user = result.user;
  
  try {
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
  } catch (err) {
    console.error("Firestore Google user sync failed:", err);
    throw err; // Re-throw so the UI can toast the message
  }

  return result;
};

export const logoutUser = async () => {
  return await signOut(auth);
};

export const updateUserProfile = async (uid: string, updates: any) => {
  const userDocRef = doc(db, "users", uid);
  return await updateDoc(userDocRef, updates);
};
