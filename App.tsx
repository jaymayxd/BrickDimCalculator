
import React from 'react';
import BrickCalculator from './components/BrickCalculator';
import { BrickIcon } from './components/icons';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <BrickIcon className="h-8 w-8 text-orange-600" />
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Brickwork Bond Calculator
          </h1>
        </div>
      </header>
      <main className="container mx-auto p-4 md:p-8">
        <BrickCalculator />
      </main>
      <footer className="text-center py-4 mt-8 text-slate-500 text-sm">
        <p>Built by a World-Class Senior Frontend React Engineer.</p>
      </footer>
    </div>
  );
};

export default App;
