"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import {
  getDoc,
  doc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [nisn, setNisn] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  // Cek jika user sudah login, langsung redirect
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docSnap = await getDoc(doc(db, "users", user.uid));
        if (docSnap.exists() && docSnap.data().role === "alumni") {
          router.replace(`/dashboard/alumni/${user.uid}`);
        }
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Cari user berdasarkan NISN di Firestore
      const q = query(collection(db, "users"), where("nisn", "==", nisn));
      const snap = await getDocs(q);

      if (snap.empty) {
        alert("NISN tidak ditemukan!");
        return;
      }

      const userData = snap.docs[0].data();
      const email = userData.email;

      // Login pakai email yang ditemukan
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const user = userCred.user;

      // Cek role di Firestore
      const docSnap = await getDoc(doc(db, "users", user.uid));
      if (docSnap.exists() && docSnap.data().role === "alumni") {
        router.push(`/dashboard/alumni/${user.uid}`);
      } else {
        alert("Hanya alumni yang bisa login!");
        await auth.signOut();
      }
    } catch (err) {
      console.error(err);
      alert("Login gagal, cek NISN dan password!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-700 to-indigo-900 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-8 text-center">
          Masuk ke Akunmu
        </h2>
        <form onSubmit={handleLogin} className="space-y-6">
          <input
            type="text"
            placeholder="NISN"
            className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
            value={nisn}
            onChange={(e) => setNisn(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white font-semibold transition"
          >
            Masuk
          </button>
        </form>
        <p className="mt-6 text-center text-gray-600">
          Belum punya akun?{" "}
          <Link
            href="/auth/register"
            className="text-indigo-600 font-semibold hover:underline"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}