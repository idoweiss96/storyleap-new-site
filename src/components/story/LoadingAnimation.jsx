import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Star, Wand2 } from 'lucide-react';

const loadingMessages = [
  'הפיה מחפשת מילים קסומות...',
  'הכוכבים מאירים את הדרך...',
  'מכינים הרפתקה מיוחדת...',
  'הקסם מתחיל לעבוד...',
  'עוד רגע קט והסיפור מוכן...',
];

export default function LoadingAnimation() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {/* Animated Stars */}
      <div className="relative w-32 h-32 mb-8">
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        >
          <Star className="w-6 h-6 text-amber-400 fill-amber-400 absolute top-0" />
          <Star className="w-4 h-4 text-violet-400 fill-violet-400 absolute right-0" />
          <Star className="w-5 h-5 text-amber-300 fill-amber-300 absolute bottom-0" />
          <Star className="w-4 h-4 text-violet-300 fill-violet-300 absolute left-0" />
        </motion.div>

        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center shadow-lg shadow-violet-300">
            <Wand2 className="w-10 h-10 text-white" />
          </div>
        </motion.div>

        {/* Sparkles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              top: `${20 + Math.random() * 60}%`,
              left: `${20 + Math.random() * 60}%`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.3,
            }}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
          </motion.div>
        ))}
      </div>

      {/* Loading Text */}
      <motion.div
        key={messageIndex}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="text-center"
      >
        <h3 className="text-xl font-semibold text-violet-700 mb-2">
          {loadingMessages[messageIndex]}
        </h3>
        <p className="text-gray-500 text-sm">
          הסיפור ייווצר תוך מספר שניות
        </p>
      </motion.div>

      {/* Progress Dots */}
      <div className="flex gap-2 mt-6">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-violet-400"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
    </div>
  );
}