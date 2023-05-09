function dotProduct(a: number[], b: number[]): number {
  return a.reduce((acc, value, index) => acc + value * b[index], 0);
}

function vectorLength(a: number[]): number {
  return Math.sqrt(a.reduce((acc, value) => acc + value * value, 0));
}

export function cosineSimilarity(embeddingA: number[], embeddingB: number[]): number {
  const dotProductValue = dotProduct(embeddingA, embeddingB);
  const lengthA = vectorLength(embeddingA);
  const lengthB = vectorLength(embeddingB);

  return dotProductValue / (lengthA * lengthB);
}
