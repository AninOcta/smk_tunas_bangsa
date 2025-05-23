"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // import useRouter
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";

interface AlumniData {
  id: string;
  name: string;
  jurusan: string;
  tahunLulus: string;
  pekerjaan: string;
  alamat: string;
  skills: string;
}

export default function InfoAlumniPage() {
  const router = useRouter();

  const [alumni, setAlumni] = useState<AlumniData[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Partial<AlumniData>>({});

  const [isEditing, setIsEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchAlumni = async () => {
    setLoading(true);
    const q = query(collection(db, "users"), where("role", "==", "alumni"));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as AlumniData[];
    setAlumni(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchAlumni();
  }, []);

  const handleSubmit = async () => {
    if (!form.id) return;
    if (!form.name) return alert("Nama wajib diisi.");

    try {
      const docRef = doc(db, "users", form.id);
      await updateDoc(docRef, {
        name: form.name,
        jurusan: form.jurusan || "",
        tahunLulus: form.tahunLulus || "",
        pekerjaan: form.pekerjaan || "",
        alamat: form.alamat || "",
        skills: form.skills || "",
      });

      setShowForm(false);
      setForm({});
      setIsEditing(false);

      fetchAlumni();
    } catch (error: any) {
      alert(error.message || "Terjadi kesalahan saat menyimpan data.");
    }
  };

  const handleEdit = (item: AlumniData) => {
    setForm(item);

    setIsEditing(true);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    const confirm = window.confirm("Yakin ingin menghapus data ini?");
    if (!confirm) return;
    await deleteDoc(doc(db, "users", id));
    fetchAlumni();
  };

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-sky-700 via-blue-800 to-indigo-900 text-black">
      <div className="max-w-6xl mx-auto bg-white bg-opacity-10 p-6 rounded-xl shadow-xl">
        {/* Tombol Back */}
        <button
          onClick={() => router.back()}
          className="mb-4 px-4 py-2 bg-gradient-to-br from-sky-700 via-blue-800 to-indigo-900 text-white rounded "
        >
          ← Kembali
        </button>

        <h1 className="text-2xl font-bold mb-6 text-center">Info Alumni</h1>

        {loading ? (
          <p>Memuat data...</p>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white bg-opacity-20">
                <th className="p-2">Nama</th>
                <th className="p-2">Jurusan</th>
                <th className="p-2">Tahun Lulus</th>
                <th className="p-2">Pekerjaan</th>
                <th className="p-2">Alamat</th>
                <th className="p-2">Skills</th>
                <th className="p-2 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {alumni.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-gray-400 hover:bg-opacity-10"
                >
                  <td className="p-2">{item.name}</td>
                  <td className="p-2">{item.jurusan}</td>
                  <td className="p-2">{item.tahunLulus}</td>
                  <td className="p-2">{item.pekerjaan}</td>
                  <td className="p-2">{item.alamat}</td>
                  <td className="p-2">{item.skills}</td>
                  <td className="p-2 text-center space-x-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="bg-green-500 hover:bg-green-600 px-3 py-1 rounded"
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
              {alumni.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-4 text-gray-300">
                    Tidak ada data alumni.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Form Edit / Tambah */}
      {showForm && (
        <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white text-black p-6 rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {isEditing ? "Edit Alumni" : ""}
            </h2>

            <label className="block mb-2 font-semibold">Nama</label>
            <input
              type="text"
              className="w-full p-2 mb-4 border rounded"
              value={form.name || ""}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <label className="block mb-2 font-semibold">Jurusan</label>
            <input
              type="text"
              className="w-full p-2 mb-4 border rounded"
              value={form.jurusan || ""}
              onChange={(e) => setForm({ ...form, jurusan: e.target.value })}
            />

            <label className="block mb-2 font-semibold">Tahun Lulus</label>
            <input
              type="text"
              className="w-full p-2 mb-4 border rounded"
              value={form.tahunLulus || ""}
              onChange={(e) => setForm({ ...form, tahunLulus: e.target.value })}
            />

            <label className="block mb-2 font-semibold">Pekerjaan</label>
            <input
              type="text"
              className="w-full p-2 mb-4 border rounded"
              value={form.pekerjaan || ""}
              onChange={(e) => setForm({ ...form, pekerjaan: e.target.value })}
            />

            <label className="block mb-2 font-semibold">Alamat</label>
            <input
              type="text"
              className="w-full p-2 mb-4 border rounded"
              value={form.alamat || ""}
              onChange={(e) => setForm({ ...form, alamat: e.target.value })}
            />

            <label className="block mb-2 font-semibold">Skills</label>
            <input
              type="text"
              className="w-full p-2 mb-4 border rounded"
              value={form.skills || ""}
              onChange={(e) => setForm({ ...form, skills: e.target.value })}
            />

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
