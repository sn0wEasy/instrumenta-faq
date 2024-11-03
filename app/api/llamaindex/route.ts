import {
    Document,
    VectorStoreIndex,
    Settings,
    Gemini,
    GeminiEmbedding,
    GEMINI_MODEL,
    GEMINI_EMBEDDING_MODEL,
    RetrieverQueryEngine
} from "llamaindex";
import { NextRequest, NextResponse } from "next/server";
import { constants } from "@/constants";

// ----- runtime -----
export const runtime = 'edge';

// ----- initialize -----
let queryEngine: RetrieverQueryEngine;

const initializationPromise = (async () => {

    const document = new Document({ text: constants.knowledgeBase });

    Settings.llm = new Gemini({
        model: GEMINI_MODEL.GEMINI_PRO_1_5_FLASH_LATEST,
    });

    Settings.embedModel = new GeminiEmbedding({
        model: GEMINI_EMBEDDING_MODEL.EMBEDDING_001,
    });

    const index = await VectorStoreIndex.fromDocuments([document]);
    const retriever = index.asRetriever({ similarityTopK: 1 });
    queryEngine = index.asQueryEngine({ retriever: retriever });
})();

export async function POST(request: NextRequest): Promise<NextResponse> {
    await initializationPromise;

    const { message } = await request.json();

    const response = await queryEngine.query({
        query: message,
    });

    return NextResponse.json({ response: response.toString() });
}