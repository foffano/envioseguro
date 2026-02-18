import React, { useState } from 'react';
import { WebcamRecorder } from './components/WebcamRecorder';
import { InfoView } from './components/InfoView';
import { ShieldCheck, HelpCircle } from 'lucide-react';

export default function App() {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4 md:p-8 font-sans flex flex-col">
      {/* Header */}
      <header className="mb-6 flex justify-between items-center border-b border-gray-800 pb-4">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setShowInfo(false)}>
          <div className="p-2 bg-blue-600/20 rounded-lg border border-blue-500/30">
            <ShieldCheck className="text-blue-400" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">ENVIO SEGURO</h1>
            <p className="text-xs text-gray-500 font-mono">Proteção contra fraudes e contestação de entregas</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-6 text-xs font-mono text-gray-400">
           <div className="flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-green-500"></span>
             SISTEMA ONLINE
           </div>
           <div className="flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-blue-500"></span>
             INTEGRIDADE SHA-256
           </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-6xl mx-auto flex flex-col gap-6">
        
        {showInfo ? (
          <InfoView onBack={() => setShowInfo(false)} />
        ) : (
          <>
            {/* Recorder Viewport */}
            <div className="flex-1 relative min-h-[400px] md:min-h-[600px]">
              <WebcamRecorder />
            </div>

            {/* Footer Info */}
            <footer className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-500 border-t border-gray-800 pt-4 font-mono">
              <div className="flex flex-col gap-1">
                <strong className="text-gray-300">AVISO DE PRIVACIDADE</strong>
                <p>Todos os dados são processados localmente. Um relatório de hash é gerado para cada vídeo.</p>
              </div>
              <div className="flex flex-col gap-1 items-center md:items-start">
                 <button 
                  onClick={() => setShowInfo(true)}
                  className="mt-2 flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-blue-400 border border-gray-700 rounded-md transition-colors"
                 >
                   <HelpCircle size={14} />
                   ENTENDA COMO FUNCIONA
                 </button>
              </div>
              <div className="flex flex-col gap-1 md:items-end">
                <strong className="text-gray-300">ATALHOS DE TECLADO</strong>
                <div className="flex gap-4 mt-1">
                   <span className="flex items-center gap-1"><kbd className="bg-gray-800 px-1 rounded border border-gray-700">PgUp</kbd> Gravar</span>
                   <span className="flex items-center gap-1"><kbd className="bg-gray-800 px-1 rounded border border-gray-700">PgDn</kbd> Salvar</span>
                </div>
              </div>
            </footer>
          </>
        )}
      </main>
    </div>
  );
}