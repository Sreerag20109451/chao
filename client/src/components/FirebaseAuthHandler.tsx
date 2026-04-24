import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useDispatch } from "react-redux";
import { auth, db } from "@/lib/firebase";
import { setCredentials, logout } from "@/lib/features/authSlice";

export default function FirebaseAuthHandler() {
  const dispatch = useDispatch();

  useEffect(() => {
    let initialized = false;
    const safetyTimeout = setTimeout(() => {
      if (!initialized) {
        console.warn("FirebaseAuthHandler: Safety timeout triggered.");
        dispatch(logout());
        initialized = true;
      }
    }, 5000);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (!initialized) {
          initialized = true;
          clearTimeout(safetyTimeout);
        }
        if (firebaseUser) {
          let phone = "";
          let addresses: string[] = [];
          let primaryAddressIndex = 0;

          try {
            const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
            if (userDoc.exists()) {
              const data = userDoc.data();
              if (data.phone) phone = data.phone;
              if (data.addresses) addresses = data.addresses;
              if (data.primaryAddressIndex !== undefined) primaryAddressIndex = data.primaryAddressIndex;
            }
          } catch (e: any) {
            console.warn("FirebaseAuthHandler: Firestore fetch failed:", e.message);
          }

          dispatch(
            setCredentials({
              name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
              email: firebaseUser.email || "",
              phone,
              addresses,
              primaryAddressIndex,
            })
          );
        } else {
          dispatch(logout());
        }
      } catch (error) {
        console.error("FirebaseAuthHandler unexpected error:", error);
      }
    });

    return () => {
      unsubscribe();
      clearTimeout(safetyTimeout);
    };
  }, [dispatch]);

  return null;
}
