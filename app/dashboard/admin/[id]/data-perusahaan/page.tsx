"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  addDoc,
} from "firebase/firestore";
import { uploadToCloudinary } from "../../../../api/upload"; // pastikan pathnya benar

interface PerusahaanData {
  id: string;
  nama: string;
  bidangIndustri: string;
  kualifikasi: string;
  lokasi: string;
  skillDibutuhkan: string;
  fotoUrl?: string;
}

export default function DataPerusahaanPage() {
  const router = useRouter();
  const [perusahaan, setPerusahaan] = useState<PerusahaanData[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<
    Partial<PerusahaanData> & { fileUpload?: File }
  >({});
  const [isEditing, setIsEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchPerusahaan = async () => {
    setLoading(true);
    const snapshot = await getDocs(collection(db, "perusahaan"));
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as PerusahaanData[];
    setPerusahaan(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchPerusahaan();
  }, []);

  const handleSubmit = async () => {
    if (!form.nama) return alert("Nama perusahaan wajib diisi.");

    try {
      // Simpan dulu URL foto jika ada
      let imageUrl = form.fotoUrl || "";

      if (form.fileUpload) {
        const uploadedImageUrl = await uploadToCloudinary(form.fileUpload);
        if (!uploadedImageUrl) throw new Error("Gagal mengunggah gambar.");
        imageUrl = uploadedImageUrl;
      }

      if (isEditing && form.id) {
        const docRef = doc(db, "perusahaan", form.id);
        await updateDoc(docRef, {
          nama: form.nama,
          bidangIndustri: form.bidangIndustri || "",
          kualifikasi: form.kualifikasi || "",
          lokasi: form.lokasi || "",
          skillDibutuhkan: form.skillDibutuhkan || "",
          fotoUrl: imageUrl,
        });
      } else {
        await addDoc(collection(db, "perusahaan"), {
          nama: form.nama,
          bidangIndustri: form.bidangIndustri || "",
          kualifikasi: form.kualifikasi || "",
          lokasi: form.lokasi || "",
          skillDibutuhkan: form.skillDibutuhkan || "",
          fotoUrl: imageUrl,
        });
      }

      setShowForm(false);
      setForm({});
      setIsEditing(false);
      fetchPerusahaan();
    } catch (error: any) {
      alert(error.message || "Terjadi kesalahan saat menyimpan data.");
    }
  };

  const handleEdit = (item: PerusahaanData) => {
    setForm(item);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    const confirm = window.confirm("Yakin ingin menghapus data ini?");
    if (!confirm) return;
    await deleteDoc(doc(db, "perusahaan", id));
    fetchPerusahaan();
  };

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-green-700 via-green-800 to-green-900 text-white">
      <div className="max-w-6xl mx-auto bg-white bg-opacity-10 p-6 rounded-xl shadow-xl">
        <button
          onClick={() => router.back()}
          className="mb-4 px-4 py-2 bg-gradient-to-br from-green-700 via-green-800 to-green-900 text-white rounded "
        >
          ← Kembali
        </button>
        <h1 className="text-2xl text-black font-bold mb-6 text-center">
          Data Perusahaan
        </h1>

        <div className="mb-4 text-right">
          <button
            onClick={() => {
              setForm({});
              setIsEditing(false);
              setShowForm(true);
            }}
            className="bg-gradient-to-br from-green-700 via-green-800 to-green-900 text-white  px-4 py-2 rounded"
          >
            Tambah Perusahaan
          </button>
        </div>

        {loading ? (
          <p>Memuat data...</p>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white bg-opacity-20 text-black">
                <th className="p-2">Nama Perusahaan</th>
                <th className="p-2">Bidang Industri</th>
                <th className="p-2">Kualifikasi</th>
                <th className="p-2">Lokasi</th>
                <th className="p-2">Skill Dibutuhkan</th>
                <th className="p-2">Foto</th>
                <th className="p-2 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {perusahaan.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-gray-400 hover:bg-opacity-10 text-black"
                >
                  <td className="p-2">{item.nama}</td>
                  <td className="p-2">{item.bidangIndustri}</td>
                  <td className="p-2">{item.kualifikasi}</td>
                  <td className="p-2">{item.lokasi}</td>
                  <td className="p-2">{item.skillDibutuhkan}</td>
                  <td className="p-2">
                    {item.fotoUrl ? (
                      <img
                        src={item.fotoUrl}
                        alt={item.nama}
                        className="w-20 h-20 object-cover rounded"
                      />
                    ) : (
                      <span className="text-gray-400 italic">
                        Tidak ada foto
                      </span>
                    )}
                  </td>
                  <td className="p-2  text-center space-x-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="bg-green-500 hover:bg-green-600 px-3 m-2 py-1 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
              {perusahaan.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-gray-300">
                    Tidak ada data perusahaan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white text-black p-6 rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {isEditing ? "Edit Perusahaan" : "Tambah Perusahaan"}
            </h2>

            <label className="block mb-2 font-semibold">Nama Perusahaan</label>
            <input
              type="text"
              className="w-full p-2 mb-4 border rounded"
              value={form.nama || ""}
              onChange={(e) => setForm({ ...form, nama: e.target.value })}
            />

            <label className="block mb-2 font-semibold">Bidang Industri</label>
            <input
              type="text"
              className="w-full p-2 mb-4 border rounded"
              value={form.bidangIndustri || ""}
              onChange={(e) =>
                setForm({ ...form, bidangIndustri: e.target.value })
              }
            />

            <label className="block mb-2 font-semibold">Kualifikasi</label>
            <input
              type="text"
              className="w-full p-2 mb-4 border rounded"
              value={form.kualifikasi || ""}
              onChange={(e) =>
                setForm({ ...form, kualifikasi: e.target.value })
              }
            />

            <label className="block mb-2 font-semibold">Lokasi</label>
            <input
              type="text"
              className="w-full p-2 mb-4 border rounded"
              value={form.lokasi || ""}
              onChange={(e) => setForm({ ...form, lokasi: e.target.value })}
            />

            <label className="block mb-2 font-semibold">Skill Dibutuhkan</label>
            <input
              type="text"
              className="w-full p-2 mb-6 border rounded"
              value={form.skillDibutuhkan || ""}
              onChange={(e) =>
                setForm({ ...form, skillDibutuhkan: e.target.value })
              }
            />

            {/* Upload Foto Perusahaan */}
            <label className="block mb-2 font-semibold">Foto Perusahaan</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  fileUpload: e.target.files ? e.target.files[0] : undefined,
                }))
              }
            />

            {/* Preview Foto jika ada */}
            {form.fotoUrl && !form.fileUpload && (
              <img
                src={form.fotoUrl}
                alt="Preview"
                className="w-32 h-32 object-cover rounded mt-2 mb-4"
              />
            )}
            {form.fileUpload && (
              <img
                src={URL.createObjectURL(form.fileUpload)}
                alt="Preview Upload"
                className="w-32 h-32 object-cover rounded mt-2 mb-4"
              />
            )}

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowForm(false);
                  setForm({});
                  setIsEditing(false);
                }}
                className="px-4 py-2 bg-gray-400 rounded hover:bg-gray-500 text-black"
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 text-black"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
