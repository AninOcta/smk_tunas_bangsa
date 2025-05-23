import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter, usePathname } from "next/navigation";

export function useAuth(requiredRole: string) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // Jika sedang di halaman login atau register, jangan redirect
      if (!firebaseUser) {
        if (
          pathname.startsWith("/auth/login") ||
          pathname.startsWith("/auth/register")
        ) {
          setUser(null);
          setLoading(false);
          return;
        }
        // Kalau bukan halaman login/register, redirect ke login
        router.replace("/auth/login");
        setLoading(false);
        return;
      }

      // Cek role user di firestore
      const docSnap = await getDoc(doc(db, "users", firebaseUser.uid));
      if (!docSnap.exists() || docSnap.data().role !== requiredRole) {
        router.replace("/auth/login");
        setLoading(false);
        return;
      }

      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, requiredRole, pathname]);

  return { user, loading };
}
