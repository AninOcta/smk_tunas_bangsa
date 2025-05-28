"use client";

import { useEffect, useState } from "react";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { tfidfVectorize, cosineSimilarity } from "@/lib/similarity";
import { getAuth } from "firebase/auth";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

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
  id?: string;
  nama: string;
  bidangIndustri: string;
  kualifikasi: string;
  lokasi: string;
  skillDibutuhkan: string;
  fotoUrl: string;
}

interface ScoredPerusahaan extends Perusahaan {
  similarity: number;
}

function cleanText(text: string | undefined): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export default function RekomendasiPage() {
  const [rekomendasi, setRekomendasi] = useState<ScoredPerusahaan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alumniName, setAlumniName] = useState("");
  const [progress, setProgress] = useState(0);

  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) throw new Error("Anda belum login");

        const alumniSnap = await getDoc(doc(db, "users", user.uid));
        if (!alumniSnap.exists())
          throw new Error("Data alumni tidak ditemukan");

        const alumni = alumniSnap.data() as Alumni;
        if (alumni.role !== "alumni") {
          throw new Error("Hanya alumni yang dapat melihat rekomendasi");
        }

        setAlumniName(alumni.name);

        const perusahaanSnap = await getDocs(collection(db, "perusahaan"));
        const perusahaanList: Perusahaan[] = perusahaanSnap.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            } as Perusahaan)
        );

        if (perusahaanList.length === 0) {
          throw new Error("Belum ada data perusahaan");
        }

        const jurusanQuery = cleanText(alumni.jurusan);
        const skillsQuery = cleanText(alumni.skills);
        const kualifikasiDocs = perusahaanList.map((p) =>
          cleanText(p.kualifikasi)
        );
        const skillDocs = perusahaanList.map((p) =>
          cleanText(p.skillDibutuhkan)
        );

        setProgress(30);

        const jurusanResult = tfidfVectorize(jurusanQuery, kualifikasiDocs);
        if (!jurusanResult) throw new Error("Gagal memproses data jurusan");

        const {
          queryVector: jurusanVec,
          docVectors: kualifikasiVecs,
          vocab: jurusanVocab,
        } = jurusanResult;

        const skillsResult = tfidfVectorize(skillsQuery, skillDocs);
        if (!skillsResult) throw new Error("Gagal memproses data skills");

        const {
          queryVector: skillsVec,
          docVectors: skillVecs,
          vocab: skillsVocab,
        } = skillsResult;

        setProgress(70);

        if (
          jurusanVec.length === 0 ||
          skillsVec.length === 0 ||
          kualifikasiVecs.length !== perusahaanList.length
        ) {
          throw new Error("Gagal memproses data teks");
        }

        const scored = perusahaanList.map((p, i) => {
          const simJurusan = cosineSimilarity(jurusanVec, kualifikasiVecs[i]);
          const simSkills = cosineSimilarity(skillsVec, skillVecs[i]);

          const similarity = simJurusan * 0.4 + simSkills * 0.6;

          return {
            ...p,
            similarity: parseFloat(similarity.toFixed(4)),
          };
        });

        const filtered = scored.filter((p) => p.similarity > 0.1);
        const sorted = filtered.sort((a, b) => b.similarity - a.similarity);

        setRekomendasi(sorted.slice(0, 5));
        setProgress(100);
      } catch (err: any) {
        console.error("Error:", err);
        setError(err.message || "Terjadi kesalahan");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50 p-4">
        <div className="w-full max-w-md space-y-6">
          <h2 className="text-2xl font-bold text-center text-gray-800">
            Menemukan Rekomendasi Terbaik
          </h2>
          <div className="space-y-2"></div>
          <p className="text-center text-gray-600 animate-pulse">
            Menganalisis profil dan mencocokkan dengan perusahaan...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50 p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center"
        >
          <div className="text-red-500 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Terjadi Kesalahan
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-lg shadow hover:shadow-md transition-all hover:scale-105"
          >
            Coba Lagi
          </button>
        </motion.div>
      </div>
    );
  }

  if (rekomendasi.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50 p-4">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center"
        >
          <div className="text-blue-500 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Tidak Ada Rekomendasi
          </h2>
          <p className="text-gray-600 mb-6">
            Kami tidak menemukan perusahaan yang cocok dengan profil Anda. Coba
            perbarui profil dengan informasi yang lebih lengkap.
          </p>
          <button
            onClick={() => router.push("/profile")}
            className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-lg shadow hover:shadow-md transition-all hover:scale-105"
          >
            Ke Halaman Profil
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <button
            onClick={() => router.back()}
            className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Kembali
          </button>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-12 text-center"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            Rekomendasi Perusahaan
          </h1>
          <p className="text-lg text-gray-600">
            Untuk{" "}
            <span className="font-semibold text-indigo-600">{alumniName}</span>
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {rekomendasi.map((p, index) => (
            <motion.div
              key={p.id}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={p.fotoUrl || "/placeholder-company.jpg"}
                  alt={p.nama}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <h2 className="text-xl font-bold text-white">{p.nama}</h2>
                  <p className="text-blue-200">{p.bidangIndustri}</p>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-500 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <p className="text-gray-600">{p.lokasi}</p>
                </div>

                <div className="space-y-3 mb-6">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                      Kualifikasi
                    </h3>
                    <p className="text-gray-700">{p.kualifikasi}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                      Skill Dibutuhkan
                    </h3>
                    <p className="text-gray-700">{p.skillDibutuhkan}</p>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      Kecocokan
                    </span>
                    <span className="text-sm font-bold text-indigo-600">
                      {(p.similarity * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-gradient-to-r from-blue-400 to-indigo-600 h-2.5 rounded-full"
                      style={{ width: `${(p.similarity * 100).toFixed(1)}%` }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 text-center"
        >
          <p className="text-gray-500">
            Menemukan {rekomendasi.length} rekomendasi terbaik untuk Anda
          </p>
        </motion.div>
      </div>
    </div>
  );
}