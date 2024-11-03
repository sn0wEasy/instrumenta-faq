import { constants } from '@/constants';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest): Promise<NextResponse> {
    return NextResponse.json({ message: 'GET request' });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const { message } = await request.json();
        const response = await fetch(constants.API_URL + '/gemini',
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