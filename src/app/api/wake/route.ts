import { NextResponse } from 'next/server';

export async function GET() {
    const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
    
    try {
        // The Next.js server makes the request to Render.
        // Ad-blockers cannot block server-to-server requests.
        const response = await fetch(`${API_URL}/health`, {
            // Keep the connection alive just long enough to wake it up
            cache: 'no-store'
        });
        
        const data = await response.json().catch(() => null);
        
        return NextResponse.json({ 
            success: true, 
            status: response.status,
            data 
        });
    } catch (error) {
        return NextResponse.json({ 
            success: false, 
            error: String(error) 
        }, { status: 500 });
    }
}
