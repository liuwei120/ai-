import React from 'react';
import { AppStep } from '../types';

interface StepsProps {
  currentStep: AppStep;
}

export const Steps: React.FC<StepsProps> = ({ currentStep }) => {
  const steps = [
    { id: AppStep.SELECT_PERSON, label: 'Person' },
    { id: AppStep.SELECT_OUTFIT, label: 'Outfit' },
    { id: AppStep.RESULT, label: 'Result' },
  ];

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 -z-10 rounded-full"></div>
        
        {steps.map((step, idx) => {
          const isActive = currentStep >= step.id;
          const isCurrent = currentStep === step.id;
          
          return (
            <div key={step.id} className="flex flex-col items-center bg-white px-2">
              <div 
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border-2
                  ${isActive ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-gray-300 text-gray-400'}
                  ${isCurrent ? 'ring-4 ring-indigo-100 scale-110' : ''}
                `}
              >
                {idx + 1}
              </div>
              <span className={`text-xs mt-2 font-medium ${isActive ? 'text-indigo-600' : 'text-gray-400'}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
