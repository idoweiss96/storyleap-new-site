import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sparkles, Star, BookOpen, Wallet, ArrowLeft, ArrowRight, X, PartyPopper } from 'lucide-react';

const tourSteps = [
  {
    id: 'welcome',
    title: 'Welcome to StoryLeap! 🎉',
    description: "We're so glad you joined! Let us show you around in a few simple steps.",
    icon: PartyPopper,
    position: 'center',
  },
  {
    id: 'credits',
    title: 'Your Free Credits ⭐',
    description: "You've received 20 free credits — enough to create your first personalized story!",
    icon: Star,
    position: 'top-right',
    highlight: 'credits',
  },
  {
    id: 'create',
    title: 'Create a Story ✨',
    description: 'Click "New Story" to create a personalized story for your child. Just fill in the details and the magic happens!',
    icon: Sparkles,
    position: 'top',
    highlight: 'create',
  },
  {
    id: 'stories',
    title: 'My Stories 📚',
    description: 'All your created stories are saved here. You can re-read, print, or download them anytime.',
    icon: BookOpen,
    position: 'top',
    highlight: 'stories',
  },
  {
    id: 'finish',
    title: "You're all set! 🚀",
    description: "That's it! Now you know everything. Let's create your first story!",
    icon: Sparkles,
    position: 'center',
  },
];

export default function OnboardingTour({ onComplete, onSkip }) {
  const [currentStep, setCurrentStep] = useState(0);
  const step = tourSteps[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === tourSteps.length - 1;

  const handleNext = () => {
    if (isLast) {
      onComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirst) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const Icon = step.icon;

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onSkip}
      />

      {/* Tour Card */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <motion.div
          key={step.id}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="w-full max-w-md bg-white border-0 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-violet-500 to-violet-600 p-6 text-white relative">
              <button
                onClick={onSkip}
                className="absolute top-4 left-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
                  <Icon className="w-8 h-8 text-white" />
                </div>
              </div>
              
              <h2 className="text-xl font-bold text-center">{step.title}</h2>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-gray-600 text-center leading-relaxed mb-6">
                {step.description}
              </p>

              {/* Progress Dots */}
              <div className="flex justify-center gap-2 mb-6">
                {tourSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentStep ? 'bg-violet-500' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>

              {/* Navigation */}
              <div className="flex gap-3">
                {!isFirst && (
                  <Button
                    variant="outline"
                    onClick={handlePrev}
                    className="flex-1 h-11 rounded-xl border-violet-200 text-violet-600 hover:bg-violet-50"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back
                  </Button>
                )}
                
                <Button
                  onClick={handleNext}
                  className={`flex-1 h-11 rounded-xl bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700 ${isFirst ? 'w-full' : ''}`}
                >
                  {isLast ? "Let's go!" : 'Next'}
                  {!isLast && <ArrowRight className="w-4 h-4 ml-1" />}
                </Button>
              </div>

              {isFirst && (
                <button
                  onClick={onSkip}
                  className="w-full mt-3 text-sm text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Skip tour
                </button>
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}