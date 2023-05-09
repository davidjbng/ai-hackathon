export type Chunk = {
  content: string;
  link: string;
  title: string;
  modified: string;
  tokens: number;
};

export type EmbeddedChunk = Chunk & { embedding: number[] };
