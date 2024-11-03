import { Content, GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// ----- initialize -----
const APP_URL = process.env.APP_URL || '';

let model: GenerativeModel;
const chatHistory: Content[] = []; // チャット履歴を保持する配列

const initializationPromise = (async () => {
    const GOOGLE_API_KEY: string = process.env.GOOGLE_API_KEY || '';

    const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
    model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // チャット履歴の初期設定
    chatHistory.push({
        role: 'user', parts: [{
            text: "あなたはある組織が開発しているMicrosoft Power Pointのアドインツールの利用をサポートするアシスタントです。\n" +
                "以下の参考情報と質問に基づいて、正確な回答を提供してください。\n" +
                "回答時には、ツールが存在する場合には必ずカテゴリと機能名を含めるようにし、ハルシネーションせずに回答してください。\n" +
                "参考情報にない内容については「わかりません」と答えてください。\n"
        }]
    });
    chatHistory.push({ role: 'model', parts: [{ text: '了解しました。この情報を基に会話を進めます。' }] });
})();


export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        await initializationPromise;

        const { message } = await request.json();

        const queryedResponse = await fetch(APP_URL + '/api/llamaindex', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message }),
        });
        const queryedData = await queryedResponse.json();

        // ユーザーのメッセージとそれに対する参考情報をチャット履歴に追加
        chatHistory.push({
            role: 'user', parts: [{
                text: "質問:\n" +
                    message +
                    `\n参考情報:\n` +
                    queryedData.response +
                    "\n"
            }]
        });

        const geminiResponse = await model.generateContent({
            contents: chatHistory,
        });
        const geminiData = geminiResponse.response.text();

        chatHistory.push({ role: 'model', parts: [{ text: geminiData }] });

        return NextResponse.json({ response: geminiData });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
