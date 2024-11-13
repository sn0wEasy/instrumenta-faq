import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

const initializationPromise = async () => {
    const GOOGLE_API_KEY: string = process.env.GOOGLE_API_KEY || '';
    if (!GOOGLE_API_KEY) {
        throw new Error('GOOGLE_API_KEY is not set');
    }

    const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
    return genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
};

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const model = await initializationPromise();
        const { chatHistory } = await request.json();

        const geminiResponse = await model.generateContent({
            contents: chatHistory,
        });
        const geminiData = geminiResponse.response.text();

        return NextResponse.json({ response: geminiData });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
