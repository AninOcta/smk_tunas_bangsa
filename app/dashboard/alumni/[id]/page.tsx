"use client";

import { useAuth } from "@/hooks/useAuth";
import { useParams, useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";

import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";

interface AlumniDashboardPageProps {
  params: {
    id: string;
  };
}

export default function AlumniDashboardPage() {
  const { id } = useParams();
  const { user, loading } = useAuth("alumni");
  const router = useRouter();

  const [alumniData, setAlumniData] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    jurusan: "",
    tahunLulus: "",
    pekerjaan: "",
    alamat: "",
    skills: "",
  });

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/login");
    }

    const fetchAlumniData = async () => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) return;

        const data = docSnap.data();
        if (
          !data.name ||
          !data.jurusan ||
          !data.tahunLulus ||
          !data.pekerjaan ||
          !data.alamat ||
          !data.skills
        ) {
          // You can alert or warn user here instead of redirecting
          console.warn("Lengkapi semua data profil terlebih dahulu.");
        }

        setAlumniData(data);
        setFormData({
          name: data.name || "",
          jurusan: data.jurusan || "",
          tahunLulus: data.tahunLulus || "",
          pekerjaan: data.pekerjaan || "",
          alamat: data.alamat || "",
          skills: data.skills || "",
        });
      }
    };

    fetchAlumniData();
  }, [loading, user, router]);

  const handleLogout = async () => {
    await auth.signOut();
    router.replace("/auth/login");
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleUpdate = async () => {
    if (!user) return;

    try {
      const docRef = doc(db, "users", user.uid);

      const updatedData = { ...formData };
      await updateDoc(docRef, updatedData);
      setAlumniData(updatedData);
      setEditMode(false);
    } catch (error) {
      console.error("Gagal update:", error);
    }
  };

  if (loading || !alumniData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 text-lg">Loading...</p>
      </div>
    );
  }

  function handleNavigate(path: string): void {
    router.push(path);
  }

  return (
    <div className="h-auto w-full  text-black ">
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
                  onClick={() =>
                    handleNavigate(`/dashboard/alumni/${user?.uid}`)
                  }
                  className="text-white hover:text-gray-400"
                >
                  Dashboard
                </button>
              </li>
              <li>
                <button
                  onClick={() =>
                    handleNavigate(`/dashboard/alumni/${user?.uid}/rekomendasi`)
                  }
                  className="text-white hover:text-gray-400"
                >
                  Rekomendasi
                </button>
              </li>
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

      <main className="bg-white p-8  w-full h-auto mx-auto">
        <h1 className="text-4xl font-bold">Dashboard Alumni</h1>
        <h2 className="text-2xl font-semibold mb-4">
          Selamat datang, {alumniData.name}
        </h2>
        <h1 className="mb-6 text-black/80 text-xl text-center py-8 font-bold">
          Data profil kamu:
        </h1>

        {!editMode ? (
          <>
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white bg-opacity-30  p-16">
              <div>
                <h3 className="font-bold">Email:</h3>
                <p>{user?.email}</p>
              </div>
              <div>
                <h3 className="font-bold">Nama Lengkap:</h3>
                <p>{alumniData.name}</p>
              </div>
              <div>
                <h3 className="font-bold">Jurusan:</h3>
                <p>{alumniData.jurusan}</p>
              </div>
              <div>
                <h3 className="font-bold">Tahun Lulus:</h3>
                <p>{alumniData.tahunLulus}</p>
              </div>
              <div>
                <h3 className="font-bold">Pekerjaan:</h3>
                <p>{alumniData.pekerjaan}</p>
              </div>
              <div>
                <h3 className="font-bold">Alamat:</h3>
                <p>{alumniData.alamat}</p>
              </div>
              <div className="col-span-2">
                <h3 className="font-bold">Keahlian / Skill:</h3>
                <p>{alumniData.skills}</p>
              </div>
            </section>

            <div className="mt-6 text-center">
              <button
                onClick={() => setEditMode(true)}
                className="bg-yellow-400 hover:bg-yellow-500 transition px-6 py-2 rounded-lg font-semibold"
              >
                Edit Profil
              </button>
            </div>
            <h1 className="text-center text-red-500 mt-4">
              * Jika data belum lengkap, masukan data diri terlebih dahulu
              dengan klik tombol edit profil.{" "}
            </h1>
          </>
        ) : (
          <>
            <section className="bg-white bg-opacity-30 rounded-xl p-6 space-y-4">
              {Object.entries(formData).map(
                ([key, value]) =>
                  key !== "skills" &&
                  key !== "imageUrl" && (
                    <div key={key}>
                      <label className="block font-semibold capitalize">
                        {key}
                      </label>
                      <input
                        type="text"
                        name={key}
                        value={value}
                        onChange={handleInputChange}
                        className="w-full p-2 rounded bg-white/80 mt-1"
                      />
                    </div>
                  )
              )}
              <div>
                <label className="block font-semibold">Keahlian / Skill</label>
                <textarea
                  name="skills"
                  value={formData.skills}
                  onChange={handleInputChange}
                  className="w-full p-2 rounded bg-white/80 mt-1"
                />
              </div>
            </section>

            <div className="flex justify-end mt-6 gap-4">
              <button
                onClick={() => setEditMode(false)}
                className="bg-gray-400 hover:bg-gray-500 px-4 py-2 rounded-lg text-white"
              >
                Batal
              </button>
              <button
                onClick={handleUpdate}
                className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg text-white font-bold"
              >
                Simpan
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
