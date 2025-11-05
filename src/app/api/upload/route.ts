import { NextRequest, NextResponse } from "next/server";
import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { OpenAIEmbeddings } from "@langchain/openai";
import { qdrantclient } from "@/lib/qdrant";

const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 4096,
  chunkOverlap: 100,
});

export async function GET() {
  return NextResponse.json({ message: "API is working!" });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pdfUrl } = body || {};

    if (!pdfUrl || typeof pdfUrl !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid `pdfUrl` in request body" },
        { status: 400 }
      );
    }

    const response = await fetch(pdfUrl);
    if (!response.ok) {
      return NextResponse.json(
        {
          error: `Failed to fetch PDF: ${response.status} ${response.statusText}`,
        },
        { status: 502 }
      );
    }

    // Use the web PDF loader which accepts a Blob (works with fetch response)
    const blob = await response.blob();
    const loader = new WebPDFLoader(blob as Blob);
    const docs = await loader.load();

    // Converting into chunks
    const chunks = await textSplitter.splitDocuments(docs);

    console.log(`Split ${docs.length} documents into ${chunks.length} chunks.`);

    // Create Embeddings
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
      model: "text-embedding-3-large",
    });

    // Generate embeddings for all chunks
    const texts = chunks.map((chunk) => chunk.pageContent);
    const embeddingsArray = await embeddings.embedDocuments(texts);

    // Prepare points for Qdrant
    const points = chunks.map((chunk, index) => ({
      id: index,
      vector: embeddingsArray[index],
      payload: {
        content: chunk.pageContent,
        metadata: chunk.metadata,
        source: pdfUrl,
      },
    }));

    // Ensure collection exists
    const collectionName = "pdf_documents";
    try {
      await qdrantclient.getCollection(collectionName);
    } catch (error) {
      // Collection doesn't exist, create it
      await qdrantclient.createCollection(collectionName, {
        vectors: {
          size: embeddingsArray[0].length,
          distance: "Cosine",
        },
      });
    }

    // Upload to Qdrant
    await qdrantclient.upsert(collectionName, {
      wait: true,
      points: points,
    });

    console.log(`Added ${chunks.length} chunks to Qdrant vector store.`);

    return NextResponse.json({
      documents: docs,
      count: docs.length,
      chunks: chunks,
      message: "PDF processed and stored in Qdrant successfully",
    });
  } catch (err: unknown) {
    console.error("/api/upload error:", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
