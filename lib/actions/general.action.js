"use server";

import { db } from "@/firebase/admin";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not set in environment variables');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const feedbackSchema = z.object({
    totalScore: z.number(),
    categoryScores: z.tuple([
      z.object({
        name: z.literal("Communication Skills"),
        score: z.number(),
        comment: z.string(),
      }),
      z.object({
        name: z.literal("Technical Knowledge"),
        score: z.number(),
        comment: z.string(),
      }),
      z.object({
        name: z.literal("Problem Solving"),
        score: z.number(),
        comment: z.string(),
      }),
      z.object({
        name: z.literal("Confidence and Clarity"),
        score: z.number(),
        comment: z.string(),
      }),
    ]),
    strengths: z.array(z.string()),
    areasForImprovement: z.array(z.string()),
    finalAssessment: z.string(),
  });

// Helper function to get data from either FormData or direct object
const getData = (data, key) => {
    if (data instanceof FormData) {
        return data.get(key);
    }
    return data[key];
};

// Helper function to clean markdown formatting
const cleanMarkdown = (text) => {
  if (!text) return '';
  return text
    .replace(/\*\*/g, '') // Remove bold markers
    .replace(/\*/g, '')   // Remove italic markers
    .replace(/#{1,6}\s/g, '') // Remove heading markers
    .replace(/`/g, '')    // Remove code markers
    .replace(/\n\s*[-*+]\s/g, '\n• ') // Convert list items to bullet points
    .replace(/\n{3,}/g, '\n\n') // Replace multiple newlines with double newlines
    .trim();
};

export async function createFeedback(data) {
    const classroomId = getData(data, 'classroomId');
    const userId = getData(data, 'userId');
    const transcript = typeof getData(data, 'transcript') === 'string' 
        ? JSON.parse(getData(data, 'transcript'))
        : getData(data, 'transcript');
  
    try {
      // Count the number of student responses and their average length
      const studentResponses = transcript.filter(msg => msg.role === 'user');
      const totalResponses = studentResponses.length;
      const avgResponseLength = studentResponses.reduce((acc, msg) => acc + msg.content.length, 0) / totalResponses || 0;

      const formattedTranscript = transcript
        .map((sentence) => `- ${sentence.role}: ${sentence.content}\n`)
        .join("");
  
      const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });
      
      const prompt = `
        You are an AI teacher analyzing a mock classroom session. Your task is to provide detailed, constructive feedback on the student's performance.
        Be extremely critical and accurate in your assessment. The scoring should reflect the actual performance, not be lenient.

        IMPORTANT SCORING GUIDELINES:
        - For sessions with minimal interaction (less than 3 exchanges), scores should be very low (0-20)
        - For short or incomplete sessions, maximum score should be 40
        - Scores above 70 should only be given for exceptional performance with clear evidence
        - Each score must be justified with specific examples from the transcript
        - If a student leaves early or shows minimal engagement, this should be heavily reflected in the scores
        - Default to lower scores when in doubt - scores must be earned, not given
        
        Transcript:
        ${formattedTranscript}

        Session Statistics:
        - Total student responses: ${totalResponses}
        - Average response length: ${avgResponseLength.toFixed(0)} characters

        Please provide a comprehensive analysis following these strict criteria:

        1. Overall Assessment:
        - Start with engagement level (minimal/moderate/high)
        - Note if session was completed or terminated early
        - Give a total score out of 100 based on actual performance, not potential

        2. Category Breakdown (score each from 0-100 with specific evidence):
        
        Communication Skills:
        - Quantity of responses (fewer responses = lower score)
        - Quality of responses (depth, clarity, relevance)
        - Engagement level (minimal responses = max 20 points)
        - Must cite specific examples for any score above 50

        Technical Knowledge:
        - Accuracy of responses
        - Depth of understanding shown
        - Use of technical terms
        - No demonstrated knowledge = score of 0
        - Basic responses = max score of 40
        - Detailed, accurate responses needed for scores above 60

        Problem Solving:
        - Approach to challenges
        - Depth of analysis
        - Solution quality
        - No problem solving shown = score of 0
        - Simple solutions = max score of 30
        - Creative, effective solutions needed for scores above 50

        Confidence and Clarity:
        - Response consistency
        - Self-expression quality
        - Minimal participation = max score of 10
        - Basic participation = max score of 40
        - Scores above 60 require clear examples of confident, articulate responses

        3. Key Strengths:
        - Only list strengths that are clearly demonstrated
        - Each strength must have a specific example
        - If minimal participation, state "No clear strengths demonstrated"

        4. Areas for Improvement:
        - List specific, actionable improvements
        - Focus on participation if engagement was low
        - Suggest specific strategies for each area

        Format your response as a JSON object with clean, unformatted text (no markdown):
        {
          "totalScore": number,
          "categoryScores": [
            {
              "name": "Communication Skills",
              "score": number,
              "comment": "detailed analysis without markdown"
            },
            {
              "name": "Technical Knowledge",
              "score": number,
              "comment": "detailed analysis without markdown"
            },
            {
              "name": "Problem Solving",
              "score": number,
              "comment": "detailed analysis without markdown"
            },
            {
              "name": "Confidence and Clarity",
              "score": number,
              "comment": "detailed analysis without markdown"
            }
          ],
          "strengths": ["specific strength 1", "specific strength 2", ...],
          "areasForImprovement": ["specific area 1", "specific area 2", ...],
          "finalAssessment": "overall summary without markdown"
        }
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Parse the JSON response
      const parsedResponse = JSON.parse(text);
      
      // Clean any markdown that might still be present
      const cleanedResponse = {
        ...parsedResponse,
        finalAssessment: cleanMarkdown(parsedResponse.finalAssessment),
        categoryScores: parsedResponse.categoryScores.map(category => ({
          ...category,
          comment: cleanMarkdown(category.comment)
        })),
        strengths: parsedResponse.strengths.map(cleanMarkdown),
        areasForImprovement: parsedResponse.areasForImprovement.map(cleanMarkdown)
      };
      
      // Validate the response against our schema
      const validatedResponse = feedbackSchema.parse(cleanedResponse);

      const feedback = {
        classroomId,
        userId,
        ...validatedResponse,
        createdAt: new Date().toISOString(),
        sessionStats: {
          totalResponses,
          avgResponseLength: Math.round(avgResponseLength)
        }
      };
  
      const feedbackRef = db.collection("feedback").doc();
      await feedbackRef.set(feedback);
  
      return { success: true, feedbackId: feedbackRef.id };
    } catch (error) {
      console.error("Error saving feedback:", error);
      return { success: false, error: error.message };
    }
  }

export async function getFeedbackByClassroomId(data) {
    const classroomId = getData(data, 'classroomId');
    const userId = getData(data, 'userId');
  
    const querySnapshot = await db
      .collection("feedback")
      .where("classroomId", "==", classroomId)
      .where("userId", "==", userId)
      .limit(1)
      .get();
  
    if (querySnapshot.empty) return null;
  
    const feedbackDoc = querySnapshot.docs[0];
    return { id: feedbackDoc.id, ...feedbackDoc.data() };
  }

export async function getClassroomsByUserId(data) {
    const userId = getData(data, 'userId');
    
    const classrooms = await db
      .collection("classrooms")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();
  
    return classrooms.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  }

export async function getClassroomById(params) {
    const id = getData(params, 'id');
    if (!id) {
        throw new Error('Classroom ID is required');
    }
    const classroom = await db.collection("classrooms").doc(id).get();
    const classroomData = classroom.data();
    if (!classroomData) {
        throw new Error('Classroom not found');
    }
    return { id: classroom.id, ...classroomData };
  }