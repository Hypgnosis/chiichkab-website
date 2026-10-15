import React, { useEffect } from 'react';

export default function ProductPage({ onBack }) {
  useEffect(() => {
    // Automatically redirect back to the main landing page
    onBack();
  }, [onBack]);

  return (
    <div className="w-screen h-screen bg-stone-50 flex items-center justify-center text-emerald-950 font-sans">
      <div className="text-center space-y-4">
        <p className="text-xl font-light animate-pulse">Redirecting to the sanctuary portal...</p>
        <button 
          onClick={onBack} 
          className="px-6 py-2 bg-emerald-950 text-white rounded-full text-sm font-semibold hover:bg-emerald-900 transition-all"
        >
          Return Home
        </button>
      </div>
    </div>
  );
}
