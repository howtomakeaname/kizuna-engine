
import React, { useState, useEffect, useRef } from 'react';
import { Settings, Save, X, Cpu, ChevronDown, Check, Search, Code, RotateCcw, History } from 'lucide-react';
import { TranslationType } from '../i18n/translations';
import { AppConfig, AiProvider } from '../types';
import { getStoredConfig, saveConfig } from '../services/config';
import { PromptType, getActivePromptTemplate, saveCustomPrompt, getPromptHistoryList, DEFAULT_PROMPTS } from '../services/promptService';
import { SavedPrompt } from '../services/db';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  t: TranslationType;
}

const SF_TEXT_MODELS = [
"deepseek-ai/DeepSeek-V3",
"deepseek-ai/DeepSeek-R1",
"Pro/deepseek-ai/DeepSeek-V3",
"Pro/deepseek-ai/DeepSeek-R1",
"deepseek-ai/DeepSeek-V2.5",
"Qwen/Qwen2.5-72B-Instruct",
"Qwen/Qwen2.5-32B-Instruct",
"Qwen/Qwen2.5-14B-Instruct",
"Qwen/Qwen2.5-Coder-32B-Instruct",
"Qwen/QwQ-32B",
"THUDM/glm-4-9b-chat",
"internlm/internlm2_5-7b-chat",
"deepseek-ai/DeepSeek-V3.2-Exp",
"Pro/deepseek-ai/DeepSeek-V3.2-Exp",
"inclusionAI/Ling-1T",
"zai-org/GLM-4.6",
"moonshotai/Kimi-K2-Instruct-0905",
"Pro/deepseek-ai/DeepSeek-V3.1-Terminus",
"deepseek-ai/DeepSeek-V3.1-Terminus",
"Qwen/Qwen3-Next-80B-A3B-Instruct",
"Qwen/Qwen3-Next-80B-A3B-Thinking",
"inclusionAI/Ring-flash-2.0",
"inclusionAI/Ling-flash-2.0",
"inclusionAI/Ling-mini-2.0",
"ByteDance-Seed/Seed-OSS-36B-Instruct",
"stepfun-ai/step3",
"Qwen/Qwen3-Coder-30B-A3B-Instruct",
"Qwen/Qwen3-Coder-480B-A35B-Instruct",
"Qwen/Qwen3-30B-A3B-Thinking-2507",
"Qwen/Qwen3-30B-A3B-Instruct-2507",
"Qwen/Qwen3-235B-A22B-Thinking-2507",
"Qwen/Qwen3-235B-A22B-Instruct-2507",
"zai-org/GLM-4.5-Air",
"zai-org/GLM-4.5",
"baidu/ERNIE-4.5-300B-A47B",
"ascend-tribe/pangu-pro-moe",
"tencent/Hunyuan-A13B-Instruct",
"MiniMaxAI/MiniMax-M1-80k",
"Tongyi-Zhiwen/QwenLong-L1-32B",
"Qwen/Qwen3-30B-A3B",
"Qwen/Qwen3-32B",
"Qwen/Qwen3-14B",
"Qwen/Qwen3-8B",
"Qwen/Qwen3-235B-A22B",
"THUDM/GLM-Z1-32B-0414",
"THUDM/GLM-4-32B-0414",
"THUDM/GLM-Z1-Rumination-32B-0414",
"THUDM/GLM-4-9B-0414",
"deepseek-ai/DeepSeek-R1-0528-Qwen3-8B",
"deepseek-ai/DeepSeek-R1-Distill-Qwen-32B",
"deepseek-ai/DeepSeek-R1-Distill-Qwen-14B",
"deepseek-ai/DeepSeek-R1-Distill-Qwen-7B",
"Pro/deepseek-ai/DeepSeek-R1-Distill-Qwen-7B",
"Qwen/Qwen2.5-72B-Instruct-128K",
"Qwen/Qwen2.5-7B-Instruct",
"Qwen/Qwen2.5-Coder-7B-Instruct",
"Qwen/Qwen2-7B-Instruct",
"Pro/Qwen/Qwen2.5-7B-Instruct",
"Pro/Qwen/Qwen2-7B-Instruct",
"Pro/THUDM/glm-4-9b-chat"
];

const SF_IMAGE_MODELS = [
  "Qwen/Qwen-Image",
  "Kwai-Kolors/Kolors"
];

const CustomSelect = ({ 
  label, 
  value, 
  onChange, 
  options, 
  placeholder = "Select...",
  searchable = false,
  isOpen,
  onToggle
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder?: string;
  searchable?: boolean;
  isOpen: boolean;
  onToggle: () => void;
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && searchable && inputRef.current) {
      inputRef.current.focus();
    }
    if (!isOpen) {
      setSearchTerm("");
    }
  }, [isOpen, searchable]);

  const filteredOptions = options.filter(opt => 
    opt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative" ref={wrapperRef}>
      <label className="block text-xs md:text-sm font-bold text-gray-700 mb-1">{label}</label>
      <button
        onClick={onToggle}
        className={`w-full p-2 md:p-3 rounded-xl border text-left flex items-center justify-between transition-all text-sm ${
          isOpen 
            ? 'border-pink-500 bg-white ring-2 ring-pink-100' 
            : 'border-gray-200 bg-gray-50 hover:bg-white hover:border-gray-300'
        }`}
      >
        <span className={`truncate ${!value ? 'text-gray-400' : 'text-gray-800'}`}>
          {value || placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180 text-pink-500' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-40 md:max-h-60 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-100">
          {searchable && (
            <div className="p-2 border-b border-gray-100 bg-gray-50 sticky top-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search..."
                  className="w-full pl-8 pr-3 py-1 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-pink-400"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          )}
          
          <div className="overflow-y-auto flex-1 p-1 custom-scrollbar">
            {searchable && searchTerm && (
                <button
                    onClick={() => onChange(searchTerm)}
                    className="w-full px-2 py-2 text-left text-xs rounded-lg hover:bg-gray-50 text-pink-600 italic flex items-center"
                >
                    <span className="truncate">Use custom: "{searchTerm}"</span>
                </button>
            )}
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => onChange(opt)}
                  className={`w-full px-2 py-1.5 text-left text-xs md:text-sm rounded-lg transition-colors flex items-center justify-between group ${
                    value === opt 
                      ? 'bg-pink-50 text-pink-700 font-medium' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="truncate">{opt}</span>
                  {value === opt && <Check className="w-3 h-3 text-pink-500" />}
                </button>
              ))
            ) : (
              <div className="px-3 py-4 text-center text-xs text-gray-400">
                No matching models found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const ConfigModal: React.FC<ConfigModalProps> = ({ isOpen, onClose, onSave, t }) => {
  const [config, setConfig] = useState<AppConfig>(getStoredConfig());
  const [activeProvider, setActiveProvider] = useState<AiProvider>('gemini');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'general' | 'dev'>('general');

  // Developer Mode State
  const [isDevMode, setIsDevMode] = useState(false);
  const [selectedPromptType, setSelectedPromptType] = useState<PromptType>('initial');
  const [promptContent, setPromptContent] = useState("");
  const [promptHistory, setPromptHistory] = useState<SavedPrompt[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const stored = getStoredConfig();
      setConfig(stored);
      setActiveProvider(stored.aiProvider);
      
      // Reset dev state
      setActiveTab('general');
      setIsDevMode(false);
      setToastMessage(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isDevMode) {
        loadPromptData(selectedPromptType);
    }
  }, [selectedPromptType, isDevMode]);

  const loadPromptData = async (type: PromptType) => {
      const template = await getActivePromptTemplate(type);
      setPromptContent(template);
      const history = await getPromptHistoryList(type);
      setPromptHistory(history);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (openDropdown && !(e.target as Element).closest('.relative')) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdown]);

  if (!isOpen) return null;

  const handleSave = () => {
    const newConfig = { ...config, aiProvider: activeProvider };
    saveConfig(newConfig);
    onSave();
  };

  const updateConfig = (key: keyof AppConfig, value: string) => {
    setConfig(prev => ({ ...prev, [key]: value }));
    setOpenDropdown(null);
  };

  const toggleDropdown = (id: string) => {
    setOpenDropdown(prev => prev === id ? null : id);
  };

  const handleSavePrompt = async () => {
      await saveCustomPrompt(selectedPromptType, promptContent);
      await loadPromptData(selectedPromptType);
      showToast(t.config.dev.savedToast);
  };

  const handleRestorePrompt = (content: string) => {
      setPromptContent(content);
      setShowHistory(false);
      showToast(t.config.dev.restoredToast);
  };

  const handleResetPrompt = () => {
      setPromptContent(DEFAULT_PROMPTS[selectedPromptType]);
  };

  const showToast = (msg: string) => {
      setToastMessage(msg);
      setTimeout(() => setToastMessage(null), 3000);
  };

  const inputClasses = "w-full p-2 md:p-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 focus:bg-white focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all text-sm";

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-3xl rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[95vh] md:max-h-[90vh] animate-in zoom-in-95">
        
        {/* Header */}
        <div className="p-3 md:p-6 bg-gray-900 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-2 md:gap-3">
            <Settings className="w-5 h-5 md:w-6 md:h-6 text-pink-400" />
            <h2 className="text-base md:text-xl font-bold">{t.config.title}</h2>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
             {/* Tab Switcher */}
             <div className="flex bg-gray-800 rounded-lg p-0.5 md:p-1">
                 <button 
                    onClick={() => setActiveTab('general')}
                    className={`px-3 py-1 md:px-4 md:py-1.5 rounded-md text-xs md:text-sm font-bold transition-all ${activeTab === 'general' ? 'bg-gray-700 text-white shadow' : 'text-gray-400 hover:text-gray-200'}`}
                 >
                     General
                 </button>
                 <button 
                    onClick={() => setActiveTab('dev')}
                    className={`px-3 py-1 md:px-4 md:py-1.5 rounded-md text-xs md:text-sm font-bold transition-all flex items-center gap-1 md:gap-2 ${activeTab === 'dev' ? 'bg-pink-900/50 text-pink-200 shadow' : 'text-gray-400 hover:text-gray-200'}`}
                 >
                     <Code className="w-3 h-3" />
                     Dev
                 </button>
             </div>
             <button onClick={onClose} className="p-1.5 md:p-2 hover:bg-white/20 rounded-full transition-colors">
                <X className="w-5 h-5" />
             </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-white space-y-4 md:space-y-6 custom-scrollbar">
            
            {activeTab === 'general' && (
                <>
                    {/* Provider Selection */}
                    <div>
                        <label className="block text-xs md:text-sm font-bold text-gray-700 mb-2">{t.config.provider}</label>
                        <div className="grid grid-cols-3 gap-2 md:gap-3">
                            {(['gemini', 'siliconflow', 'custom'] as AiProvider[]).map(provider => (
                                <button
                                    key={provider}
                                    onClick={() => setActiveProvider(provider)}
                                    className={`py-2 md:py-3 px-2 rounded-xl text-xs md:text-sm font-bold border-2 transition-all capitalize flex flex-col items-center gap-1 ${
                                        activeProvider === provider 
                                        ? 'border-pink-500 bg-pink-50 text-pink-700' 
                                        : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200 hover:text-gray-600'
                                    }`}
                                >
                                <Cpu className={`w-4 h-4 md:w-5 md:h-5 ${activeProvider === provider ? 'text-pink-500' : 'text-current'}`} />
                                {provider}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="border-t border-gray-100 my-1 md:my-2"></div>

                    {/* Gemini Config */}
                    {activeProvider === 'gemini' && (
                        <div className="space-y-3 md:space-y-4 animate-in fade-in slide-in-from-bottom-2">
                            <div>
                                <label className="block text-xs md:text-sm font-bold text-gray-700 mb-1">{t.config.gemini.key}</label>
                                <input 
                                    type="password" 
                                    value={config.geminiKey}
                                    onChange={(e) => updateConfig('geminiKey', e.target.value)}
                                    className={inputClasses}
                                    placeholder="AI..."
                                />
                                <p className="text-[10px] md:text-xs text-gray-400 mt-1 md:mt-2 flex items-center gap-1">
                                    <span className="inline-block w-1 h-1 rounded-full bg-pink-500"></span>
                                    {t.config.gemini.desc}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* SiliconFlow Config */}
                    {activeProvider === 'siliconflow' && (
                        <div className="space-y-3 md:space-y-4 animate-in fade-in slide-in-from-bottom-2">
                            <div>
                                <label className="block text-xs md:text-sm font-bold text-gray-700 mb-1">{t.config.siliconflow.key}</label>
                                <input 
                                    type="password" 
                                    value={config.siliconFlowKey}
                                    onChange={(e) => updateConfig('siliconFlowKey', e.target.value)}
                                    className={inputClasses}
                                    placeholder="sk-..."
                                />
                            </div>

                            <CustomSelect
                                label={t.config.siliconflow.model}
                                value={config.siliconFlowModel}
                                options={SF_TEXT_MODELS}
                                onChange={(val) => updateConfig('siliconFlowModel', val)}
                                searchable={true}
                                isOpen={openDropdown === 'sf_text'}
                                onToggle={() => toggleDropdown('sf_text')}
                            />

                            <CustomSelect
                                label={t.config.siliconflow.imageModel}
                                value={config.siliconFlowImageModel}
                                options={SF_IMAGE_MODELS}
                                onChange={(val) => updateConfig('siliconFlowImageModel', val)}
                                isOpen={openDropdown === 'sf_image'}
                                onToggle={() => toggleDropdown('sf_image')}
                            />

                            <p className="text-[10px] md:text-xs text-gray-400 mt-1 flex items-center gap-1">
                                <span className="inline-block w-1 h-1 rounded-full bg-pink-500"></span>
                                {t.config.siliconflow.desc}
                            </p>
                        </div>
                    )}

                    {/* Custom Config */}
                    {activeProvider === 'custom' && (
                        <div className="space-y-3 md:space-y-4 animate-in fade-in slide-in-from-bottom-2">
                            <div className="bg-blue-50 text-blue-600 px-3 py-2 md:px-4 md:py-3 rounded-xl text-xs md:text-sm flex items-start gap-2 border border-blue-100">
                                {t.config.custom.desc}
                            </div>

                            <div className="grid grid-cols-1 gap-3 md:gap-4">
                                <div>
                                    <label className="block text-xs md:text-sm font-bold text-gray-700 mb-1">{t.config.custom.textApiUrl}</label>
                                    <input 
                                        type="text" 
                                        value={config.customApiUrl}
                                        onChange={(e) => updateConfig('customApiUrl', e.target.value)}
                                        className={inputClasses}
                                        placeholder="http://localhost:11434/v1/chat/completions"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs md:text-sm font-bold text-gray-700 mb-1">{t.config.custom.textModel}</label>
                                    <input 
                                        type="text" 
                                        value={config.customModelName}
                                        onChange={(e) => updateConfig('customModelName', e.target.value)}
                                        className={inputClasses}
                                        placeholder="llama3"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs md:text-sm font-bold text-gray-700 mb-1">{t.config.custom.textApiKey}</label>
                                    <input 
                                        type="password" 
                                        value={config.customApiKey}
                                        onChange={(e) => updateConfig('customApiKey', e.target.value)}
                                        className={inputClasses}
                                        placeholder="Optional"
                                    />
                                </div>
                                
                                <div className="border-t border-gray-100 my-1 md:my-2"></div>
                                
                                <div>
                                    <label className="block text-xs md:text-sm font-bold text-gray-700 mb-1">{t.config.custom.imageApiUrl}</label>
                                    <input 
                                        type="text" 
                                        value={config.customImageApiUrl}
                                        onChange={(e) => updateConfig('customImageApiUrl', e.target.value)}
                                        className={inputClasses}
                                        placeholder="http://localhost:11434/v1/images/generations"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs md:text-sm font-bold text-gray-700 mb-1">{t.config.custom.imageModel}</label>
                                    <input 
                                        type="text" 
                                        value={config.customImageModelName}
                                        onChange={(e) => updateConfig('customImageModelName', e.target.value)}
                                        className={inputClasses}
                                        placeholder="dall-e-3 / stable-diffusion-xl"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

            {activeTab === 'dev' && (
                <div className="animate-in fade-in">
                    {/* Dev Mode Toggle */}
                    {!isDevMode ? (
                        <div className="flex flex-col items-center justify-center py-6 md:py-10 text-center space-y-4">
                             <div className="bg-gray-100 p-4 rounded-full">
                                <Code className="w-8 h-8 text-gray-500" />
                             </div>
                             <h3 className="text-base md:text-lg font-bold text-gray-800">{t.config.dev.title}</h3>
                             <p className="text-gray-500 max-w-xs text-xs md:text-sm">{t.config.dev.warning}</p>
                             <button 
                                onClick={() => setIsDevMode(true)}
                                className="bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-black transition-colors font-bold text-sm"
                             >
                                {t.config.dev.enable}
                             </button>
                        </div>
                    ) : (
                        <div className="space-y-3 md:space-y-4">
                             <div className="bg-amber-50 text-amber-700 px-3 py-2 rounded-lg text-[10px] md:text-xs border border-amber-100 flex items-center gap-2">
                                <span className="font-bold">⚠</span> {t.config.dev.warning}
                             </div>

                             {/* Prompt Type Selector */}
                             <div>
                                 <label className="block text-[10px] md:text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">{t.config.dev.promptType}</label>
                                 <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                                     {(['initial', 'next', 'secret', 'image'] as PromptType[]).map(type => (
                                         <button
                                            key={type}
                                            onClick={() => setSelectedPromptType(type)}
                                            className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-bold whitespace-nowrap transition-all ${
                                                selectedPromptType === type
                                                ? 'bg-pink-100 text-pink-700 border border-pink-200'
                                                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                                            }`}
                                         >
                                             {t.config.dev.types[type]}
                                         </button>
                                     ))}
                                 </div>
                             </div>

                             {/* Editor */}
                             <div className="relative">
                                 <label className="flex justify-between items-center text-[10px] md:text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">
                                     <span>{t.config.dev.editor}</span>
                                     <div className="flex gap-2">
                                         <button 
                                            onClick={handleResetPrompt}
                                            className="text-gray-400 hover:text-gray-600 flex items-center gap-1"
                                            title={t.config.dev.reset}
                                         >
                                            <RotateCcw className="w-3 h-3" />
                                            Reset
                                         </button>
                                         <button 
                                            onClick={() => setShowHistory(!showHistory)}
                                            className={`flex items-center gap-1 ${showHistory ? 'text-pink-600' : 'text-gray-400 hover:text-gray-600'}`}
                                         >
                                             <History className="w-3 h-3" />
                                             {t.config.dev.history}
                                         </button>
                                     </div>
                                 </label>
                                 
                                 <div className="relative">
                                    <textarea
                                        value={promptContent}
                                        onChange={(e) => setPromptContent(e.target.value)}
                                        className="w-full h-32 md:h-64 p-3 rounded-xl border border-gray-200 bg-gray-900 text-gray-100 font-mono text-[10px] md:text-xs leading-relaxed focus:ring-2 focus:ring-pink-400 outline-none resize-y"
                                        spellCheck={false}
                                    />
                                    
                                    {/* History Overlay */}
                                    {showHistory && (
                                        <div className="absolute top-0 right-0 bottom-0 w-64 bg-white border-l border-gray-200 shadow-xl z-10 flex flex-col animate-in slide-in-from-right-10">
                                            <div className="p-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                                                <span className="text-xs font-bold text-gray-600">Version History</span>
                                                <button onClick={() => setShowHistory(false)}><X className="w-4 h-4 text-gray-400" /></button>
                                            </div>
                                            <div className="flex-1 overflow-y-auto">
                                                {promptHistory.length === 0 ? (
                                                    <div className="p-4 text-center text-xs text-gray-400">No history found.</div>
                                                ) : (
                                                    promptHistory.map((p, idx) => (
                                                        <button
                                                            key={idx}
                                                            onClick={() => handleRestorePrompt(p.content)}
                                                            className="w-full text-left p-3 border-b border-gray-50 hover:bg-pink-50 transition-colors group"
                                                        >
                                                            <div className="text-xs font-bold text-gray-700">{new Date(p.timestamp).toLocaleString()}</div>
                                                            <div className="text-[10px] text-gray-400 mt-1 line-clamp-2 font-mono bg-gray-100 p-1 rounded group-hover:bg-white">
                                                                {p.content.substring(0, 50)}...
                                                            </div>
                                                        </button>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    )}
                                 </div>

                                 <div className="flex justify-end mt-2">
                                     <button
                                        onClick={handleSavePrompt}
                                        className="bg-pink-600 text-white px-3 py-1.5 rounded-lg font-bold text-xs md:text-sm flex items-center gap-2 hover:bg-pink-700 transition-colors shadow-md"
                                     >
                                         <Save className="w-4 h-4" />
                                         {t.config.dev.save}
                                     </button>
                                 </div>
                             </div>
                        </div>
                    )}
                </div>
            )}

        </div>

        {/* Footer - Only show general Save button if in General tab */}
        {activeTab === 'general' && (
            <div className="p-3 md:p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-2 md:gap-3 shrink-0">
                <button 
                    onClick={onClose} 
                    className="px-4 py-2 text-gray-500 font-bold hover:bg-gray-200 hover:text-gray-700 rounded-xl transition-colors text-xs md:text-sm"
                >
                    {t.config.cancel}
                </button>
                <button 
                    onClick={handleSave}
                    className="px-5 py-2 bg-gradient-to-r from-pink-600 to-rose-600 text-white font-bold rounded-xl shadow-lg shadow-pink-200 hover:shadow-pink-300 hover:-translate-y-0.5 transition-all flex items-center gap-2 text-xs md:text-sm"
                >
                    <Save className="w-4 h-4" />
                    {t.config.save}
                </button>
            </div>
        )}

        {/* Toast Notification */}
        {toastMessage && (
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-full shadow-lg text-sm font-bold animate-in slide-in-from-bottom-4 fade-in">
                {toastMessage}
            </div>
        )}
      </div>
    </div>
  );
};

export default ConfigModal;
