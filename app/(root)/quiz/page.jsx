'use client'
import { QuizFileUpload } from '@/components/QuizFileUpload';
import { QuizQuestion } from '@/components/QuizQuestion';
import { GoogleGenerativeAI } from "@google/generative-ai";
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
  const router = useRouter();

  const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({model: 'models/gemini-1.5-flash'});

  // Effect to handle quiz completion and navigation
  useEffect(() => {
    if (quizCompleted) {
      // Save answers and questions to localStorage
      localStorage.setItem('quizAnswers', JSON.stringify(answers));
      localStorage.setItem('quizQuestions', JSON.stringify(questions));
      // Navigate to results page
      router.push('/quiz-results');
    }
  }, [quizCompleted, answers, questions, router]);

  const handleFileUpload = useCallback(async (file) => {
    setLoading(true);
    try {
      console.log(file);
      console.log('Processing file:', file.type);
      
      // Process with Gemini
      const result = await model.generateContent([
        {
          inlineData: {
            mimeType: file.type,
            data: file.file
          }
        },
        "Generate 10 multiple choice questions based on the document. Format the response as a JSON array of objects, where each object has a 'question' field, an 'options' array with 4 choices, and a 'correctAnswer' field. Do not include anything which can interrupt the process, such as '```json' or 'Here are the questions' or 'The following is a list of questions'. Only return the JSON array of objects without any additional text or formatting.",
      ]);
      const extractedText = result.response.text();
      const cleanedText = extractedText
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/```[\s\S]*$/, '')
        .trim();
      console.log(cleanedText);
      const data = JSON.parse(cleanedText);
      setQuestions(data);
      toast.success('Questions generated successfully!');
    } catch (error) {
      console.error('Error generating questions:', error);
      toast.error('Failed to generate questions. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAnswer = (answer) => {
    const newAnswers = { ...answers, [currentQuestion]: answer };
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      // If not the last question, move to next question
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // If last question, mark quiz as completed
      // This will trigger the useEffect to handle navigation
      setQuizCompleted(true);
    }
  };

  const progress = (currentQuestion / questions.length) * 100;

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto relative z-10">
        {!quizStarted ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="backdrop-blur-xl bg-gray-900/70 rounded-2xl border border-emerald-500/20 shadow-xl p-8"
          >
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
  );
}