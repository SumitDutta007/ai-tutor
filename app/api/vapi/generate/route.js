import { google } from "@ai-sdk/google";
import {db} from "@/firebase/admin";
import {generateText} from "ai";


export async function GET(){
    return Response.json({
        success:true,
        data: "Hello from VAPI API"
    },{status:200});
}

export async function POST(req){
    const { content, type, standard, userid } = await req.json();
    try{
        const { text } = await generateText({
            model: google('gemini-2.0-flash-001'),
            prompt: `You are Tutorly, an AI-powered study companion. A student will upload their own notes or textbook excerpts. Your job is to:
            1. QUIZ the student on key facts and concepts from their materials, asking clear, concise questions.
            2. EXPLAIN any topic they ask about, using simple language and examples drawn only from their provided content.
            3. RUN a mock oral exam: pose open‑ended questions, listen to (or read) their answers, then give constructive feedback and follow‑up questions.
            4. ADAPT difficulty dynamically: if they struggle, break concepts into smaller steps; if they excel, introduce deeper challenges.

            Always reference *only* the student’s uploads. Encourage them, keep a friendly tone, and prompt them with “Ready for the next question?” when a topic is complete.

            You are teaching a student with user id ${userid}.
            The student has made notes whose content is ${content} and is having difficulty in understanding the content.
            The type of help student wants is ${type}.
            If the type is to explain concept then explain the concept in great details with examples as per the content/notes provided for the standard of ${standard} student . Generate the text formatted like this:
            ["Concept 1", "Concept 2", "Concept 3"]
            If the type is to generate a oral exam then generate a questions for mock oral exam as per the content/notes provided for the standard of ${standard} student. Generate the questions formatted like this:
            ["Question 1", "Question 2", "Question 3"]
            If the type is mixed then generate a text formatted like this:
            ["Concept 1", "Question 1", "Concept 2", "Question 2", "Concept 3", "Question 3"], explaining the concept and then asking a question related to the concept.
            Please return only the text without any additional information.
            Do not use "/" or "*" or any other special character that might break the voice assistant.
            Teach the student everything for a standard ${standard} student.

            Thank you for your help. I really appreciate it.
            `
        });

        const classroom = {
            type,
            standard,
            userId:userid,
            finalized:true,
            text:JSON.parse(text),
            createdAt: new Date().toISOString()
        }
        await db.collection("classrooms").add(classroom);
        return Response.json({
            success:true,
        },{status:200});

    }catch(error){
        console.log(error);
        return Response.json({
            success:false,
            message: "Something went wrong",
            error: error.message
        },{status:500});
    }
}