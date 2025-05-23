import fs from 'fs';
import { writeFile } from 'fs/promises';
import { DocxLoader } from 'langchain/document_loaders/fs/docx';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { NextResponse } from 'next/server';
import os from 'os';
import { join } from 'path';

const MAX_CONTENT_LENGTH = 100000; // ~25k tokens

// Helper function to clean and truncate text
function preprocessText(text) {
    // Remove excessive whitespace and normalize line endings
    text = text.replace(/\s+/g, ' ')
               .replace(/\n\s*\n/g, '\n')
               .trim();
    
    // Remove any non-printable characters
    text = text.replace(/[^\x20-\x7E\n]/g, '');
    
    // Truncate if too long
    if (text.length > MAX_CONTENT_LENGTH) {
        // Try to break at a sentence boundary
        const truncated = text.slice(0, MAX_CONTENT_LENGTH);
        const lastPeriod = truncated.lastIndexOf('.');
        if (lastPeriod > MAX_CONTENT_LENGTH * 0.8) {
            return truncated.slice(0, lastPeriod + 1);
        }
        return truncated;
    }
    
    return text;
}

export async function POST(req) {
    try {
        const formData = await req.formData();
        const file = formData.get('file');

        if (!file) {
            return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
        }

        // Create a temporary file path using OS temp directory
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const tempDir = os.tmpdir();
        const tempPath = join(tempDir, file.name);
        await writeFile(tempPath, buffer);

        let content = '';
        const fileType = file.name.split('.').pop().toLowerCase();

        try {
            let loader;
            switch (fileType) {
                case 'pdf':
                    loader = new PDFLoader(tempPath, {
                        splitPages: true,
                        pdfjs: () => import('pdfjs-dist/legacy/build/pdf.js')
                    });
                    break;
                case 'docx':
                    loader = new DocxLoader(tempPath);
                    break;
                case 'txt':
                    loader = new TextLoader(tempPath);
                    break;
                default:
                    throw new Error('Unsupported file type');
            }

            const docs = await loader.load();
            
            // Extract and preprocess text from each page/section
            content = docs.map(doc => {
                const pageContent = doc.pageContent || '';
                return preprocessText(pageContent);
            }).join('\n\n');

            // Final preprocessing on combined content
            content = preprocessText(content);

            // Clean up: remove the temporary file
            await fs.promises.unlink(tempPath).catch(() => {});

        } catch (error) {
            console.error('Error extracting text:', error);
            return NextResponse.json({ 
                success: false, 
                error: 'Failed to extract text from file' 
            }, { status: 500 });
        }

        return NextResponse.json({ 
            success: true, 
            content 
        });

    } catch (error) {
        console.error('Error processing upload:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Failed to process file' 
        }, { status: 500 });
    }
} 