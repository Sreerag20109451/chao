import { useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useDispatch } from "react-redux";
import { auth, db } from "@/lib/firebase";
import { setCredentials, logout } from "@/lib/features/authSlice";
import { toast } from "sonner";

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
          let stripeCustomerId: string | undefined;
          let stripeCardLast4: string | undefined;
          let stripeCardBrand: string | undefined;

          try {
            const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
            if (userDoc.exists()) {
              const data = userDoc.data();
              if (data.userrole !== "client") {
                dispatch(logout());
                await signOut(auth);
                toast.error("This account is for the admin dashboard. Please use the admin portal.");
                return;
              }

              if (data.phone) phone = data.phone;
              if (data.addresses) addresses = data.addresses;
              if (data.primaryAddressIndex !== undefined) primaryAddressIndex = data.primaryAddressIndex;
              if (typeof data.stripeCustomerId === "string") stripeCustomerId = data.stripeCustomerId;
              if (typeof data.stripeCardLast4 === "string") stripeCardLast4 = data.stripeCardLast4;
              if (typeof data.stripeCardBrand === "string") stripeCardBrand = data.stripeCardBrand;
            }
          } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            console.warn("FirebaseAuthHandler: Firestore fetch failed:", message);
          }

          dispatch(
            setCredentials({
              name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
              email: firebaseUser.email || "",
              phone,
              addresses,
              primaryAddressIndex,
              stripeCustomerId,
              stripeCardLast4,
              stripeCardBrand,
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
