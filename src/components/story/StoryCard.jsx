import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Calendar, Sparkles } from 'lucide-react';
import { format } from 'date-fns';

const settingLabels = {
  space: { label: 'חלל', emoji: '🚀', color: 'bg-blue-100 text-blue-700' },
  forest: { label: 'יער קסום', emoji: '🌳', color: 'bg-green-100 text-green-700' },
  castle: { label: 'ארמון', emoji: '🏰', color: 'bg-purple-100 text-purple-700' },
  sports: { label: 'ספורט', emoji: '⚽', color: 'bg-orange-100 text-orange-700' },
  real_life: { label: 'חיים אמיתיים', emoji: '🏠', color: 'bg-amber-100 text-amber-700' },
};

export default function StoryCard({ story, onClick, index = 0 }) {
  const setting = settingLabels[story.setting] || { label: story.setting, emoji: '📖', color: 'bg-gray-100 text-gray-700' };
  const preview = story.content?.substring(0, 120) + '...' || '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card
        onClick={onClick}
        className="cursor-pointer group overflow-hidden border-0 shadow-lg shadow-violet-50 hover:shadow-xl hover:shadow-violet-100 transition-all duration-300 hover:-translate-y-1"
      >
        {/* Decorative Top */}
        <div className="h-2 bg-gradient-to-r from-violet-400 via-violet-500 to-amber-400" />

        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 group-hover:text-violet-600 transition-colors">
                  {story.child_name}
                </h3>
                <p className="text-xs text-gray-500">גיל {story.child_age}</p>
              </div>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${setting.color}`}>
              {setting.emoji} {setting.label}
            </span>
          </div>

          <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-3">
            {preview}
          </p>

          <div className="flex items-center justify-between text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {format(new Date(story.created_date), 'dd/MM/yyyy')}
            </span>
            <span className="flex items-center gap-1 text-violet-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              <Sparkles className="w-3 h-3" />
              קראו את הסיפור
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}