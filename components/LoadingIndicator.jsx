import { motion } from 'framer-motion';

const LoadingIndicator = ({ text }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mt-6"
    >
      <div className="flex justify-center space-x-2">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 1, 0.3]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2
            }}
            className="w-2 h-2 bg-blue-400 rounded-full"
          />
        ))}
      </div>
      <p className="text-blue-300 font-medium mt-4">{text}</p>
    </motion.div>
  );
}

export default LoadingIndicator;