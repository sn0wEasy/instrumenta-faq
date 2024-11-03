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
} from "llamaindex";
import { NextRequest, NextResponse } from "next/server";

// ----- load -----
// テキストファイルからデータを読み込む関数
function loadDataFromFile(filename: string): string {
    const filePath = path.join(process.cwd(), 'data', filename);
    return fs.readFileSync(filePath, 'utf-8');
}

// テキストファイルからデータを読み込み
const knowledgeBase = loadDataFromFile('knowledge_base.txt');

// ----- llamaindex -----
const document = new Document({ text: knowledgeBase });

Settings.llm = new Gemini({
    model: GEMINI_MODEL.GEMINI_PRO_1_5_FLASH_LATEST,
});

Settings.embedModel = new GeminiEmbedding({
    model: GEMINI_EMBEDDING_MODEL.EMBEDDING_001,
});

// Indexの作成
const index = await VectorStoreIndex.fromDocuments(
    [document],
);

// QueryEngineの準備
const retriever = index.asRetriever({ similarityTopK: 1 });  // チャンク取得数
const queryEngine = index.asQueryEngine({ retriever: retriever });


export async function POST(request: NextRequest): Promise<NextResponse> {
    const { message } = await request.json();

    // 質問応答
    const response = await queryEngine.query({
        query: message,
    });

    return NextResponse.json({ response: response.toString() });
}