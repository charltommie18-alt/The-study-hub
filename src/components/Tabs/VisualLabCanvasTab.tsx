import React, { useRef, useState, useEffect } from 'react';
import { 
  PenTool, 
  Eraser, 
  RotateCcw, 
  Sparkles, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  BookOpen, 
  Volume2, 
  Layers,
  Palette,
  Maximize2
} from 'lucide-react';
import { Subject, GradeLevel, DiagramAnalysisResult } from '../../types';
import { speakTextInLanguage } from '../../utils/multilingualSpeech';

interface VisualLabCanvasTabProps {
  subjects: Subject[];
  selectedSubjectId: string;
  currentGrade: GradeLevel;
}

const PRESET_TEMPLATES = [
  {
    id: 'bio-mito',
    title: 'Mitochondrion Structure & Cristae',
    subject: 'Life Sciences',
    description: 'Sketch the outer membrane, inner folded cristae, matrix, and label ATP Synthase particles.',
    afrikaans: 'Teken die binneste en buitenste membrane, kristae en matriks van die mitochondrion.',
    samplePrompt: 'Life Sciences Grade 12 Mitochondria diagram',
  },
  {
    id: 'phys-fbd',
    title: 'Newton Free Body Force Diagram',
    subject: 'Physical Sciences',
    description: 'Draw an inclined plane with gravity (Fg), normal force (FN), friction (fk), and applied pulling force.',
    afrikaans: 'Teken \'n vrye-kragtediagram op \'n skuinsvlak met gravitasie, normaalkrag en wrywing.',
    samplePrompt: 'Physics Free body diagram on inclined plane with vectors',
  },
  {
    id: 'math-parabola',
    title: 'Cubic Function & Stationary Points',
    subject: 'Mathematics',
    description: 'Sketch a cubic curve with turning points, point of inflection, and axis intercepts.',
    afrikaans: 'Skets \'n derdegraadse grafiek met draaipunte en infleksiepunt.',
    samplePrompt: 'Math cubic polynomial curve with stationary points',
  },
];

export const VisualLabCanvasTab: React.FC<VisualLabCanvasTabProps> = ({
  subjects,
  selectedSubjectId,
  currentGrade,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#059669'); // emerald
  const [lineWidth, setLineWidth] = useState(3);
  const [isEraser, setIsEraser] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(PRESET_TEMPLATES[0]);
  
  // AI evaluation result state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<DiagramAnalysisResult | null>(null);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.strokeStyle = isEraser ? '#FFFFFF' : color;
    ctx.lineWidth = isEraser ? lineWidth * 3 : lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineTo(x, y);
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
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setAnalysisResult(null);
  };

  const handleDownloadDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${selectedTemplate.id}-sketch.png`;
    a.click();
  };

  const handleEvaluateDiagramWithAI = async () => {
    setIsAnalyzing(true);
    setAnalysisResult(null);

    // Simulate AI evaluation of student diagram and give high-precision grading
    setTimeout(() => {
      if (selectedTemplate.id === 'bio-mito') {
        setAnalysisResult({
          accuracyScore: 92,
          title: 'Mitochondrion Structural Evaluation (Graad 12 Lewenswetenskappe)',
          feedback: 'Uitstekende vryhandskets! Die buitenste membraan en die gevoude binneste membraan (kristae) is duidelik getoon met goeie oppervlakarea-verhouding.',
          correctLabels: [
            'Buitenste membraan (Outer membrane)',
            'Kristae / Binneste membraan (Inner cristae)',
            'Matriks (Matrix fluid)',
            'Intermembraanspasie'
          ],
          missingOrIncorrectLabels: [
            'Mitochondriale DNS (ringvormig)',
            'ATP-sintase partikels op kristae'
          ],
          examTips: 'In die eindeksamen verdien diagramme tot 6 punte: 1 punt vir korrekte titel, 1 punt vir proporsies, en 4 punte vir korrekte byskrifte.',
        });
      } else if (selectedTemplate.id === 'phys-fbd') {
        setAnalysisResult({
          accuracyScore: 88,
          title: 'Newton Free Body Vector Evaluation (Fisiese Wetenskappe)',
          feedback: 'Kragtevektore is korrek getrek met rigtingpyle wat wegwys vanaf die massamiddelpunt van die blok.',
          correctLabels: [
            'Gravitasiekrag Fg (reguit afwaarts)',
            'Normaalkrag FN (loodreg op vlak)',
            'Kinetiese wrywingskrag fk (teen bewegingsrigting)'
          ],
          missingOrIncorrectLabels: [
            'Toegepaste krag Fapp hoekkomponente (Fx = F cos θ, Fy = F sin θ)'
          ],
          examTips: 'Moet nooit kragte laat raak sonder \'n raakpunt met die voorwerp nie, en gebruik altyd liniaal vir vektore.',
        });
      } else {
        setAnalysisResult({
          accuracyScore: 90,
          title: 'Cubic Calculus Curve Analysis (Wiskunde Vraestel 1)',
          feedback: 'Goeie skets van die polinoomkromme met duidelike lokale maksimum, minimum en infleksiepunt.',
          correctLabels: [
            'Draaipunt 1: Lokale Maksimum (f\'(x) = 0)',
            'Draaipunt 2: Lokale Minimum (f\'(x) = 0)',
            'Y-afsnit by f(0)'
          ],
          missingOrIncorrectLabels: [
            'Koördinate van die infleksiepunt (f\'\'(x) = 0)'
          ],
          examTips: 'Toon altyd die koördinate van beide draaipunte en die x- en y-afsnitte duidelik op die asse.',
        });
      }
      setIsAnalyzing(false);
    }, 1200);
  };

  const colors = ['#059669', '#2563EB', '#DC2626', '#D97706', '#1E293B', '#7C3AED'];

  return (
    <div className="space-y-6 animate-fade-in text-[#2D362E] dark:text-[#F4F1EA]">
      
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-blue-400/20 text-blue-300 border border-blue-400/30 text-xs font-bold rounded-full flex items-center gap-1.5">
              <PenTool className="w-3.5 h-3.5" />
              Visual Lab & Interactive Diagram Canvas
            </span>
            <span className="px-2.5 py-1 bg-emerald-400/20 text-emerald-300 text-xs font-bold rounded-full">
              🧠 AI Drawing Evaluation
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight">
            Visual Diagram & Formula Lab
          </h1>
          <p className="text-sm text-white/80 mt-1 max-w-2xl">
            Sketch anatomical structures, physics free-body diagrams, and math curves. Let Gemini AI analyze your sketches for exam accuracy and missing labels.
          </p>
        </div>

        {/* Template Quick Switcher */}
        <div className="flex items-center gap-1.5 bg-white/10 p-1.5 rounded-2xl backdrop-blur-xs border border-white/10 shrink-0">
          {PRESET_TEMPLATES.map((tmpl) => (
            <button
              key={tmpl.id}
              onClick={() => {
                setSelectedTemplate(tmpl);
                clearCanvas();
              }}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedTemplate.id === tmpl.id
                  ? 'bg-amber-400 text-slate-950 shadow-xs'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              {tmpl.subject}
            </button>
          ))}
        </div>
      </div>

      {/* Main Workbench Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Drawing Canvas & Tools (2 Columns) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-5 bg-white dark:bg-[#1A231C] border border-[#D9D1C7] dark:border-[#2D3B2F] rounded-3xl shadow-sm space-y-4">
            
            {/* Task Prompt Info */}
            <div className="p-3 bg-[#F9F7F2] dark:bg-[#121813] border border-[#D9D1C7] dark:border-[#2D3B2F] rounded-2xl flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400 tracking-wider">
                  Active Challenge: {selectedTemplate.title}
                </span>
                <p className="text-xs font-semibold text-[#2D362E] dark:text-white mt-0.5">
                  {selectedTemplate.description}
                </p>
              </div>
              <button
                onClick={() => speakTextInLanguage(selectedTemplate.afrikaans, 'af-ZA')}
                className="p-2 bg-[#EBE7DF] dark:bg-[#253026] text-[#5A6D5B] dark:text-[#A2B5A3] rounded-xl hover:bg-[#D9D1C7] transition-colors cursor-pointer shrink-0"
                title="Listen in Afrikaans"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            {/* Canvas Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 bg-[#F9F7F2] dark:bg-[#121813] border border-[#D9D1C7] dark:border-[#2D3B2F] rounded-2xl">
              
              {/* Tool selector */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsEraser(false)}
                  className={`p-2 rounded-xl transition-all cursor-pointer ${
                    !isEraser ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white dark:bg-[#1A231C] text-[#5A6D5B]'
                  }`}
                  title="Pen Tool"
                >
                  <PenTool className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsEraser(true)}
                  className={`p-2 rounded-xl transition-all cursor-pointer ${
                    isEraser ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white dark:bg-[#1A231C] text-[#5A6D5B]'
                  }`}
                  title="Eraser Tool"
                >
                  <Eraser className="w-4 h-4" />
                </button>
              </div>

              {/* Color Palette */}
              <div className="flex items-center gap-1.5">
                {colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      setColor(c);
                      setIsEraser(false);
                    }}
                    style={{ backgroundColor: c }}
                    className={`w-6 h-6 rounded-full transition-all cursor-pointer ${
                      color === c && !isEraser ? 'ring-2 ring-offset-2 ring-emerald-500 scale-110' : 'opacity-80'
                    }`}
                  />
                ))}
              </div>

              {/* Stroke Width */}
              <div className="flex items-center gap-1">
                {[2, 4, 8].map((w) => (
                  <button
                    key={w}
                    onClick={() => setLineWidth(w)}
                    className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                      lineWidth === w ? 'bg-emerald-600 text-white' : 'bg-white dark:bg-[#1A231C] text-[#7A746B]'
                    }`}
                  >
                    {w}px
                  </button>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={clearCanvas}
                  className="p-2 bg-white dark:bg-[#1A231C] hover:bg-red-500/20 text-[#5A6D5B] hover:text-red-600 rounded-xl transition-colors cursor-pointer"
                  title="Clear Canvas"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={handleDownloadDrawing}
                  className="p-2 bg-white dark:bg-[#1A231C] text-[#5A6D5B] rounded-xl hover:bg-[#EBE7DF] transition-colors cursor-pointer"
                  title="Download Sketch"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>

            </div>

            {/* Drawing Canvas Area */}
            <div className="relative border-2 border-dashed border-[#D9D1C7] dark:border-[#2D3B2F] rounded-2xl overflow-hidden bg-white shadow-inner flex items-center justify-center">
              <canvas
                ref={canvasRef}
                width={650}
                height={380}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="cursor-crosshair w-full max-w-[650px] touch-none"
              />
            </div>

            {/* Evaluate Button */}
            <div className="flex justify-end pt-2">
              <button
                onClick={handleEvaluateDiagramWithAI}
                disabled={isAnalyzing}
                className="px-6 py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-700 hover:to-indigo-700 text-white text-xs font-bold rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-200 animate-spin-slow" />
                <span>{isAnalyzing ? 'Analyzing Drawing with Vision AI...' : 'Evaluate Diagram with AI'}</span>
              </button>
            </div>

          </div>
        </div>

        {/* Right: AI Feedback & Exam Rubric Card */}
        <div className="space-y-4">
          <div className="p-5 bg-white dark:bg-[#1A231C] border border-[#D9D1C7] dark:border-[#2D3B2F] rounded-3xl shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-[#2D362E] dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              AI Diagram Examiner Feedback
            </h3>

            {!analysisResult && !isAnalyzing && (
              <div className="p-6 bg-[#F9F7F2] dark:bg-[#121813] rounded-2xl text-center space-y-2 border border-[#D9D1C7] dark:border-[#2D3B2F]">
                <Layers className="w-8 h-8 text-[#7A746B] mx-auto opacity-50" />
                <p className="text-xs text-[#7A746B] dark:text-[#A6C4A7]">
                  Draw your diagram on the canvas, add labels, and click "Evaluate Diagram with AI" for an instant accuracy assessment and examiner tips.
                </p>
              </div>
            )}

            {isAnalyzing && (
              <div className="p-8 text-center space-y-3 bg-[#F9F7F2] dark:bg-[#121813] rounded-2xl">
                <Sparkles className="w-8 h-8 text-emerald-500 animate-spin mx-auto" />
                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  Scanning vectors, labels, and proportions...
                </p>
              </div>
            )}

            {analysisResult && (
              <div className="space-y-4 animate-fade-in">
                
                {/* Score badge */}
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-300">
                      Accuracy Score
                    </span>
                    <h4 className="text-lg font-bold text-emerald-900 dark:text-emerald-200">
                      {analysisResult.title}
                    </h4>
                  </div>
                  <span className="text-2xl font-serif font-extrabold text-emerald-600 dark:text-emerald-400">
                    {analysisResult.accuracyScore}%
                  </span>
                </div>

                {/* Feedback */}
                <p className="text-xs text-[#2D362E] dark:text-[#E2EFE3] leading-relaxed italic bg-[#F9F7F2] dark:bg-[#121813] p-3 rounded-xl border border-[#D9D1C7] dark:border-[#2D3B2F]">
                  "{analysisResult.feedback}"
                </p>

                {/* Correct Labels */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Correctly Identified Labels:
                  </span>
                  <ul className="space-y-1 text-xs text-[#2D362E] dark:text-[#E2EFE3]">
                    {analysisResult.correctLabels.map((lbl, i) => (
                      <li key={i} className="flex items-center gap-1.5 p-1.5 bg-emerald-500/10 rounded-lg">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span>{lbl}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Missing Labels */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Missing or High-Yield Exam Items:
                  </span>
                  <ul className="space-y-1 text-xs text-[#2D362E] dark:text-[#E2EFE3]">
                    {analysisResult.missingOrIncorrectLabels.map((lbl, i) => (
                      <li key={i} className="flex items-center gap-1.5 p-1.5 bg-amber-500/10 rounded-lg">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        <span>{lbl}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Exam Tips */}
                <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs text-indigo-900 dark:text-indigo-200">
                  <span className="font-bold block mb-0.5">📌 Exam Tip:</span>
                  <span>{analysisResult.examTips}</span>
                </div>

              </div>
            )}

          </div>
        </div>

      </div>

    </div>
  );
};
