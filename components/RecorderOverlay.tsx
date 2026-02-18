import React from 'react';
import { Radio, Play, Square, Fingerprint } from 'lucide-react';

interface RecorderOverlayProps {
  isRecording: boolean;
  recordingStartTime: number | null;
  lastSavedFile: string | null;
  lastHash: string | null;
  onStartRecording: () => void;
  onStopRecording: () => void;
}

export const RecorderOverlay: React.FC<RecorderOverlayProps> = ({ 
  isRecording, 
  recordingStartTime,
  lastSavedFile,
  lastHash,
  onStartRecording,
  onStopRecording
}) => {
  const [duration, setDuration] = React.useState<string>("00:00:00");

  React.useEffect(() => {
    let interval: number;
    if (isRecording && recordingStartTime) {
      interval = window.setInterval(() => {
        const diff = Date.now() - recordingStartTime;
        const date = new Date(diff);
        const str = date.toISOString().slice(11, 19);
        setDuration(str);
      }, 1000);
    } else {
      setDuration("00:00:00");
    }
    return () => clearInterval(interval);
  }, [isRecording, recordingStartTime]);

  return (
    <div className="absolute inset-0 pointer-events-none p-4 md:p-6 flex flex-col justify-between z-20">
      {/* Top Bar */}
      <div className="flex justify-between items-start">
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md border ${isRecording ? 'bg-red-500/20 border-red-500/50' : 'bg-gray-900/40 border-gray-700/50'}`}>
          <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-red-500 animate-pulse-fast' : 'bg-gray-500'}`} />
          <span className={`font-mono font-bold text-sm tracking-widest ${isRecording ? 'text-red-400' : 'text-gray-400'}`}>
            {isRecording ? 'GRAV' : 'AGUARDANDO'}
          </span>
          {isRecording && <span className="font-mono text-white ml-2">{duration}</span>}
        </div>

        <div className="flex flex-col items-end gap-2">
           <div className="bg-black/50 backdrop-blur-md px-3 py-1 rounded border border-gray-700">
             <span className="text-xs text-gray-400 font-mono">COMPRESSÃO: VP9/BAIXA</span>
           </div>
        </div>
      </div>

      {/* Center Grid (Decorative) */}
      <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
         <div className="w-64 h-64 border border-white rounded-full"></div>
         <div className="absolute w-full h-[1px] bg-white"></div>
         <div className="absolute h-full w-[1px] bg-white"></div>
      </div>

      {/* Bottom Bar */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        {/* Status Box */}
        <div className="bg-black/60 backdrop-blur-md p-4 rounded-lg border border-gray-700 w-full md:w-auto md:max-w-lg order-2 md:order-1">
           <h3 className="text-xs font-bold text-gray-400 uppercase mb-2 flex items-center gap-2">
             <Radio size={12} /> Status do Sistema
           </h3>
           <div className="space-y-1 font-mono text-xs">
             <div className="flex justify-between gap-4">
               <span className="text-gray-500">MODO</span>
               <span className="text-blue-400">CLIENT_SIDE + HASHING</span>
             </div>
             <div className="flex justify-between gap-4">
               <span className="text-gray-500">ÚLTIMO ARQUIVO</span>
               <span className="text-emerald-400 truncate max-w-[150px]">
                 {lastSavedFile || 'NENHUM'}
               </span>
             </div>
             {lastHash && (
               <div className="flex flex-col gap-1 mt-2 pt-2 border-t border-gray-700">
                  <span className="text-gray-500 flex items-center gap-1"><Fingerprint size={10}/> ASSINATURA DIGITAL (SHA-256)</span>
                  <span className="text-orange-400 break-all text-[10px] leading-tight select-all pointer-events-auto">
                    {lastHash}
                  </span>
               </div>
             )}
           </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col items-end gap-4 w-full md:w-auto order-1 md:order-2 pointer-events-auto">
           
           {/* Primary Control Button (Mobile Friendly) */}
           <div className="w-full md:w-auto">
             {!isRecording ? (
               <button 
                 onClick={onStartRecording}
                 className="w-full md:w-auto flex items-center justify-center gap-3 bg-emerald-900/40 hover:bg-emerald-900/60 backdrop-blur-md border border-emerald-500/50 text-emerald-400 px-8 py-4 rounded-lg transition-all active:scale-95 shadow-lg shadow-emerald-900/20 group touch-manipulation"
               >
                 <div className="relative">
                   <div className="absolute inset-0 bg-emerald-400 rounded-full blur opacity-20 group-hover:opacity-40 animate-pulse"></div>
                   <Play size={20} fill="currentColor" />
                 </div>
                 <span className="font-mono font-bold tracking-widest text-sm md:text-base">INICIAR GRAVAÇÃO</span>
               </button>
             ) : (
               <button 
                 onClick={onStopRecording}
                 className="w-full md:w-auto flex items-center justify-center gap-3 bg-red-900/40 hover:bg-red-900/60 backdrop-blur-md border border-red-500/50 text-red-400 px-8 py-4 rounded-lg transition-all active:scale-95 shadow-lg shadow-red-900/20 animate-pulse-fast touch-manipulation"
               >
                 <Square size={20} fill="currentColor" />
                 <span className="font-mono font-bold tracking-widest text-sm md:text-base">PARAR E SALVAR</span>
               </button>
             )}
           </div>

           {/* Desktop Keyboard Hints (Hidden on small mobile) */}
           <div className="hidden md:flex flex-col gap-2 opacity-50 pointer-events-none">
              <div className="flex items-center gap-3 bg-gray-900/80 backdrop-blur-md px-4 py-2 rounded border border-gray-700">
                 <div className="bg-gray-700 px-2 py-0.5 rounded text-xs font-bold font-mono border-b-2 border-gray-900 text-white">PgUp</div>
                 <span className="text-xs font-bold text-gray-300 uppercase">Gravar</span>
              </div>
              <div className="flex items-center gap-3 bg-gray-900/80 backdrop-blur-md px-4 py-2 rounded border border-gray-700">
                 <div className="bg-gray-700 px-2 py-0.5 rounded text-xs font-bold font-mono border-b-2 border-gray-900 text-white">PgDn</div>
                 <span className="text-xs font-bold text-gray-300 uppercase">Parar</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};