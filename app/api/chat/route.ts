import { NextRequest, NextResponse } from 'next/server';

const APP_URL = process.env.APP_URL || '';

export async function GET(): Promise<NextResponse> {
    return NextResponse.json({ message: 'GET request' });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const { message } = await request.json();
        const response = await fetch(APP_URL + '/api/gemini',
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message }),
            }
        );

        return NextResponse.json(await response.json());
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}