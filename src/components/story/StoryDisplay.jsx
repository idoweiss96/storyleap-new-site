import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Printer, Download, RefreshCw, Star, BookOpen } from 'lucide-react';

export default function StoryDisplay({ story, onNewStory }) {
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <title>סיפור: ${story.child_name}</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px;
            line-height: 1.8;
            direction: rtl;
          }
          h1 {
            color: #7c3aed;
            text-align: center;
            margin-bottom: 30px;
          }
          .content {
            white-space: pre-wrap;
            font-size: 18px;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            color: #888;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <h1>✨ סיפור עבור ${story.child_name} ✨</h1>
        <div class="content">${story.content}</div>
        <div class="footer">נוצר באהבה על ידי StoryLeap</div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleDownload = () => {
    const text = `סיפור עבור ${story.child_name}\n\n${story.content}\n\n---\nנוצר על ידי StoryLeap`;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `סיפור-${story.child_name}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="overflow-hidden border-0 shadow-xl shadow-violet-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-500 to-violet-600 p-6 text-white">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Star className="w-5 h-5 text-amber-300 fill-amber-300" />
            <Star className="w-6 h-6 text-amber-300 fill-amber-300" />
            <Star className="w-5 h-5 text-amber-300 fill-amber-300" />
          </div>
          <h2 className="text-2xl font-bold text-center">
            סיפור עבור {story.child_name}
          </h2>
        </div>

        {/* Story Content */}
        <div className="p-6 md:p-10 bg-gradient-to-b from-amber-50/50 to-white">
          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
            {story.content}
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 bg-gray-50 border-t border-gray-100 flex flex-wrap gap-3 justify-center">
          <Button
            onClick={handlePrint}
            variant="outline"
            className="rounded-xl border-violet-200 text-violet-600 hover:bg-violet-50"
          >
            <Printer className="w-4 h-4 ml-2" />
            הדפסה
          </Button>
          <Button
            onClick={handleDownload}
            variant="outline"
            className="rounded-xl border-violet-200 text-violet-600 hover:bg-violet-50"
          >
            <Download className="w-4 h-4 ml-2" />
            הורדה
          </Button>
          <Button
            onClick={onNewStory}
            className="rounded-xl bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700"
          >
            <RefreshCw className="w-4 h-4 ml-2" />
            סיפור חדש
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}