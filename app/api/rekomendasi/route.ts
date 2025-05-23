import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import natural from "natural";

const tokenizer = new natural.WordTokenizer();
const TfIdf = natural.TfIdf;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const uid = searchParams.get("uid");

  if (!uid) {
    return NextResponse.json({ error: "UID tidak ditemukan" }, { status: 400 });
  }

  const alumniQuery = query(collection(db, "alumni"), where("uid", "==", uid));
  const alumniSnapshot = await getDocs(alumniQuery);

  if (alumniSnapshot.empty) {
    return NextResponse.json(
      { error: "Data alumni tidak ditemukan" },
      { status: 404 }
    );
  }

  const alumniData = alumniSnapshot.docs[0].data();
  const perusahaanSnapshot = await getDocs(collection(db, "perusahaan"));

  const perusahaan = perusahaanSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as {
      kualifikasi: string;
      skillDibutuhkan: string;
      nama: string;
    }),
  }));

  const tfidf = new TfIdf();
  const queryText = `${alumniData.jurusan} ${alumniData.skills}`;

  perusahaan.forEach((p) => {
    const docText = `${p.kualifikasi} ${p.skillDibutuhkan}`;
    tfidf.addDocument(docText, p.id);
  });

  let scores: { id: string; nama: string; score: number }[] = [];

  tfidf.tfidfs(queryText, function (i, measure) {
    scores.push({
      id: perusahaan[i].id,
      nama: perusahaan[i].nama,
      score: measure,
    });
  });

  scores.sort((a, b) => b.score - a.score);

  return NextResponse.json({
    alumni: alumniData.nama,
    rekomendasi: scores.slice(0, 3),
  });
}
