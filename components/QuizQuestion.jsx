import { motion } from 'framer-motion';
import { FiBox } from 'react-icons/fi';

export function QuizQuestion({ question, onAnswer, progress, currentNumber, total }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="backdrop-blur-xl bg-gray-900/70 rounded-2xl border border-emerald-500/20 shadow-xl p-8"
    >
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <FiBox className="text-emerald-400" />
            Question {currentNumber} <span className="text-gray-400">/ {total}</span>
          </h2>
          <span className="px-4 py-2 bg-emerald-900/50 text-emerald-200 rounded-full text-sm font-medium border border-emerald-700/30">
            Progress: {Math.round(progress)}%
          </span>
        </div>
        <div className="w-full bg-gray-800/50 rounded-full h-2 border border-emerald-700/30">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="bg-gradient-to-r from-emerald-500 to-cyan-600 h-full rounded-full"
          />
        </div>
      </div>

      <div className="space-y-6">
        <p className="text-xl text-white font-medium">
          {question.question}
        </p>
        <div className="grid gap-4">
          {question.options.map((option, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.01, backgroundColor: 'rgba(16, 185, 129, 0.1)' }}
              whileTap={{ scale: 0.99 }}
              onClick={() => onAnswer(option)}
              className="w-full text-left p-4 rounded-xl border border-emerald-700/30 hover:border-emerald-500/50 bg-gray-800/30 hover:bg-emerald-900/20 transition-all group"
            >
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-900/50 text-emerald-300 mr-3 group-hover:bg-emerald-800/50 group-hover:text-emerald-200 transition-all text-sm font-medium">
                {['A', 'B', 'C', 'D'][index]}
              </span>
              <span className="text-gray-200 group-hover:text-emerald-200 transition-colors">
                {option}
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}