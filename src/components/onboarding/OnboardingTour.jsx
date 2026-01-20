import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  X, 
  ChevronRight, 
  ChevronLeft,
  ClipboardList,
  FileText,
  Briefcase,
  Receipt,
  MessageSquare,
  User,
  Sparkles,
  CheckCircle
} from 'lucide-react';
import Link from "next/link";

const tourSteps = [
  {
    id: 'welcome',
    title: '👋 Welcome to DestructionOps!',
    description: "Let's take a quick tour to help you get started with your customer portal.",
    icon: Sparkles,
    actions: null
  },
  {
    id: 'requests',
    title: 'Service Requests',
    description: 'Submit and track your destruction and recycling requests. This is where your journey begins!',
    icon: ClipboardList,
    page: 'CustomerRequests',
    actions: [
      { label: 'View Requests', page: 'CustomerRequests' }
    ]
  },
  {
    id: 'estimates',
    title: 'Estimates',
    description: 'Review pricing quotes from our team and accept them to move forward with your projects.',
    icon: FileText,
    page: 'CustomerEstimates',
    actions: [
      { label: 'View Estimates', page: 'CustomerEstimates' }
    ]
  },
  {
    id: 'jobs',
    title: 'Jobs',
    description: 'Track operational execution, view completion status, and access job media and documentation.',
    icon: Briefcase,
    page: 'CustomerJobs',
    actions: [
      { label: 'View Jobs', page: 'CustomerJobs' }
    ]
  },
  {
    id: 'invoices',
    title: 'Invoices & Payments',
    description: 'View invoices, make payments, and download receipts all in one place.',
    icon: Receipt,
    page: 'CustomerInvoices',
    actions: [
      { label: 'View Invoices', page: 'CustomerInvoices' }
    ]
  },
  {
    id: 'profile',
    title: 'Complete Your Profile',
    description: 'Add your company details and contact information to speed up future requests.',
    icon: User,
    page: 'CustomerProfile',
    actions: [
      { label: 'Complete Profile', page: 'CustomerProfile' }
    ]
  },
  {
    id: 'done',
    title: '🎉 You\'re All Set!',
    description: 'Ready to get started? Create your first service request or explore the portal.',
    icon: CheckCircle,
    actions: [
      { label: 'Create First Request', page: 'CustomerRequests', primary: true },
      { label: 'Explore Dashboard', page: 'CustomerDashboard' }
    ]
  }
];

export default function OnboardingTour({ onComplete, onSkip }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const step = tourSteps[currentStep];
  const Icon = step.icon;
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    setTimeout(() => onComplete(), 300);
  };

  const handleSkipTour = () => {
    setIsVisible(false);
    setTimeout(() => onSkip(), 300);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={handleSkipTour}
          />

          {/* Tour Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl px-4"
          >
            <Card className="shadow-2xl border-2 border-blue-200">
              <CardContent className="p-8">
                {/* Close Button */}
                <button
                  onClick={handleSkipTour}
                  className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-600">
                      Step {currentStep + 1} of {tourSteps.length}
                    </span>
                    <span className="text-xs text-slate-500">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                {/* Content */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 mb-4">
                    <Icon className="w-10 h-10 text-blue-600" />
                  </div>
                  
                  <h2 className="text-3xl font-bold text-slate-900 mb-3">
                    {step.title}
                  </h2>
                  
                  <p className="text-slate-600 text-lg max-w-xl mx-auto">
                    {step.description}
                  </p>
                </div>

                {/* Actions */}
                {step.actions && (
                  <div className="flex gap-3 justify-center mb-6">
                    {step.actions.map((action, idx) => (
                      <Link key={idx} to={action.page} onClick={handleComplete}>
                        <Button
                          className={action.primary ? 'bg-blue-600 hover:bg-blue-700' : ''}
                          variant={action.primary ? 'default' : 'outline'}
                        >
                          {action.label}
                        </Button>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between pt-6 border-t">
                  <Button
                    variant="ghost"
                    onClick={handlePrev}
                    disabled={currentStep === 0}
                    className="gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={handleSkipTour}
                    className="text-slate-500"
                  >
                    Skip Tour
                  </Button>

                  <Button
                    onClick={handleNext}
                    className="bg-blue-600 hover:bg-blue-700 gap-2"
                  >
                    {currentStep === tourSteps.length - 1 ? 'Finish' : 'Next'}
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}