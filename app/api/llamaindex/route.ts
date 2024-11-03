import fs from "fs";
import path from 'path';
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



// ----- initialize -----
let queryEngine: RetrieverQueryEngine;

const initializationPromise = (async () => {
    function loadDataFromFile(filename: string): string {
        const filePath = path.join(process.cwd(), 'data', filename);
        return fs.readFileSync(filePath, 'utf-8');
    }
    const knowledgeBase = loadDataFromFile('knowledge_base.txt');

    const document = new Document({ text: knowledgeBase });

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