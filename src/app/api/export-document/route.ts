import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { GoogleAuth } from 'google-auth-library';

// Create a JWT client using the service account credentials
let auth: GoogleAuth | undefined;
try {
  const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  
  if (serviceAccountKey) {
    const credentials = JSON.parse(serviceAccountKey);
    
    auth = new google.auth.GoogleAuth({
      credentials,
      scopes: [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/presentations'
      ],
    });
  }
} catch (error) {
  console.error('Error parsing service account key:', error);
}

// Mark this route as dynamic to prevent static generation errors
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    if (!auth) {
      throw new Error('Failed to initialize Google authentication');
    }
    
    const body = await request.json();
    const { documentId, format = 'pdf' } = body;
    
    if (!documentId) {
      return NextResponse.json(
        { message: 'Document ID is required' },
        { status: 400 }
      );
    }
    
    // Create Drive client
    const drive = google.drive({ version: 'v3', auth });
    
    // Export the presentation as PDF
    const response = await drive.files.export({
      fileId: documentId,
      mimeType: 'application/pdf'
    }, {
      responseType: 'arraybuffer'
    });
    
    // Return the PDF as a response
    return new NextResponse(Buffer.from(response.data as ArrayBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="presentation.pdf"'
      }
    });
    
  } catch (error: any) {
    console.error('Error exporting presentation:', error);
    
    return NextResponse.json(
      { 
        message: error.message || 'Failed to export presentation',
        details: error.response?.data || undefined
      },
      { status: 500 }
    );
  }
} 