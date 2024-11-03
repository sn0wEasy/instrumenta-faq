import { Content, GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import { constants } from '@/constants';
import fs from "fs";
import path from 'path';

// ----- load -----
// .envファイルから環境変数を読み込む
const GOOGLE_API_KEY: string = process.env.GOOGLE_API_KEY || '';

// ----- gemini -----
// Gemini モデルの初期化
const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// チャット履歴を保持する配列
const chatHistory: Content[] = [];

// チャット履歴の初期設定
chatHistory.push({
    role: 'user', parts: [{
        text: "あなたはある組織が開発しているMicrosoft Power Pointのアドインツールの利用をサポートするアシスタントです。\n" +
            "以下の参考情報と質問に基づいて、正確な回答を提供してください。\n" +
            "参考情報にない内容については「わかりません」と答えてください。\n"
    }]
});
chatHistory.push({ role: 'model', parts: [{ text: '了解しました。この情報を基に会話を進めます。' }] });


export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const { message } = await request.json();

        // pinecornからデータを読み込む
        const queryedResponse = await fetch(constants.API_URL + '/llamaindex', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message }),
        });
        const queryedData = await queryedResponse.json();

        // ユーザーのメッセージとそれに対する参考情報をチャット履歴に追加
        chatHistory.push({
            role: 'user', parts: [{
                text: `参考情報:\n` +
                    queryedData.response +
                    "\n" +
                    "質問:\n" +
                    message
            }]
        });

        // Gemini モデルを使用して応答を生成
        const geminiResponse = await model.generateContent({
            contents: chatHistory,
        });

        const geminiData = geminiResponse.response.text();

        // モデルの応答をチャット履歴に追加
        chatHistory.push({ role: 'model', parts: [{ text: geminiData }] });

        return NextResponse.json({ response: geminiData });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
