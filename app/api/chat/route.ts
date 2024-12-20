import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';
const APP_URL = process.env.APP_URL || '';

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const { chatHistory } = await request.json();
        const response = await fetch(APP_URL + '/api/gemini',
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chatHistory }),
            }
        );

        return NextResponse.json(await response.json());
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}