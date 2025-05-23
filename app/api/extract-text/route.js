import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function main() {
    const pdfResp = await fetch('https://discovery.ucl.ac.uk/id/eprint/10089234/1/343019_3_art_0_py4t4l_convrt.pdf')
        .then((response) => response.arrayBuffer());

    const contents = [
        { text: "analyze and extract the key information from this text. Focus on: 1. Main topics and concepts 2. Important definitions 3. Key points and explanations 4. Examples if any " },
        {
            inlineData: {
                mimeType: 'application/pdf',
                data: Buffer.from(pdfResp).toString("base64")
            }
        }
    ];

    const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: contents
    });
    return response.text;
}

main();
