'use client'
import { db } from '@/firebase/client';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { use, useEffect, useState } from 'react';
import { FiArrowLeft, FiCheck, FiStar, FiX } from 'react-icons/fi';

export default function QuizResults({params}) {
  const {id} = use(params);
  const router = useRouter();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuizResults = async () => {
      try {
        const quizDoc = await getDoc(doc(db, "quizes", id));
        const quizData = quizDoc.data();
        console.log("Quiz Data:", quizData);
        
        if (!quizData) {
          console.warn("No quiz data found in Firebase.");
          setLoading(false);
          return;
        }

        const answers = quizData.answers || {};
        const questions = quizData.questions || [];

        if (questions.length > 0) {
          // Count correct answers by comparing each question's answer
          let correctCount = 0;
          const questionResults = questions.map((q, index) => {
            const isCorrect = answers[index] === q.correctAnswer;
            if (isCorrect) correctCount++;
            return {
              ...q,
              userAnswer: answers[index] || "Not answered",
              isCorrect,
            };
          });

          const results = {
            total: questions.length,
            correct: correctCount,
            percentage: (correctCount / questions.length) * 100,
            questions: questionResults,
          };

          setResults(results);
          
          // Update the quiz document with the results
          await updateDoc(doc(db, "quizes", id), {
            total: questions.length,
            correct: correctCount,
            completedAt: new Date(),
          });
        } else {
          console.warn("No questions found in quiz data.");
        }
      } catch (err) {
        console.error("Failed to fetch or parse quiz data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizResults();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading quiz results...</div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">No quiz data found. Please try again.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="backdrop-blur-xl bg-gray-900/70 rounded-2xl border border-gray-700/50 shadow-xl p-8"
        >
          <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
            <FiStar className="text-yellow-400" />
            Journey Results
          </h1>
          
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {/* Performance Score Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-emerald-900/30 to-cyan-900/30 backdrop-blur-sm border border-emerald-700/30 rounded-xl p-6"
            >
              <p className="text-emerald-300 text-sm font-medium mb-2">Performance Score</p>
              <p className="text-4xl font-bold text-emerald-200">
                {results.percentage.toFixed(1)}%
              </p>
            </motion.div>

            {/* Correct Answers Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 backdrop-blur-sm border border-purple-700/30 rounded-xl p-6"
            >
              <p className="text-purple-300 text-sm font-medium mb-2">Correct Answers</p>
              <p className="text-4xl font-bold text-purple-200">
                {results.correct} / {results.total}
              </p>
            </motion.div>

            {/* Time Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-emerald-900/30 to-cyan-900/30 backdrop-blur-sm border border-emerald-700/30 rounded-xl p-6"
            >
              <p className="text-emerald-300 text-sm font-medium mb-2">Time Taken</p>
              <p className="text-4xl font-bold text-emerald-200">
                {Math.floor(results.timeTaken / 60)}m {results.timeTaken % 60}s
              </p>
            </motion.div>
          </div>

          {/* Question Review Section */}
          <div className="space-y-6">
            {results.questions.map((q, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className={`p-6 rounded-xl border ${
                  q.isCorrect 
                    ? 'border-emerald-700/30 bg-emerald-900/20' 
                    : 'border-red-700/30 bg-red-900/20'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-full ${
                    q.isCorrect 
                      ? 'bg-emerald-900/30 text-emerald-400' 
                      : 'bg-red-900/30 text-red-400'
                  }`}>
                    {q.isCorrect ? <FiCheck size={20} /> : <FiX size={20} />}
                  </div>
                  <div>
                    <p className="text-white font-medium mb-2">{q.question}</p>
                    <p className="text-gray-400">Your answer: {q.userAnswer}</p>
                    {!q.isCorrect && (
                      <p className="text-emerald-400 mt-1">Correct answer: {q.correctAnswer}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-8">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/quiz')}
            className="w-full mt-8 bg-gradient-to-r from-emerald-500/80 to-cyan-600/80 text-white px-6 py-4 rounded-xl font-medium flex items-center justify-center gap-2 hover:from-emerald-600/80 hover:to-cyan-700/80 transition-all border border-emerald-400/20"
          >
            <FiArrowLeft /> Take Another Assessment
          </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/')}
              className="w-full mt-8 bg-gradient-to-r from-blue-500/80 to-purple-600/80 text-white px-6 py-4 rounded-xl font-medium flex items-center justify-center gap-2 hover:from-blue-600/80 hover:to-purple-700/80 transition-all border border-blue-400/20"
            >
              <FiArrowLeft /> Back To Home
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}