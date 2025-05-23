"use client";

import { useEffect, useState } from "react";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { tfidfVectorize, cosineSimilarity } from "@/lib/similarity";
import { getAuth } from "firebase/auth";
import { useRouter } from "next/navigation";

interface Alumni {
  name: string;
  jurusan: string;
  tahunLulus: string;
  pekerjaan: string;
  alamat: string;
  skills: string;
  imageUrl: string;
  role?: string;
}

interface Perusahaan {
  nama: string;
  bidangIndustri: string;
  kualifikasi: string;
  lokasi: string;
  skillDibutuhkan: string;
  fotoUrl: string;
  similarity?: number;
}

function cleanText(text: string | undefined) {
  return (text || "").toLowerCase().trim().replace(/\s+/g, " "); // normalize whitespace
}

export default function RekomendasiPage() {
  const [rekomendasi, setRekomendasi] = useState<Perusahaan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alumniName, setAlumniName] = useState<string>("");

  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
          setError("Kamu belum login.");
          setLoading(false);
          return;
        }

        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          setError("Data alumni tidak ditemukan.");
          setLoading(false);
          return;
        }

        const alumni = docSnap.data() as Alumni;

        if (alumni.role !== "alumni") {
          setError(
            "Akses ditolak. Hanya alumni yang bisa melihat rekomendasi."
          );
          setLoading(false);
          return;
        }

        setAlumniName(alumni.name);

        const perusahaanSnap = await getDocs(collection(db, "perusahaan"));
        const perusahaanList: Perusahaan[] = perusahaanSnap.docs.map(
          (doc) => doc.data() as Perusahaan
        );

        if (perusahaanList.length === 0) {
          setError("Belum ada data perusahaan.");
          setLoading(false);
          return;
        }

        // Pisahkan jurusan dan skills sebagai query
        const jurusanQuery = cleanText(alumni.jurusan);
        const skillsQuery = cleanText(alumni.skills);

        // Siapkan dokumen kualifikasi dan skill yang dibutuhkan
        const kualifikasiDocs = perusahaanList.map((p) =>
          cleanText(p.kualifikasi)
        );
        const skillDocs = perusahaanList.map((p) =>
          cleanText(p.skillDibutuhkan)
        );

        // Vectorize jurusan dan kualifikasi
        const [jurusanVec, kualifikasiVecs] = tfidfVectorize(
          jurusanQuery,
          kualifikasiDocs
        );

        // Vectorize skills dan skillDibutuhkan
        const [skillsVec, skillVecs] = tfidfVectorize(skillsQuery, skillDocs);

        // Hitung similarity per perusahaan
        const scored = perusahaanList
          .map((p, idx) => {
            const simJurusan = cosineSimilarity(
              jurusanVec,
              kualifikasiVecs[idx]
            );
            const simSkills = cosineSimilarity(skillsVec, skillVecs[idx]);

            const combinedSim = (simJurusan + simSkills) / 2;

            return {
              ...p,
              similarity: isNaN(combinedSim) ? 0 : combinedSim,
            };
          })
          .filter((p) => (p.similarity ?? 0) > 0); // hanya tampilkan yang punya similarity > 0

        // Urutkan descending by similarity
        const sorted = scored.sort(
          (a, b) => (b.similarity ?? 0) - (a.similarity ?? 0)
        );

        // Tampilkan maksimal 5 rekomendasi yang punya similarity > 0
        setRekomendasi(sorted.slice(0, 5));
      } catch (err) {
        console.error("Gagal memuat data:", err);
        setError("Terjadi kesalahan saat memuat data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading)
    return (
      <p className="text-center mt-10 text-gray-700 text-lg">
        ⏳ Sedang memuat rekomendasi...
      </p>
    );
  if (error)
    return (
      <p className="text-center mt-10 text-red-600 font-semibold text-lg">
        {error}
      </p>
    );

  if (rekomendasi.length === 0)
    return (
      <p className="text-center mt-10 text-gray-700 text-lg">
        😞 Maaf, tidak ada rekomendasi perusahaan yang cocok saat ini.
      </p>
    );

  return (
    <div className="p-6 w-full h-screen mx-auto bg-indigo-600 ">
      <button
        onClick={() => router.back()}
        className="mb-6 px-4 py-2 bg-white hover:bg-gray-400 text-indigo-700 rounded-md shadow-md transition duration-300"
      >
        ← Kembali
      </button>

      <h1 className="text-3xl font-bold mb-8 text-gray-900">
        Hai <span className="text-white">{alumniName}</span>, berikut
        rekomendasi perusahaan yang cocok untukmu:
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {rekomendasi.map((p, i) => {
          const percent = (p.similarity ?? 0) * 100;
          const barWidth = Math.max(percent, 1);

          return (
            <div
              key={i}
              className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow duration-300"
            >
              <img
                src={p.fotoUrl}
                alt={p.nama}
                className="w-full h-[350px] object-cover"
                loading="lazy"
              />
              <div className="p-5">
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                  {p.nama}
                </h2>
                <p className="text-gray-600 mb-1">
                  <strong>📌 Bidang:</strong> {p.bidangIndustri}
                </p>
                <p className="text-gray-600 mb-1">
                  <strong>📍 Lokasi:</strong> {p.lokasi}
                </p>
                <p className="text-gray-600 mb-1">
                  <strong>🎓 Kualifikasi:</strong> {p.kualifikasi}
                </p>
                <p className="text-gray-600 mb-3">
                  <strong>🛠️ Skill Dibutuhkan:</strong> {p.skillDibutuhkan}
                </p>

                {/* Bar Persentase */}
                <div className="w-full bg-gray-200 rounded-full h-4 mb-1">
                  <div
                    className="bg-indigo-600 h-4 rounded-full transition-all duration-500"
                    style={{ width: `${barWidth.toFixed(2)}%` }}
                  />
                </div>
                <p className="text-indigo-700 font-semibold text-right text-sm">
                  Kecocokan: {percent.toFixed(2)}%
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
