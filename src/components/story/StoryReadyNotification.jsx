import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkles, ExternalLink, X } from 'lucide-react';

export default function StoryReadyNotification({ story, onClose }) {
  if (!story) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-center relative"
        >
          <button
            onClick={onClose}
            className="absolute top-4 left-4 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-100 to-violet-200 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-10 h-10 text-violet-600" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            הסיפור של {story.child_name} מוכן! 🎉
          </h2>
          <p className="text-gray-600 mb-6">
            הסיפור המותאם אישית מוכן לצפייה!
          </p>

          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              onClick={onClose}
              className="rounded-xl"
            >
              אחר כך
            </Button>
            <a
              href={story.story_link}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700 rounded-xl">
                <ExternalLink className="w-4 h-4 ml-2" />
                צפייה בסיפור
              </Button>
            </a>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}