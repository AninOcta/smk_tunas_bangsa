"use client";

import { useState } from "react";
import Link from "next/link";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function AdminRegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Password dan konfirmasi password tidak sama!");
      return;
    }
    try {
      const userCred = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCred.user;

      // Simpan data user ke Firestore dengan role admin
      await setDoc(doc(db, "users", user.uid), {
        email,
        role: "admin",
        createdAt: new Date(),
      });

      router.push(`/dashboard/admin/${user.uid}`);
    } catch (err) {
      console.error(err);
      alert("Register gagal, coba lagi!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-green-600 via-teal-600 to-cyan-600 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-8 text-center">
          Register Admin
        </h2>
        <form onSubmit={handleRegister} className="space-y-6">
          <input
            type="email"
            placeholder="Email"
            className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirm Password"
            className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full py-3 bg-teal-600 hover:bg-teal-700 rounded-lg text-white font-semibold transition"
          >
            Register
          </button>
        </form>
        <p className="mt-6 text-center text-gray-600">
          Sudah punya akun?{" "}
          <Link
            href="/auth/admin-login"
            className="text-teal-600 font-semibold hover:underline"
          >
            Login Admin
          </Link>
        </p>
      </div>
    </div>
  );
}
