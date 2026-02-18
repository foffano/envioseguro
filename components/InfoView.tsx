import React from 'react';
import { ShieldAlert, FileCheck, Zap, ArrowLeft, Lock, HardDrive, MousePointerClick } from 'lucide-react';

interface InfoViewProps {
  onBack: () => void;
}

export const InfoView: React.FC<InfoViewProps> = ({ onBack }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[600px] animate-pulse-fast-once">
      
      {/* Hero Section */}
      <div className="text-center mb-12 max-w-2xl">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
          Sua operação blindada contra <span className="text-blue-500">fraudes</span> e <span className="text-red-500">prejuízos</span>.
        </h2>
        <p className="text-gray-400 text-lg">
          O Envio Seguro é um sistema de evidência digital que protege seu e-commerce contra a má fé.
        </p>
      </div>

      {/* Grid de Cards (As "Caixas") */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-12">
        
        {/* Card 1 */}
        <div className="bg-gray-900/50 border border-gray-800 p-6 rounded-xl hover:border-red-500/50 transition-all group">
          <div className="w-12 h-12 bg-red-900/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-red-900/40">
            <ShieldAlert className="text-red-500" size={24} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">O Problema</h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            Clientes alegando que receberam "pedra no lugar de produto" ou itens quebrados. Marketplaces bloqueando seu saldo por falta de provas.
          </p>
        </div>

        {/* Card 2 */}
        <div className="bg-gray-900/50 border border-gray-800 p-6 rounded-xl hover:border-blue-500/50 transition-all group relative overflow-hidden">
          <div className="w-12 h-12 bg-blue-900/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-900/40">
            <FileCheck className="text-blue-400" size={24} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">A Solução</h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            Gera um vídeo com <strong>Data/Hora gravada na imagem</strong> e um relatório de integridade (Hash SHA-256). É a prova irrefutável do envio correto.
          </p>
        </div>

        {/* Card 3 */}
        <div className="bg-gray-900/50 border border-gray-800 p-6 rounded-xl hover:border-emerald-500/50 transition-all group">
          <div className="w-12 h-12 bg-emerald-900/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-emerald-900/40">
            <Zap className="text-emerald-400" size={24} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Eficiência Extrema</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex items-center gap-2">
              <MousePointerClick size={14} /> 1 Clique para Gravar (PageUp)
            </li>
            <li className="flex items-center gap-2">
              <HardDrive size={14} /> Arquivos ultra-leves (VP9)
            </li>
            <li className="flex items-center gap-2">
              <Lock size={14} /> 100% Local e Seguro
            </li>
          </ul>
        </div>
      </div>

      {/* CTA Back */}
      <button 
        onClick={onBack}
        className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-all shadow-lg shadow-blue-900/20"
      >
        <ArrowLeft size={20} />
        VOLTAR PARA O GRAVADOR
      </button>

    </div>
  );
};