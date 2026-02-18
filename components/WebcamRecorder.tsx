import React, { useRef, useEffect, useState, useCallback } from 'react';
import { formatDateForFilename, formatTimeForWatermark } from '../utils/dateUtils';
import { generateSHA256, generateLogFile } from '../utils/securityUtils';
import { RecorderOverlay } from './RecorderOverlay';
import { CameraOff, AlertTriangle } from 'lucide-react';

export const WebcamRecorder: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recordingStartTime, setRecordingStartTime] = useState<number | null>(null);
  const [lastSavedFile, setLastSavedFile] = useState<string | null>(null);
  const [lastHash, setLastHash] = useState<string | null>(null);
  const [flash, setFlash] = useState(false);

  // 1. Initialize Camera
  useEffect(() => {
    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            width: { ideal: 1280 }, 
            height: { ideal: 720 },
            facingMode: 'user'
          },
          audio: true,
        });
        
        streamRef.current = stream;
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      } catch (err) {
        console.error("Error accessing webcam:", err);
        setError("Não foi possível acessar a câmera/microfone. Por favor, verifique as permissões.");
      }
    };

    initCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // 2. Canvas Processing Loop (The Watermark Logic)
  const drawToCanvas = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: false });

    if (!ctx) return;

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw Video
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // --- WATERMARK DRAWING ---
      const now = new Date();
      const timeStr = formatTimeForWatermark(now);
      const sessionStartStr = recordingStartTime 
        ? `INÍCIO: ${formatTimeForWatermark(new Date(recordingStartTime))}` 
        : 'OCIOSO';

      ctx.font = 'bold 24px "JetBrains Mono", monospace';
      ctx.textBaseline = 'top';

      // Top Left: Current Time
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 4;
      ctx.strokeText(`AO VIVO: ${timeStr}`, 20, 20);
      ctx.fillStyle = '#00ff41'; // Matrix green
      ctx.fillText(`AO VIVO: ${timeStr}`, 20, 20);

      // Bottom Right: Session Info
      const bottomText = `ENVIOSEGURO_CAM | ${sessionStartStr}`;
      ctx.textBaseline = 'bottom';
      const textWidth = ctx.measureText(bottomText).width;
      
      ctx.strokeText(bottomText, canvas.width - textWidth - 20, canvas.height - 20);
      ctx.fillStyle = 'white';
      ctx.fillText(bottomText, canvas.width - textWidth - 20, canvas.height - 20);
      
      // Recording Indicator on Video (burnt in)
      if (isRecording) {
        ctx.beginPath();
        ctx.arc(canvas.width - 30, 30, 10, 0, 2 * Math.PI);
        ctx.fillStyle = 'red';
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }

    animationFrameRef.current = requestAnimationFrame(drawToCanvas);
  }, [isRecording, recordingStartTime]);

  // Start the loop when video plays
  useEffect(() => {
    drawToCanvas();
  }, [drawToCanvas]);


  // 3. Start Recording Logic
  const startRecording = useCallback(() => {
    if (isRecording || !canvasRef.current || !streamRef.current) return;

    try {
      // Create a stream from the canvas (Video with watermark)
      const canvasStream = canvasRef.current.captureStream(30); // 30 FPS
      
      // Get Audio track from original stream and add to canvas stream
      const audioTracks = streamRef.current.getAudioTracks();
      if (audioTracks.length > 0) {
        canvasStream.addTrack(audioTracks[0]);
      }

      // Configure for high compression / low file size
      const options = {
        mimeType: 'video/webm;codecs=vp9', 
        videoBitsPerSecond: 1500000 // 1.5 Mbps (Very light for HD)
      };

      // Fallback for browsers not supporting VP9
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        console.warn("VP9 not supported, falling back to VP8");
        // @ts-ignore
        options.mimeType = 'video/webm;codecs=vp8';
      }

      const recorder = new MediaRecorder(canvasStream, options);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = async () => {
        const endTime = new Date();
        const blob = new Blob(chunks, { type: 'video/webm' });
        
        // Calculate SHA-256 Hash
        const hash = await generateSHA256(blob);
        setLastHash(hash);

        // Generate automatic filename
        const startTime = recordingStartTime ? new Date(recordingStartTime) : new Date();
        const startTimeStr = formatDateForFilename(startTime);
        const endTimeStr = formatDateForFilename(endTime);
        
        const videoFilename = `GRAV_${startTimeStr}_ATE_${endTimeStr}.webm`;
        const logFilename = `LOG_${startTimeStr}_ATE_${endTimeStr}.txt`;
        
        // Trigger Download Video
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = videoFilename;
        document.body.appendChild(a);
        a.click();
        
        // Trigger Download Log File (Hash & Metadata) with delay to avoid blocking
        setTimeout(() => {
          const logBlob = generateLogFile(videoFilename, startTime.toISOString(), endTime.toISOString(), hash);
          const logUrl = URL.createObjectURL(logBlob);
          const logLink = document.createElement('a');
          logLink.style.display = 'none';
          logLink.href = logUrl;
          logLink.download = logFilename;
          document.body.appendChild(logLink);
          logLink.click();
          
          // Cleanup Log
          setTimeout(() => {
            if (document.body.contains(logLink)) {
              document.body.removeChild(logLink);
            }
            window.URL.revokeObjectURL(logUrl);
          }, 100);
        }, 1500); // 1.5 second delay

        // Cleanup Video
        setTimeout(() => {
          if (document.body.contains(a)) {
            document.body.removeChild(a);
          }
          window.URL.revokeObjectURL(url);
        }, 100);

        setLastSavedFile(videoFilename);
      };

      recorder.start(1000); // Collect chunks every second
      mediaRecorderRef.current = recorder;
      
      const start = Date.now();
      setRecordingStartTime(start);
      setIsRecording(true);
      setLastHash(null); // Reset hash for new recording
      setFlash(true);
      setTimeout(() => setFlash(false), 500);

    } catch (err) {
      console.error("Failed to start recorder", err);
      setError("Falha ao inicializar o sistema de gravação.");
    }
  }, [isRecording, recordingStartTime]);


  // 4. Stop Recording Logic
  const stopRecording = useCallback(() => {
    if (!isRecording || !mediaRecorderRef.current) return;

    if (mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    setIsRecording(false);
    setRecordingStartTime(null);
    setFlash(true);
    setTimeout(() => setFlash(false), 500);
  }, [isRecording]);


  // 5. Keyboard Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'PageUp') {
        e.preventDefault();
        startRecording();
      } else if (e.code === 'PageDown') {
        e.preventDefault();
        stopRecording();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [startRecording, stopRecording]);


  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-red-500 bg-gray-900 rounded-lg border border-red-900/50 p-8">
        <AlertTriangle size={48} className="mb-4" />
        <h2 className="text-xl font-bold mb-2">Erro do Sistema</h2>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-6 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-mono text-sm"
        >
          REINICIAR SISTEMA
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-black overflow-hidden rounded-xl shadow-2xl border border-gray-800">
      
      {/* Hidden Video Source (The raw camera feed) */}
      <video 
        ref={videoRef} 
        className="absolute opacity-0 pointer-events-none" 
        muted 
        playsInline 
      />

      {/* Visible Canvas (The processed feed with watermark) */}
      <canvas 
        ref={canvasRef}
        className="w-full h-full object-contain bg-gray-950"
      />

      {/* UI Overlay */}
      <RecorderOverlay 
        isRecording={isRecording} 
        recordingStartTime={recordingStartTime}
        lastSavedFile={lastSavedFile}
        lastHash={lastHash}
        onStartRecording={startRecording}
        onStopRecording={stopRecording}
      />

      {/* Visual Feedback Flash */}
      {flash && <div className="absolute inset-0 bg-white animate-flash pointer-events-none z-50 mix-blend-overlay"></div>}

      {/* Fallback for loading */}
      {!streamRef.current && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-500 gap-2 bg-gray-900 z-0">
          <CameraOff size={24} />
          <span className="font-mono text-sm">INICIALIZANDO SENSORES...</span>
        </div>
      )}
    </div>
  );
};