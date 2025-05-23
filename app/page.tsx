"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function HomePage() {
  const router = useRouter();
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Trigger animation after mount
    const timeout = setTimeout(() => setShow(true), 100);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-700 to-indigo-900 px-6 text-white overflow-hidden">
      <div
        className={`text-center max-w-2xl transform transition duration-1000 ${
          show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <h1 className="text-4xl sm:text-6xl font-bold mb-4 drop-shadow-lg animate-pulse">
          Selamat Datang di <br /> SMK Tunas Bangsa
        </h1>

        <p className="text-lg sm:text-xl mb-8 text-white/80 animate-fade-in-down">
          Membangun masa depan cerah dengan keahlian dan karakter unggul.
        </p>

        <button
          onClick={() => router.push("/auth/login")}
          className="bg-white text-blue-700 hover:scale-105 hover:bg-gray-100 font-semibold text-lg px-6 py-3 rounded-xl shadow-lg transition-all duration-300 ease-in-out"
        >
          Masuk ke Sistem
        </button>
      </div>
    </main>
  );
}
