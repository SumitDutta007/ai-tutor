import { GoogleGenAI } from "@google/genai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  try {
    const file = req.body;
    console.log(file);
    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: file.type,
          data: file.file,
        },
      },
      "Generate 10 multiple choice questions based on the document. Format the response as a JSON array of objects, where each object has a 'question' field, an 'options' array with 4 choices, and a 'correctAnswer' field.",
    ]);
    const questions = result.response.text();
    //   const contents = [
    //     { text: "Generate 10 multiple choice questions based on the document. Format the response as a JSON array of objects, where each object has a 'question' field, an 'options' array with 4 choices, and a 'correctAnswer' field." },
    //     {
    //         inlineData: {
    //             mimeType: file.type,
    //             data: file.file
    //         }
    //     }
    // ];

    // const response = await ai.models.generateContent({
    //     model: "gemini-1.5-flash",
    //     contents: contents
    // });
    // const questions = response.text;
    return NextResponse.json({ questions });
  } catch (err) {
    console.error("Error:", err);
    return NextResponse.json(
      { error: `Failed to generate questions: ${err}` },
      { status: 500 }
    );
  }
  // try {
  //   const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  //   // Extract text from uploaded document
  //   const documentText = await extractTextFromDocument(req.body.document);

  //   const prompt = `Generate 10 multiple choice questions based on the following content. Format the response as a JSON array of objects, where each object has a 'question' field, an 'options' array with 4 choices, and a 'correctAnswer' field. Content: ${documentText}`;

  //   const result = await model.generateContent(prompt);
  //   const response = await result.response;
  //   const questions = JSON.parse(response.text());

  //   return res.status(200).json({ questions });
  // } catch (error) {
  //   console.error('Error:', error);
  //   return res.status(500).json({ message: 'Error generating questions' });
  // }
}
