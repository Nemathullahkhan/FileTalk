import { NextRequest, NextResponse } from "next/server";
import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Chroma } from "@langchain/community/vectorstores/chroma";

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

    // Converting into chunks of 1000 characters with 200 characters overlap
    const chunks = await textSplitter.splitDocuments(docs);

    console.log(`Split ${docs.length} documents into ${chunks.length} chunks.`);

    // Create Embeddings and store in vector DB (e.g., Pinecone, Weaviate, etc.)
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
      model: "text-embedding-3-large",
    });

    // Create vecto store and add documents
    const vectorStore = new Chroma(embeddings, {
      collectionName: "pdf_documents",
      url: "./chroma.db",
    });

    vectorStore.addDocuments(chunks);
    console.log(`Added ${chunks.length} chunks to the vector store.`);

    return NextResponse.json({
      documents: docs,
      count: docs.length,
      chunks: chunks,
    });
  } catch (err: unknown) {
    console.error("/api/upload error:", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
