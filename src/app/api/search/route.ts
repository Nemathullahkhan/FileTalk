// app/api/search/route.ts
import { NextRequest, NextResponse } from "next/server";
import { ChatOpenAI, OpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { qdrantclient } from "../../../lib/qdrant";

export async function POST(request: NextRequest) {
  try {
    const { query, limit = 5 } = await request.json();

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid `query` in request body" },
        { status: 400 }
      );
    }

    // Create embeddings for the query
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
      model: "text-embedding-3-large",
    });

    const queryEmbedding = await embeddings.embedQuery(query);

    // Search in Qdrant
    const searchResults = await qdrantclient.search("pdf_documents", {
      vector: queryEmbedding,
      limit: limit,
      with_payload: true,
      with_vector: false,
    });

    // Format results
    const results = searchResults.map((result) => ({
      score: result.score,
      content: result.payload?.content,
      metadata: result.payload?.metadata,
      source: result.payload?.source,
    }));

    let generatedAnswer = null;
    if (results.length > 0) {
      const llm = new ChatOpenAI({
        openAIApiKey: process.env.OPENAI_API_KEY,
        temperature: 0.3,
        maxTokens: 500,
        modelName: "gpt-4o",
      });

      const context = results
        .map((res, idx) => `Context ${idx + 1}:\n${res.content}\n`)
        .join("\n\n");

      const prompt = ` Based on the following context, provide a concise answer to the query.
    
    User Question: "${query}"
    Context from documents : ${context}

    Instructions:
    - Provide a clear and well-structured answer based on the above context
    - If the context does not contain relevant information, respond with "I'm sorry, I do not have enough information to answer that question from provided documents."
    - Keep the answer concise and to the point.
    - Do not include any information not present in the context.
    - Use proper formatting with paragraphs and bullet points where appropriate
    - Cite relevant sources by referring to the source numbers in your answer

    Answer:`;
      generatedAnswer = await llm.invoke(prompt);
    }
    return NextResponse.json({
      query,
      results,
      total: searchResults.length,
      response: generatedAnswer,
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Failed to search vector store" },
      { status: 500 }
    );
  }
}
