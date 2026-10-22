import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Eraser, Download } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/utils';

const COLORS = ['#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6', '#A855F7', '#000000'];
const SIZES = [5, 10, 20];

export default function DrawingScreen({ onBack }: { onBack: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState(COLORS[0]);
  const [size, setSize] = useState(SIZES[1]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set actual size in memory (scaled to account for extra pixel density)
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, rect.width, rect.height);
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, rect.width, rect.height);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="h-full w-full flex flex-col bg-emerald-50"
    >
      <div className="flex items-center justify-between p-6 pb-2">
        <Button variant="outline" size="icon" onClick={onBack} className="rounded-full">
          <ArrowLeft size={24} />
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={clearCanvas} className="rounded-full">
            <Eraser size={24} />
          </Button>
        </div>
      </div>

      <div className="flex-1 px-6 pb-6 flex flex-col gap-4">
        <div className="flex-1 bg-white rounded-3xl shadow-inner border-4 border-emerald-100 overflow-hidden relative">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseOut={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="w-full h-full touch-none"
          />
        </div>

        <div className="bg-white p-4 rounded-3xl shadow-sm border-2 border-emerald-100 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={cn(
                  "w-10 h-10 rounded-full border-4 transition-transform",
                  color === c ? "scale-125 border-emerald-200" : "border-transparent"
                )}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <div className="flex justify-center gap-6 items-center">
            {SIZES.map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={cn(
                  "bg-slate-800 rounded-full transition-all",
                  size === s ? "bg-emerald-500" : "opacity-50"
                )}
                style={{ width: s * 2, height: s * 2 }}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
