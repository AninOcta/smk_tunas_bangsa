export function tfidfVectorize(
  query: string,
  docs: string[]
): [number[], number[][]] {
  const allDocs = [query, ...docs];
  const terms = new Set<string>();

  // Tokenisasi dan kumpulkan semua kata unik dari semua dokumen
  allDocs.forEach((doc) =>
    doc
      .toLowerCase()
      .split(/\W+/)
      .filter(Boolean) // pastikan tidak ada string kosong
      .forEach((word) => terms.add(word))
  );

  const vocab = Array.from(terms);

  // Hitung TF (Term Frequency)
  const tf = allDocs.map((doc) => {
    const words = doc.toLowerCase().split(/\W+/).filter(Boolean);
    return vocab.map((term) => {
      if (words.length === 0) return 0;
      const count = words.filter((w) => w === term).length;
      return count / words.length;
    });
  });

  // Hitung DF (Document Frequency)
  const df = vocab.map((_, idx) =>
    tf.reduce((count, vec) => (vec[idx] > 0 ? count + 1 : count), 0)
  );

  // Smoothing IDF untuk menghindari pembagian dengan nol
  const idf = df.map((d) => Math.log((allDocs.length + 1) / (d + 1)) + 1);

  // Hitung TF-IDF untuk setiap dokumen
  const tfidf = tf.map((vec) => vec.map((tfval, i) => tfval * idf[i]));

  return [tfidf[0], tfidf.slice(1)];
}
export function cosineSimilarity(a: number[], b: number[]): number {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return magA && magB ? dot / (magA * magB) : 0;
}
