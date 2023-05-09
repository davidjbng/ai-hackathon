import "dotenv/config";
import { Configuration, OpenAIApi } from "openai";
import { createInterface } from "node:readline/promises";
import { EmbeddedChunk } from "../data/types";
import chunks from "../data/embeddings.json";
import { cosineSimilarity } from "./cosineSimilarity";

const apiKey = process.env.API_KEY;

function getConfig(model: string) {
  return new Configuration({
    apiKey,
    basePath: `https://lise-openai-gpt4.openai.azure.com/openai/deployments/${model}`,
    baseOptions: {
      headers: {
        "api-key": apiKey,
      },
      params: {
        "api-version": "2023-03-15-preview",
      },
    },
  });
}

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});
const query = await rl.question("What is your question?");

const adaModel = new OpenAIApi(getConfig("text-embedding-ada-002"));
const embeddingResponse = await adaModel.createEmbedding({
  model: "text-embedding-ada-002",
  input: query,
});
const queryEmbedding = embeddingResponse.data.data[0].embedding;

const sourceData = chunks as EmbeddedChunk[];
const rankedResults = sourceData.sort(
  (a, b) =>
    cosineSimilarity(queryEmbedding, b.embedding) -
    cosineSimilarity(queryEmbedding, a.embedding)
);

// TODO: limit results by available tokens
const topResults = rankedResults.slice(0, 8);

const articles = topResults.map(
  (result) => `${result.title}\n${result.content}\n${result.link}\n`
);

// comment in to debug articles
// console.log("Top results:", articles.join("\n"));

const gpt4Model = new OpenAIApi(getConfig("gpt4"));
const completion = await gpt4Model.createChatCompletion({
  model: "gpt4",
  messages: [
    {
      role: "system",
      content: "You are an AI assistant that helps people find information.",
    },
    {
      role: "system",
      content:
        "Use the given article excerpts to answer the questions below." +
        "\nArticles\n" +
        articles.join("\n"),
    },
    {
      role: "user",
      content: query,
    },
  ],
});

console.log(completion.data.choices[0].message?.content);
