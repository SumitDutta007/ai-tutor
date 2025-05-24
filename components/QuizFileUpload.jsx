import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { FiUpload, FiFile, FiCpu } from 'react-icons/fi';
import { motion } from 'framer-motion';
import LoadingIndicator from '@/components/LoadingIndicator'

export const QuizFileUpload = ({ onFileUpload, isLoading }) => {
  const [file, setFile] = useState(null);

    const onDrop = useCallback(async (acceptedFiles) => {
            if (acceptedFiles.length === 0) return;
            console.log(acceptedFiles);
            
            try {
                const file = acceptedFiles[0];
                // Convert file to base64
                const arrayBuffer = await file.arrayBuffer();
                const base64String = Buffer.from(arrayBuffer).toString('base64');
                
                const fileData = {
                    type: file.type,
                    file: base64String
                };
                setFile(fileData);
                onFileUpload(fileData);
            } catch (error) {
                console.error('Error processing file:', error);
            }
        }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    maxFiles: 1,
  });

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      {...getRootProps()}
      className={`
        relative overflow-hidden
        border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
        transition-all duration-200 ease-in-out
        ${isDragActive 
          ? 'border-emerald-400/50 bg-emerald-500/10' 
          : 'border-gray-600/50 hover:border-emerald-400/50 hover:bg-gray-800/30'
        }
        ${isLoading ? 'pointer-events-none opacity-50' : ''}
      `}
    >
      <input {...getInputProps()} />
      
      {/* Background Circuit Pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <pattern id="circuit" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 10 10 M 0 10 L 20 10" stroke="currentColor" strokeWidth="0.5" fill="none"/>
          </pattern>
          <rect x="0" y="0" width="100" height="100" fill="url(#circuit)"/>
        </svg>
      </div>
      
      {file ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative flex flex-col items-center"
        >
          <div className="mb-4 p-3 rounded-full bg-emerald-900/50 border border-emerald-500/30">
            <FiFile className="h-8 w-8 text-emerald-400" />
          </div>
          <p className="text-emerald-300 font-medium">{file.name}</p>
          <p className="text-gray-400 text-sm mt-2">
            File ready for AI analysis
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative flex flex-col items-center"
        >
          <div className="mb-4 p-3 rounded-full bg-gray-800/50 border border-gray-700/30">
            <FiUpload className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-gray-300 font-medium mb-2">
            {isDragActive 
              ? 'Release to upload...'
              : 'Drop your study material here'
            }
          </p>
          <p className="text-sm text-gray-400 mb-4">
            or click to browse files
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
            <FiCpu className="h-4 w-4" />
            <span>Supported: PDF, DOC, DOCX, TXT (max 10MB)</span>
          </div>
        </motion.div>
      )}

      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 backdrop-blur-sm bg-gray-900/50 flex items-center justify-center"
        >
          <div className="flex flex-col items-center">
            <div className="flex space-x-2 mb-4">
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
                  className="w-2 h-2 bg-emerald-400 rounded-full"
                />
              ))}
            </div>
            <p className="text-emerald-300 font-medium">AI is analyzing your content...</p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};