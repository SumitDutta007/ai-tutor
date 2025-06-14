'use client';
import { getCurrentUser } from '@/lib/actions/auth.action';
import { getAllQuizzes } from '@/lib/actions/quiz.action';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FiArrowRight, FiBook, FiClock } from 'react-icons/fi';

export default function QuizHistory() {
  const [user, setUser] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getCurrentUser();
      setUser(user);
    };
    fetchUser();
  }, []);
  
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        console.log('Fetching quizzes for user:', user?.id);
        const data = await getAllQuizzes(user?.id);
        console.log('Fetched quizzes:', data);
        // Sort quizzes by completion date (most recent first)
        const sortedQuizzes = data.sort((a, b) => {
          // Handle Firestore timestamps or date strings
          const dateA = a.completedAt?.toDate?.() || new Date(a.completedAt) || new Date(0);
          const dateB = b.completedAt?.toDate?.() || new Date(b.completedAt) || new Date(0);
          return dateB - dateA;
        });
        setQuizzes(sortedQuizzes);
      } catch (error) {
        console.error('Error fetching quizzes:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (user?.id) {
      fetchQuizzes();
    } else {
      setLoading(false);
    }
  }, [user]);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Not completed';
    try {
      // Handle Firestore timestamp
      const date = timestamp?.toDate?.() || new Date(timestamp);
      
      // Check if date is valid
      if (isNaN(date.getTime())) return 'Invalid date';
      
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Date error';
    }
  };

  if (loading) {
    return (
      <div className="backdrop-blur-xl bg-gray-900/70 rounded-2xl border border-gray-700/50 shadow-xl p-4 sm:p-8">
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <FiBook className="text-xl sm:text-2xl text-emerald-400" />
          <h2 className="text-xl sm:text-2xl font-bold text-white">Quiz History</h2>
        </div>
        <div className="animate-pulse space-y-3 sm:space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 sm:h-24 bg-gray-800/50 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="backdrop-blur-xl bg-gray-900/70 rounded-2xl border border-gray-700/50 shadow-xl p-4 sm:p-8">
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <FiBook className="text-xl sm:text-2xl text-emerald-400" />
        <h2 className="text-xl sm:text-2xl font-bold text-white">Quiz History</h2>
      </div>

      {quizzes.length === 0 ? (
        <div className="text-center py-6 sm:py-8">
          <p className="text-gray-400 text-sm sm:text-base">No quizzes taken yet. Start a new quiz to see your history!</p>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {quizzes.map((quiz, index) => (
            <motion.div
              key={quiz.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => router.push(`/quiz/${quiz.id}`)}
              className="group cursor-pointer"
            >
              <div className="p-4 sm:p-6 rounded-xl border border-emerald-700/30 bg-gray-800/30 hover:bg-emerald-900/20 transition-all">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <h3 className="text-base sm:text-lg font-medium text-white mb-2">
                      {quiz.topic || 'Untitled Quiz'}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm">
                      <div className="flex items-center gap-1.5 sm:gap-2 text-emerald-400">
                        <FiBook className="text-emerald-500" />
                        <span>{quiz.questions?.length || 0} Questions</span>
                      </div>
                      <div className="flex items-center gap-1.5 sm:gap-2 text-gray-400">
                        <FiClock />
                        <span>{formatDate(quiz.completedAt)}</span>
                      </div>
                    </div>
                    {quiz.correct !== undefined && (
                      <div className="mt-2 sm:mt-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 sm:h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                              style={{
                                width: `${(quiz.correct / quiz.total) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="text-emerald-400 text-xs sm:text-sm">
                            {quiz.correct}/{quiz.total}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  <FiArrowRight className="text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
} 