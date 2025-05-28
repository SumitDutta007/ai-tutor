'use client'
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FiArrowLeft, FiCheck, FiStar, FiX } from 'react-icons/fi';

export const metadata = {
  title: "Quiz Results & Performance Analysis | Tutorly",
  description: "View your detailed quiz performance analysis. Get insights into your strengths and areas for improvement with our AI-powered assessment system.",
  keywords: "quiz results, performance analysis, learning assessment, educational progress, AI feedback",
};

export default function QuizResults() {
  const router = useRouter();
  const [results, setResults] = useState(null);

  useEffect(() => {
    const storedAnswers = localStorage.getItem('quizAnswers');
    const storedQuestions = localStorage.getItem('quizQuestions');

    if (storedAnswers && storedQuestions) {
      try {
        const answers = JSON.parse(storedAnswers);
        const questions = JSON.parse(storedQuestions);

        const correct = questions.filter((q, index) =>
          answers[index] === q.correctAnswer
        ).length;

        setResults({
          total: questions.length,
          correct,
          percentage: (correct / questions.length) * 100,
          questions: questions.map((q, index) => ({
            ...q,
            userAnswer: answers[index],
            isCorrect: answers[index] === q.correctAnswer,
          })),
        });
      } catch (err) {
        console.error("Failed to parse quiz data:", err);
        // Optionally redirect or show an error
      }
    } else {
      console.warn("No quiz data found.");
      // Optionally redirect to quiz page if no data
    }
  }, []);

  if (!results) return <div>Loading...</div>;

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
                      ? 'bg-green-900/50 text-green-400' 
                      : 'bg-red-900/50 text-red-400'
                  }`}>
                    {q.isCorrect ? <FiCheck size={20} /> : <FiX size={20} />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-white mb-3">
                      {index + 1}. {q.question}
                    </p>
                    <div className="grid gap-2 text-sm">
                      <p className={`${
                        q.isCorrect ? 'text-green-300' : 'text-red-300'
                      }`}>
                        Your answer: {q.userAnswer}
                      </p>
                      {!q.isCorrect && (
                        <p className="text-green-300">
                          Correct answer: {q.correctAnswer}
                        </p>
                      )}
                    </div>
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