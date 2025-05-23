// pages/api/getAlumni.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { app } from "@/lib/firebase";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { uid } = req.query;

  if (!uid || typeof uid !== "string") {
    return res.status(400).json({ error: "UID tidak valid" });
  }

  try {
    const db = getFirestore(app);
    const docRef = doc(db, "alumni", uid);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return res.status(404).json({ error: "Alumni tidak ditemukan" });
    }

    const data = docSnap.data();

    // Optional: jika field di Firestore tidak sesuai interface frontend, bisa map di sini

    return res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching alumni:", error);
    return res.status(500).json({ error: "Terjadi kesalahan server" });
  }
}
