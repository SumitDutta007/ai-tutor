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
        Be fair and encouraging in your assessment while maintaining accuracy. Focus on both achievements and areas for growth.

        SCORING GUIDELINES:
        - Base scores on demonstrated effort and understanding, not just perfect answers
        - For minimal interaction : scores 30-45
        - For partial engagement : scores 45-65
        - For active engagement : scores 65-85
        - Exceptional performance can score 85-100
        - Each score should be justified with specific examples
        - Consider both effort and accuracy in scoring
        - Reward improvement and willingness to learn
        
        Transcript:
        ${formattedTranscript}

        Please provide a comprehensive analysis following these balanced criteria:

        1. Overall Assessment:
        - Note level of engagement and effort shown
        - Acknowledge both strengths and challenges
        - Consider improvement throughout the session
        - Give a fair total score that reflects both effort and performance

        2. Category Breakdown (score each from 0-100 with specific evidence):
        
        Communication Skills:
        - Effort to engage in dialogue
        - Quality and clarity of responses
        - Improvement in communication during session
        - Basic engagement starts at 45 points
        - Active participation can earn 65-85
        - Exceptional communication can reach 85-100

        Technical Knowledge:
        - Understanding of basic concepts starts at 50
        - Partial understanding earns 50-70
        - Good understanding with minor gaps: 70-85
        - Excellent understanding: 85-100
        - Consider both correct and partially correct answers
        - Reward attempts to work through difficult concepts

        Problem Solving:
        - Effort to approach challenges starts at 45
        - Basic problem-solving attempts earn 45-65
        - Good analytical thinking earns 65-85
        - Exceptional problem-solving reaches 85-100
        - Credit given for logical approaches even if answer isn't perfect
        - Reward creativity and persistence

        Confidence and Clarity:
        - Basic participation starts at 45
        - Growing confidence during session: 45-65
        - Consistent clear communication: 65-85
        - Exceptional confidence and clarity: 85-100
        - Consider improvement throughout the session
        - Reward attempts to explain thinking process

        3. Key Strengths:
        - Highlight both major and minor achievements
        - Include potential strengths that are emerging
        - Focus on positive aspects of attempts made
        - Always find at least one strength to acknowledge

        4. Areas for Improvement:
        - Frame as opportunities for growth
        - Provide encouraging, actionable suggestions
        - Focus on specific, achievable next steps
        - Balance critiques with positive reinforcement

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
      const response = result.response;
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