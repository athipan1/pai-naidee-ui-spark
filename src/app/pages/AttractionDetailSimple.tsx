import React from 'react';

interface AttractionDetailSimpleProps {
  currentLanguage: 'th' | 'en';
  onBack: () => void;
}

const AttractionDetailSimple = ({ currentLanguage, onBack }: AttractionDetailSimpleProps) => {
  return (
    <div className="min-h-screen bg-background p-4">
      <h1 className="text-2xl font-bold">Attraction Detail - Simple Version</h1>
      <p>Current Language: {currentLanguage}</p>
      <button onClick={onBack} className="bg-blue-500 text-white px-4 py-2 rounded">
        Back
      </button>
    </div>
  );
};

export default AttractionDetailSimple;