import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { GoogleAuth } from 'google-auth-library';

// Mark this route as dynamic to prevent static generation errors
export const dynamic = 'force-dynamic';

// Create a JWT client using the service account credentials
let auth: GoogleAuth | undefined;
try {
  // Try to parse the service account key
  const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '{}';
  const credentials = JSON.parse(serviceAccountKey);
  
  auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/drive'],
  });
} catch (error) {
  console.error('Error parsing service account key:', error);
  // We'll handle this in the route handler
}

export async function GET(request: Request) {
  try {
    // Check if auth was initialized properly
    if (!auth) {
      throw new Error('Failed to initialize Google authentication. Check your service account key.');
    }
    
    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('documentId');
    const format = searchParams.get('format');
    
    if (!documentId) {
      return NextResponse.json(
        { message: 'Document ID is required' },
        { status: 400 }
      );
    }
    
    if (format !== 'pdf' && format !== 'docx') {
      return NextResponse.json(
        { message: 'Format must be pdf or docx' },
        { status: 400 }
      );
    }
    
    const mimeType = format === 'pdf' 
      ? 'application/pdf' 
      : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    
    // Create Drive client
    const drive = google.drive({ version: 'v3', auth });
    
    // Export the document
    const response = await drive.files.export({
      fileId: documentId,
      mimeType: mimeType
    }, { responseType: 'arraybuffer' });
    
    const buffer = Buffer.from(response.data as ArrayBuffer);
    
    // Return the file as a response
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="document.${format}"`,
      },
    });
  } catch (error: any) {
    console.error('Error downloading document:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to download document' },
      { status: 500 }
    );
  }
}
