import { Content, GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import { constants } from '@/constants';

// ----- load -----
// .envファイルから環境変数を読み込む
const GOOGLE_API_KEY: string = process.env.GOOGLE_API_KEY || '';

// ----- gemini -----
// Gemini モデルの初期化
const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// チャット履歴を保持する配列
const chatHistory: Content[] = [];

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const { message } = await request.json();

        // const queryedData = await fetch(constants.API_URL + '/pinecorn');
        const queryedData = 'test: response from pinecorn';

        // pinecornからデータを読み込み、チャット履歴に追加
        chatHistory.push({ role: 'user', parts: [{ text: `以下の情報を記憶してください: ${queryedData}` }] });
        chatHistory.push({ role: 'model', parts: [{ text: '了解しました。この情報を基に会話を進めます。' }] });

        // ユーザーのメッセージをチャット履歴に追加
        chatHistory.push({ role: 'user', parts: [{ text: message }] });

        // Gemini モデルを使用して応答を生成
        const result = await model.generateContent({
            contents: chatHistory,
        });

        const response = result.response.text();

        // モデルの応答をチャット履歴に追加
        chatHistory.push({ role: 'model', parts: [{ text: response }] });

        return NextResponse.json({ response: response });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
