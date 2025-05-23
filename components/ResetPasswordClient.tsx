"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { useEffect, useState } from "react";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";

interface ResetPasswordClientProps {
  id: string;
}

export default function ResetPasswordClient({ id }: ResetPasswordClientProps) {
  const { user, loading } = useAuth("admin");
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.uid !== id)) {
      router.replace("/auth/login");
    }
  }, [loading, user, id, router]);

  const handleReset = async () => {
    setMessage("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage("Semua field wajib diisi.");
      return;
    }

    if (newPassword.length < 6) {
      setMessage("Password baru minimal 6 karakter.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("Password baru dan konfirmasi tidak sama.");
      return;
    }

    if (!user?.email) {
      setMessage("User tidak valid.");
      return;
    }

    setProcessing(true);

    try {
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      setMessage("✅ Password berhasil diubah. Mengalihkan...");
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // Redirect ke dashboard admin setelah 2 detik
      setTimeout(() => {
        router.push(`/dashboard/admin/${id}`);
      }, 2000);
    } catch (error: any) {
      if (error.code === "auth/wrong-password") {
        setMessage("❌ Password saat ini salah.");
      } else {
        setMessage("❌ Terjadi kesalahan: " + error.message);
      }
    }

    setProcessing(false);
  };

  if (loading || user?.uid !== id) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white">
        <p>Memuat halaman reset password...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-700 via-blue-800 to-indigo-900 text-white p-8 flex items-center justify-center">
      <div className="bg-white bg-opacity-10 p-8 rounded-xl shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-black mb-6 text-center">
          Reset Password Admin
        </h2>

        <input
          type="password"
          placeholder="Password Saat Ini"
          className="w-full p-3 mb-3 rounded-lg text-black"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password Baru"
          className="w-full p-3 mb-3 rounded-lg text-black"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="Konfirmasi Password Baru"
          className="w-full p-3 mb-4 rounded-lg text-black"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <button
          onClick={handleReset}
          disabled={processing}
          className={`w-full ${
            success
              ? "bg-green-500 hover:bg-green-600"
              : "bg-yellow-400 hover:bg-yellow-500"
          } text-black font-semibold py-3 rounded-lg transition`}
        >
          {processing ? "Memproses..." : "Reset Password"}
        </button>

        {message && (
          <p
            className={`text-sm mt-4 text-center ${
              success ? "text-green-300" : "text-red-300"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
