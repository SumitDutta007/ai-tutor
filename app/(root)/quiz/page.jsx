'use client'
import { QuizFileUpload } from '@/components/QuizFileUpload';
import { QuizQuestion } from '@/components/QuizQuestion';
import { db } from '@/firebase/client';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { addDoc, collection, doc, updateDoc } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { FiArrowRight, FiCpu } from 'react-icons/fi';
import { toast } from 'sonner';

export default function Quiz() {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [docRef, setDocRef] = useState(null);
  const router = useRouter();

  const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({model: 'models/gemini-1.5-flash'});

  useEffect(() => {
    if (quizCompleted && docRef) {
      router.push(`/quiz/${docRef.id}`);
    }
  }, [quizCompleted, docRef, router]);

  const handleFileUpload = useCallback(async (file) => {
    setLoading(true);
    try {
      console.log('Processing file:', file.type);
      
      // Process with Gemini
      const result = await model.generateContent([
        {
          inlineData: {
            mimeType: file.type,
            data: file.file
          }
        },
        `You must generate EXACTLY 10 multiple choice questions. No more, no less.
        Format as a JSON array with EXACTLY 11 objects total:
        - First object: {Topic: 'topic name'}
        - Followed by EXACTLY 10 question objects
        Each question must have:
        - question: string
        - options: array of EXACTLY 4 choices
        - correctAnswer: string (must match one of the options exactly)
        Example: 
        [
          {"Topic": "Example Topic"},
          {"question": "Q1", "options": ["A", "B", "C", "D"], "correctAnswer": "A"},
          ... 8 more questions ...
          {"question": "Q10", "options": ["A", "B", "C", "D"], "correctAnswer": "B"}
        ]
        Return ONLY the JSON array. No other text or formatting.`
      ]);
      
      const extractedText = result.response.text();
      console.log('Raw response from Gemini:', extractedText);
      
      const cleanedText = extractedText
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/```[\s\S]*$/, '')
        .trim();
      
      console.log('Cleaned response:', cleanedText);
      
      const data = JSON.parse(cleanedText);
      console.log('Parsed data length:', data.length);
      console.log('First object:', data[0]);
      console.log('Number of questions:', data.slice(1).length);
      
      // Validate the response format
      if (!Array.isArray(data) || data.length !== 11) {
        console.error('Invalid data length:', data.length);
        throw new Error(`Expected 11 objects (1 topic + 10 questions), got ${data.length}`);
      }
      
      if (!data[0].Topic) {
        console.error('First object missing Topic:', data[0]);
        throw new Error('First object must contain Topic field');
      }
      
      const topic = data[0].Topic;
      const questions = data.slice(1);
      console.log('Questions array length:', questions.length);
      
      // Validate each question
      questions.forEach((q, index) => {
        console.log(`Validating question ${index + 1}:`, q);
        if (!q.question || !Array.isArray(q.options) || q.options.length !== 4 || !q.correctAnswer) {
          console.error(`Invalid question format at index ${index}:`, q);
          throw new Error(`Invalid question format at index ${index}`);
        }
        if (!q.options.includes(q.correctAnswer)) {
          console.error(`Question ${index + 1} correct answer not in options:`, {
            correctAnswer: q.correctAnswer,
            options: q.options
          });
          throw new Error(`Correct answer not found in options for question ${index + 1}`);
        }
      });
      
      if (questions.length !== 10) {
        console.error('Wrong number of questions:', questions.length);
        throw new Error(`Expected 10 questions, got ${questions.length}`);
      }
      
      console.log('Final validated questions count:', questions.length);
      setQuestions(questions);
      
      const quiz = {
        topic: topic,
        questions: questions,
        createdAt: new Date(),
      };
      
      const docRef = await addDoc(collection(db, "quizes"), quiz);
      setDocRef(docRef);
      toast.success('Questions generated successfully!');
    } catch (error) {
      console.error('Error generating questions:', error);
      toast.error(`Failed to generate questions: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [model]);

  const handleAnswer = async (answer) => {
    const newAnswers = { ...answers, [currentQuestion]: answer };
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      try {
        await updateDoc(doc(db, "quizes", docRef.id), {
          answers: newAnswers,
          completedAt: new Date(),
        });
        setQuizCompleted(true);
      } catch (error) {
        console.error('Error saving answers:', error);
        toast.error('Failed to save answers. Please try again.');
      }
    }
  };

  const progress = (currentQuestion / questions.length) * 100;

  return (
    <div className="min-h-screen relative">
      {/* Background with blur and gradient */}
      <div className="fixed inset-0 bg-gradient-to-b from-gray-900 to-gray-950">
        <div className="absolute inset-0 backdrop-blur-3xl">
          {/* Animated rings */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -inset-[100%] animate-[spin_20s_linear_infinite] opacity-30">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] rounded-full border-[100px] border-emerald-500/20"></div>
            </div>
            <div className="absolute -inset-[100%] animate-[spin_15s_linear_infinite_reverse] opacity-20">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[180%] h-[180%] rounded-full border-[80px] border-cyan-500/20"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {!quizStarted ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="backdrop-blur-xl bg-gray-900/70 rounded-2xl border border-emerald-500/20 shadow-xl p-8 relative overflow-hidden"
            >
              {/* Gradient overlay for card */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-cyan-500/5"></div>
              
              {/* Card content */}
              <div className="relative z-10">
                <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                  <FiCpu className="text-emerald-400" />
                  AI-Powered Quiz
                </h1>
                <p className="text-gray-300 mb-8">Let AI analyze your content and test your knowledge</p>
                
                <QuizFileUpload 
                  onFileUpload={handleFileUpload}
                  isLoading={loading}
                />

                {questions.length > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setQuizStarted(true)}
                    className="w-full mt-8 bg-gradient-to-r from-emerald-500/80 to-cyan-600/80 text-white px-6 py-4 rounded-xl font-medium flex items-center justify-center gap-2 hover:from-emerald-600/80 hover:to-cyan-700/80 transition-all border border-emerald-400/20"
                  >
                    Start Assessment <FiArrowRight />
                  </motion.button>
                )}
              </div>
            </motion.div>
          ) : (
            <QuizQuestion 
              question={questions[currentQuestion]}
              onAnswer={handleAnswer}
              progress={progress}
              currentNumber={currentQuestion + 1}
              total={questions.length}
            />
          )}
        </div>
      </div>
    </div>
  );
}