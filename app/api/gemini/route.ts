import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

const initializationPromise = async () => {
    const GOOGLE_API_KEY: string = process.env.GOOGLE_API_KEY || '';
    if (!GOOGLE_API_KEY) {
        throw new Error('GOOGLE_API_KEY is not set');
    }

    const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
    const modelPro = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    const modelFlash = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    return { modelPro, modelFlash };
};

export async function POST(request: NextRequest): Promise<NextResponse> {
    const { modelPro, modelFlash } = await initializationPromise();
    const { chatHistory } = await request.json();

    // デフォルトはProを使用し、Proが使用できない場合はFlashを使用する
    try {
        const geminiResponse = await modelPro.generateContent({
            contents: chatHistory,
        });
        const geminiData = geminiResponse.response.text();

        return NextResponse.json({ response: geminiData });
    } catch (error) {
        try {
            const geminiResponse = await modelFlash.generateContent({
                contents: chatHistory,
            });
            const geminiData = geminiResponse.response.text();

            return NextResponse.json({ response: geminiData });
        } catch (flashError) {
            console.error('Error with modelFlash:', flashError);
            return NextResponse.json({ response: 'エラーが発生しました。時間をおいてから再度お試しください。' });
        }
    }
}
