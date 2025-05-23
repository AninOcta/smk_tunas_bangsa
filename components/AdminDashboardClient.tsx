"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { useEffect } from "react";
import { Briefcase, Users, LockKeyhole } from "lucide-react";

interface AdminDashboardClientProps {
  id: string;
}

export default function AdminDashboardClient({
  id,
}: AdminDashboardClientProps) {
  const { user, loading } = useAuth("admin");
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/login");
    }
  }, [loading, user, router]);

  const handleLogout = async () => {
    await auth.signOut();
    router.replace("/auth/login");
  };

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-300 text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-white text-white ">
      <div className="w-full h-auto p-5 bg-white justify-start flex  items-center ">
        <div className="col-span-2 text-start">
          <img
            src="/assets/images/logoSMK.png"
            alt="Foto Profil"
            className="w-[150px] h-[150px]  mx-auto   border-white"
          />
        </div>
        <div className="col-span-2 text-start flex flex-col justify-start items-start">
          <div className="col-span-2 text-start">
            <h1 className="text-3xl font-bold text-center text-black">
              SMK TUNAS BANGSA
            </h1>
          </div>
          <div className="col-span-2 text-start">
            <h1 className="text-lg text-center font-bold text-black t">
              Cerdas - Tangkas - Jujur - Berkualitas
            </h1>
          </div>
        </div>
      </div>
      <div className="w-full h-auto p-8 bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-600 justify-end flex  items-end">
        <nav className="">
          <div className="max-w-7xl mx-auto px-4  flex justify-between items-center">
            <ul className="flex space-x-4 text-white">
              <li>
                <button
                  onClick={handleLogout}
                  className="text-white hover:text-gray-400"
                >
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </nav>
      </div>
      <header className="flex justify-between items-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-wide">
          Admin Dashboard
        </h1>
      </header>

      <main className=" bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-600 backdrop-blur-sm rounded-xl p-8 shadow-lg max-w-6xl mx-auto">
        <section>
          <h2 className="text-xl text-black sm:text-2xl font-semibold mb-2">
            Selamat datang, {user?.email}
          </h2>
          <p className="mb-8 text-white/80">
            Kelola data alumni, perusahaan mitra, dan pengaturan admin dari satu
            tempat.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div
              onClick={() =>
                handleNavigate(`/dashboard/admin/${user?.uid}/info-alumni`)
              }
              className="group bg-white hover:bg-white/70 text-black rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer shadow-md transition transform hover:scale-105"
            >
              <Users className="w-10 h-10 text-blue-800 mb-4 group-hover:animate-pulse" />
              <h3 className="text-lg font-bold mb-1">Info Alumni</h3>
              <p className="text-sm text-black/80">
                Kelola data dan profil alumni.
              </p>
            </div>

            <div
              onClick={() =>
                handleNavigate(`/dashboard/admin/${user?.uid}/data-perusahaan`)
              }
              className="group bg-white hover:bg-white/70 text-black rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer shadow-md transition transform hover:scale-105"
            >
              <Briefcase className="w-10 h-10 text-teal-800 mb-4 group-hover:animate-pulse" />
              <h3 className="text-lg font-bold mb-1">Data Perusahaan</h3>
              <p className="text-sm text-black/80">
                Kelola perusahaan mitra & lowongan.
              </p>
            </div>

            <div
              onClick={() =>
                handleNavigate(`/dashboard/admin/${user?.uid}/reset-password`)
              }
              className="group bg-white hover:bg-white/70 text-black rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer shadow-md transition transform hover:scale-105"
            >
              <LockKeyhole className="w-10 h-10 text-orange-800 mb-4 group-hover:animate-pulse" />
              <h3 className="text-lg font-bold mb-1">Reset Password</h3>
              <p className="text-sm text-black/80">
                Ubah password akun admin Anda.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
