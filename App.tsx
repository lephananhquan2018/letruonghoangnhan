import React, { useState, useEffect, useRef } from 'react';
import { 
  Wand2, 
  Brain, 
  FileInput, 
  Copy, 
  Eye, 
  Loader2, 
  Image as ImageIcon,
  X,
  FileCode,
  Sparkles
} from 'lucide-react';
import { GenerationOptions, TabType } from './types';
import { convertImageToText, generateSimilarProblems, solveOriginalProblem, convertToLatex } from './services/geminiService';

// Fix for MathJax missing property on window
declare global {
  interface Window {
    MathJax: any;
  }
}

// -- Main App --

export default function App() {
  const [problemText, setProblemText] = useState('');
  const [imgBase64, setImgBase64] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{type: 'success' | 'error' | 'info', msg: string} | null>(null);

  const [options, setOptions] = useState<GenerationOptions>({
    numberOfProblems: 3,
    difficultyLevel: 'tương đương',
    problemType: 'tự động phát hiện',
    includeSolutions: true,
    specificRequirements: '',
    subject: 'toán'
  });

  const [outputs, setOutputs] = useState({ similar: '', solution: '' });
  const [activeTab, setActiveTab] = useState<TabType>('similar');
  const [isRendered, setIsRendered] = useState({ similar: false, solution: false });

  const outputRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // MathJax Effect
  useEffect(() => {
    if ((isRendered.similar && activeTab === 'similar') || (isRendered.solution && activeTab === 'solution')) {
      if (window.MathJax && window.MathJax.typesetPromise && outputRef.current) {
        window.MathJax.typesetPromise([outputRef.current]).catch((err: any) => console.error(err));
      }
    }
  }, [outputs, activeTab, isRendered]);

  const showToast = (type: 'success' | 'error' | 'info', msg: string) => {
    setStatusMsg({ type, msg });
    setTimeout(() => setStatusMsg(null), 5000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      setImgBase64(evt.target?.result as string);
      showToast('info', 'Đã tải ảnh. Bấm OCR để quét chữ hoặc tạo bài trực tiếp.');
    };
    reader.readAsDataURL(file);
  };

  const handleOCR = async () => {
    if (!imgBase64) {
      showToast('error', 'Vui lòng chọn ảnh trước.');
      return;
    }

    setIsProcessing(true);
    setStatusMsg({ type: 'info', msg: 'Đang đọc ảnh và nhận diện TikZ...' });
    
    try {
      const text = await convertImageToText(imgBase64);
      setProblemText(text);
      showToast('success', 'Đã chuyển ảnh thành văn bản!');
    } catch (error: any) {
      showToast('error', error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerate = async () => {
    if (!problemText && !imgBase64) {
      showToast('error', 'Vui lòng nhập đề bài hoặc tải ảnh.');
      return;
    }

    setIsProcessing(true);
    setStatusMsg({ type: 'info', msg: 'Đang tạo bài tương tự...' });
    setActiveTab('similar');

    try {
      let finalText = problemText;
      if (!finalText && imgBase64) {
         finalText = await convertImageToText(imgBase64);
         setProblemText(finalText); // Save OCR result
      }

      const res = await generateSimilarProblems(finalText, options);
      setOutputs(prev => ({ ...prev, similar: res }));
      setIsRendered(prev => ({ ...prev, similar: false })); // Reset render to raw
      showToast('success', 'Hoàn tất!');
    } catch (error: any) {
      showToast('error', error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSolve = async () => {
    if (!problemText && !imgBase64) {
      showToast('error', 'Vui lòng nhập đề bài.');
      return;
    }

    setIsProcessing(true);
    setStatusMsg({ type: 'info', msg: 'Đang giải bài...' });
    setActiveTab('solution');

    try {
      let finalText = problemText;
      if (!finalText && imgBase64) {
         finalText = await convertImageToText(imgBase64);
         setProblemText(finalText);
      }

      const res = await solveOriginalProblem(finalText);
      setOutputs(prev => ({ ...prev, solution: res }));
      setIsRendered(prev => ({ ...prev, solution: false }));
      showToast('success', 'Đã có lời giải!');
    } catch (error: any) {
      showToast('error', error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLatexConvert = async () => {
    const currentContent = activeTab === 'similar' ? outputs.similar : outputs.solution;
    if (!currentContent) return;
    
    setIsProcessing(true);
    try {
      const latex = await convertToLatex(currentContent, true);
      const w = window.open('', '_blank');
      if (w) {
        w.document.write(`<pre style="padding:20px;font-family:monospace;white-space:pre-wrap;">${latex.replace(/</g, '&lt;')}</pre>`);
        w.document.close();
      }
      showToast('success', 'Đã chuyển sang LaTeX (ex_test)');
    } catch (error: any) {
      showToast('error', error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleRender = () => {
    setIsRendered(prev => ({ ...prev, [activeTab]: !prev[activeTab] }));
  };

  const copyToClipboard = () => {
    const txt = activeTab === 'similar' ? outputs.similar : outputs.solution;
    navigator.clipboard.writeText(txt);
    showToast('success', 'Đã sao chép vào bộ nhớ tạm');
  };

  const renderContent = () => {
    const content = activeTab === 'similar' ? outputs.similar : outputs.solution;
    const isR = activeTab === 'similar' ? isRendered.similar : isRendered.solution;

    if (!content) return <div className="text-slate-400 italic text-center mt-10">Kết quả sẽ hiển thị ở đây...</div>;

    if (!isR) {
      return <div className="whitespace-pre-wrap font-mono text-sm text-slate-700">{content}</div>;
    }

    // Prepare content for MathJax and TikZ highlighting
    let html = content
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/(\$\$[\s\S]+?\$\$)/g, (match) => match) // Keep display math
      .replace(/(\$[^\n$]+\$)/g, (match) => match); // Keep inline math

    // Wrap tikz environments
    html = html.replace(
      /(\\begin\{tikzpicture\}[\s\S]*?\\end\{tikzpicture\})/g, 
      '<div class="my-4 p-4 bg-rose-50 border-l-4 border-rose-500 rounded-r font-mono text-xs overflow-x-auto text-rose-800">$1</div>'
    );

    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 pb-20">
      
      {/* Header */}
      <header className="bg-gradient-to-br from-teal-600 to-teal-500 text-white rounded-3xl p-8 mb-6 shadow-xl shadow-teal-600/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold mb-2 tracking-tight flex items-center gap-3">
              AIOMT Premium <span className="opacity-70 font-light">|</span> <span className="text-teal-100">Bài Tập & TikZ</span>
            </h1>
            <p className="text-teal-50 opacity-90 text-sm md:text-base max-w-2xl mt-2">
              Tạo bài tập tương tự (Text/Ảnh), hỗ trợ công thức LaTeX và hình vẽ TikZ tự động.
            </p>
          </div>
          
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/40 font-medium text-sm">
            <Sparkles size={16} />
            <span>Pro Version</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Input */}
        <div className="space-y-6">
          
          {/* Input Card */}
          <div className="bg-white/70 backdrop-blur-md border border-white/50 rounded-2xl p-5 shadow-lg shadow-teal-900/5">
            <div className="flex justify-between items-center mb-3">
              <label className="font-bold text-slate-700 flex items-center gap-2">
                <FileInput size={18} className="text-teal-600"/> Nội dung câu hỏi
              </label>
              {imgBase64 && (
                <button 
                   onClick={handleOCR}
                   disabled={isProcessing}
                   className="text-xs bg-teal-100 text-teal-700 px-3 py-1.5 rounded-lg hover:bg-teal-200 font-bold flex items-center gap-1 transition"
                >
                  <ImageIcon size={14}/> Quét OCR
                </button>
              )}
            </div>
            
            <textarea
              className="w-full h-40 p-3 rounded-xl border-slate-200 bg-white/80 focus:ring-2 focus:ring-teal-400 focus:outline-none transition resize-y text-sm shadow-inner"
              placeholder="Dán đề bài vào đây (hỗ trợ LaTeX)... Ví dụ: Cho tam giác ABC vuông tại A..."
              value={problemText}
              onChange={(e) => setProblemText(e.target.value)}
            ></textarea>

            {/* Image Upload Area */}
            <div 
              className={`mt-4 border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${imgBase64 ? 'border-teal-400 bg-teal-50/50' : 'border-slate-300 hover:border-teal-400 hover:bg-white/60'}`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleImageUpload}
              />
              {imgBase64 ? (
                <div className="relative inline-block group">
                  <img src={imgBase64} alt="Preview" className="h-32 rounded-lg shadow-md object-contain mx-auto" />
                  <div className="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <span className="text-white text-xs font-bold bg-black/50 px-2 py-1 rounded">Đổi ảnh</span>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setImgBase64(null); }}
                    className="absolute -top-2 -right-2 bg-rose-500 text-white p-1 rounded-full shadow-md hover:bg-rose-600"
                  >
                    <X size={12}/>
                  </button>
                </div>
              ) : (
                <div className="text-slate-500">
                  <ImageIcon className="mx-auto mb-2 text-teal-400" size={32} />
                  <p className="text-sm font-medium">Bấm để tải ảnh hoặc kéo thả vào đây</p>
                  <p className="text-xs opacity-70 mt-1">Hỗ trợ nhận diện hình vẽ TikZ</p>
                </div>
              )}
            </div>
          </div>

          {/* Settings Card */}
          <div className="bg-white/70 backdrop-blur-md border border-white/50 rounded-2xl p-5 shadow-lg shadow-teal-900/5">
             <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Số lượng</label>
                  <input 
                    type="number" min="1" max="20"
                    value={options.numberOfProblems}
                    onChange={(e) => setOptions({...options, numberOfProblems: parseInt(e.target.value) || 1})}
                    className="w-full p-2 rounded-lg border-slate-200 bg-white focus:ring-2 focus:ring-teal-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Độ khó</label>
                  <select 
                    value={options.difficultyLevel}
                    onChange={(e) => setOptions({...options, difficultyLevel: e.target.value})}
                    className="w-full p-2 rounded-lg border-slate-200 bg-white focus:ring-2 focus:ring-teal-400 outline-none"
                  >
                    <option value="dễ hơn">Dễ hơn</option>
                    <option value="tương đương">Tương đương</option>
                    <option value="khó hơn">Khó hơn</option>
                    <option value="nâng cao">Nâng cao</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Dạng bài</label>
                  <select 
                    value={options.problemType}
                    onChange={(e) => setOptions({...options, problemType: e.target.value})}
                    className="w-full p-2 rounded-lg border-slate-200 bg-white focus:ring-2 focus:ring-teal-400 outline-none"
                  >
                    <option value="tự động phát hiện">Tự động</option>
                    <option value="trắc nghiệm">Trắc nghiệm</option>
                    <option value="tự luận">Tự luận</option>
                    <option value="hình học">Hình học (TikZ)</option>
                  </select>
                </div>
                <div className="flex items-center pt-5">
                   <label className="flex items-center gap-2 cursor-pointer select-none">
                     <div className="relative">
                       <input 
                         type="checkbox" 
                         className="sr-only peer" 
                         checked={options.includeSolutions}
                         onChange={(e) => setOptions({...options, includeSolutions: e.target.checked})}
                       />
                       <div className="w-10 h-6 bg-slate-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
                     </div>
                     <span className="text-sm font-semibold text-slate-600">Kèm lời giải</span>
                   </label>
                </div>
                <div className="col-span-2">
                   <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Yêu cầu thêm</label>
                   <input 
                    type="text" 
                    placeholder="Ví dụ: Thay đổi số liệu, đổi bối cảnh thực tế..."
                    value={options.specificRequirements}
                    onChange={(e) => setOptions({...options, specificRequirements: e.target.value})}
                    className="w-full p-2 rounded-lg border-slate-200 bg-white focus:ring-2 focus:ring-teal-400 outline-none text-sm"
                  />
                </div>
             </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
             <button 
                onClick={handleSolve}
                disabled={isProcessing}
                className="flex-1 bg-white border-2 border-teal-600 text-teal-700 font-bold py-3 rounded-xl hover:bg-teal-50 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
             >
                {isProcessing && activeTab === 'solution' ? <Loader2 className="animate-spin"/> : <Brain size={20}/>}
                Giải bài gốc
             </button>
             <button 
                onClick={handleGenerate}
                disabled={isProcessing}
                className="flex-[2] bg-gradient-to-r from-teal-600 to-teal-500 text-white font-bold py-3 rounded-xl hover:shadow-lg hover:shadow-teal-500/30 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
             >
                {isProcessing && activeTab === 'similar' ? <Loader2 className="animate-spin"/> : <Wand2 size={20}/>}
                Tạo bài tương tự
             </button>
          </div>
          
          {/* Status Message */}
          {statusMsg && (
            <div className={`p-3 rounded-lg flex items-center gap-2 text-sm font-medium animate-in fade-in slide-in-from-top-2 ${
              statusMsg.type === 'success' ? 'bg-green-100 text-green-700 border border-green-200' :
              statusMsg.type === 'error' ? 'bg-red-100 text-red-700 border border-red-200' :
              'bg-blue-100 text-blue-700 border border-blue-200'
            }`}>
               <div className={`w-2 h-2 rounded-full ${
                  statusMsg.type === 'success' ? 'bg-green-500' :
                  statusMsg.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
               }`}></div>
               {statusMsg.msg}
            </div>
          )}

        </div>

        {/* Right Column: Output */}
        <div className="flex flex-col h-full min-h-[500px]">
           {/* Tabs */}
           <div className="flex gap-2 mb-2 p-1 bg-white/40 backdrop-blur-sm rounded-xl w-fit">
              <button 
                onClick={() => setActiveTab('similar')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'similar' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-600 hover:bg-white/50'}`}
              >
                Bài tương tự
              </button>
              <button 
                onClick={() => setActiveTab('solution')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'solution' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-600 hover:bg-white/50'}`}
              >
                Lời giải gốc
              </button>
           </div>

           {/* Content Area */}
           <div className="flex-1 bg-white/80 backdrop-blur-md rounded-2xl border border-white/60 shadow-xl shadow-teal-900/5 flex flex-col overflow-hidden">
              <div className="p-3 border-b border-slate-100 flex justify-between items-center bg-white/50">
                 <span className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-2">Kết quả</span>
                 <div className="flex gap-1">
                    <button onClick={toggleRender} className="p-2 text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition" title="Xem trước (Render)">
                       <Eye size={18}/>
                    </button>
                    <button onClick={copyToClipboard} className="p-2 text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition" title="Sao chép">
                       <Copy size={18}/>
                    </button>
                    <button onClick={handleLatexConvert} className="p-2 text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition" title="Chuyển sang LaTeX">
                       <FileCode size={18}/>
                    </button>
                 </div>
              </div>
              <div 
                ref={outputRef}
                className="flex-1 p-6 overflow-y-auto text-slate-800"
              >
                 {renderContent()}
              </div>
           </div>
           
           <div className="text-right text-xs text-slate-500 mt-2 font-medium">
             Mẹo: Dùng <kbd className="bg-white px-1 rounded border">Ctrl</kbd> + <kbd className="bg-white px-1 rounded border">Enter</kbd> để tạo nhanh.
           </div>
        </div>

      </div>
    </div>
  );
}