import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useDispatch } from "react-redux";
import { auth } from "@/lib/firebase";
import { setCredentials, logout } from "@/lib/features/authSlice";

export default function FirebaseAuthHandler() {
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        let phone = "";
        let addresses: string[] = [];
        let primaryAddressIndex = 0;

        try {
          const { doc, getDoc } = await import("firebase/firestore");
          const { db } = await import("@/lib/firebase/config");
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            if (data.phone) phone = data.phone;
            if (data.addresses) addresses = data.addresses;
            if (data.primaryAddressIndex !== undefined) primaryAddressIndex = data.primaryAddressIndex;
          }
        } catch (e) {
          console.error("Failed to fetch user data on auth change", e);
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
    });

    return () => unsubscribe();
  }, [dispatch]);

  return null;
}
