export interface VectorResult {
  queryVector: number[];
  docVectors: number[][];
  vocab: string[];
}

export function tfidfVectorize(
  query: string,
  docs: string[]
): VectorResult | undefined {
  if (!query || !docs) return { queryVector: [], docVectors: [], vocab: [] };

  const allDocs = [query, ...docs];
  const terms = new Set<string>();

  allDocs.forEach((doc) =>
    doc
      .toLowerCase()
      .split(/[^\w]+/)
      .filter((word) => word.length > 2)
      .forEach((word) => terms.add(word))
  );

  const vocab = Array.from(terms);
  if (vocab.length === 0) return { queryVector: [], docVectors: [], vocab: [] };

  const tf = allDocs.map((doc) => {
    const words = doc
      .toLowerCase()
      .split(/[^\w]+/)
      .filter((word) => word.length > 2);

    return vocab.map((term) => {
      const count = words.filter((w) => w === term).length;
      return count / Math.max(words.length, 1);
    });
  });

  const df = vocab.map((_, idx) =>
    tf.reduce((count, vec) => (vec[idx] > 0 ? count + 1 : count), 0)
  );

  const idf = df.map((d) => Math.log((allDocs.length + 1) / (d + 1)) + 1);

  const tfidf = tf.map((vec) => vec.map((tfVal, i) => tfVal * idf[i]));

  console.debug("TF-IDF Debug:", {
    vocab,
    tf: tf.map((v) => v.map((n) => n.toFixed(2))),
    df,
    idf: idf.map((n) => n.toFixed(2)),
  });

  return {
    queryVector: tfidf[0],
    docVectors: tfidf.slice(1),
    vocab,
  };
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;

  let dot = 0;
  let magA = 0;
  let magB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }

  magA = Math.sqrt(magA);
  magB = Math.sqrt(magB);

  const similarity = magA && magB ? dot / (magA * magB) : 0;
  return Math.min(Math.max(similarity, 0), 1);
}