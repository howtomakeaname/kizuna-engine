
import React, { useState, useEffect, useRef } from 'react';
import { Settings, Save, X, Cpu, ChevronDown, Check, Search } from 'lucide-react';
import { TranslationType } from '../i18n/translations';
import { AppConfig, AiProvider } from '../types';
import { getStoredConfig, saveConfig } from '../services/config';

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
      <label className="block text-sm font-bold text-gray-700 mb-1">{label}</label>
      <button
        onClick={onToggle}
        className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
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
        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-100">
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
                  className="w-full pl-8 pr-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-pink-400"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          )}
          
          <div className="overflow-y-auto flex-1 p-1 custom-scrollbar">
            {searchable && searchTerm && (
                <button
                    onClick={() => onChange(searchTerm)}
                    className="w-full px-3 py-2 text-left text-sm rounded-lg hover:bg-gray-50 text-pink-600 italic flex items-center"
                >
                    <span className="truncate">Use custom: "{searchTerm}"</span>
                </button>
            )}
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => onChange(opt)}
                  className={`w-full px-3 py-2 text-left text-sm rounded-lg transition-colors flex items-center justify-between group ${
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

  useEffect(() => {
    if (isOpen) {
      const stored = getStoredConfig();
      setConfig(stored);
      setActiveProvider(stored.aiProvider);
    }
  }, [isOpen]);

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
    setOpenDropdown(null); // Close dropdown on selection
  };

  const toggleDropdown = (id: string) => {
    setOpenDropdown(prev => prev === id ? null : id);
  };

  const inputClasses = "w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 focus:bg-white focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all";

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95">
        
        {/* Header */}
        <div className="p-6 bg-gray-900 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6 text-pink-400" />
            <h2 className="text-xl font-bold">{t.config.title}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-white space-y-6">
            
            {/* Provider Selection */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">{t.config.provider}</label>
                <div className="grid grid-cols-3 gap-3">
                    {(['gemini', 'siliconflow', 'custom'] as AiProvider[]).map(provider => (
                        <button
                            key={provider}
                            onClick={() => setActiveProvider(provider)}
                            className={`py-3 px-2 rounded-xl text-sm font-bold border-2 transition-all capitalize flex flex-col items-center gap-1 ${
                                activeProvider === provider 
                                ? 'border-pink-500 bg-pink-50 text-pink-700' 
                                : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200 hover:text-gray-600'
                            }`}
                        >
                           <Cpu className={`w-5 h-5 ${activeProvider === provider ? 'text-pink-500' : 'text-current'}`} />
                           {provider}
                        </button>
                    ))}
                </div>
            </div>

            <div className="border-t border-gray-100 my-2"></div>

            {/* Gemini Config */}
            {activeProvider === 'gemini' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">{t.config.gemini.key}</label>
                        <input 
                            type="password" 
                            value={config.geminiKey}
                            onChange={(e) => updateConfig('geminiKey', e.target.value)}
                            className={inputClasses}
                            placeholder="AI..."
                        />
                        <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                            <span className="inline-block w-1 h-1 rounded-full bg-pink-500"></span>
                            {t.config.gemini.desc}
                        </p>
                    </div>
                </div>
            )}

            {/* SiliconFlow Config */}
            {activeProvider === 'siliconflow' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">{t.config.siliconflow.key}</label>
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

                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                        <span className="inline-block w-1 h-1 rounded-full bg-pink-500"></span>
                        {t.config.siliconflow.desc}
                    </p>
                </div>
            )}

            {/* Custom Config */}
            {activeProvider === 'custom' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                    <div className="bg-blue-50 text-blue-600 px-4 py-3 rounded-xl text-sm flex items-start gap-2 border border-blue-100">
                        {t.config.custom.desc}
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">{t.config.custom.textApiUrl}</label>
                            <input 
                                type="text" 
                                value={config.customApiUrl}
                                onChange={(e) => updateConfig('customApiUrl', e.target.value)}
                                className={inputClasses}
                                placeholder="http://localhost:11434/v1/chat/completions"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">{t.config.custom.textModel}</label>
                            <input 
                                type="text" 
                                value={config.customModelName}
                                onChange={(e) => updateConfig('customModelName', e.target.value)}
                                className={inputClasses}
                                placeholder="llama3"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">{t.config.custom.textApiKey}</label>
                            <input 
                                type="password" 
                                value={config.customApiKey}
                                onChange={(e) => updateConfig('customApiKey', e.target.value)}
                                className={inputClasses}
                                placeholder="Optional"
                            />
                        </div>
                        
                        <div className="border-t border-gray-100 my-2"></div>
                        
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">{t.config.custom.imageApiUrl}</label>
                            <input 
                                type="text" 
                                value={config.customImageApiUrl}
                                onChange={(e) => updateConfig('customImageApiUrl', e.target.value)}
                                className={inputClasses}
                                placeholder="http://localhost:11434/v1/images/generations"
                            />
                        </div>
                         <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">{t.config.custom.imageModel}</label>
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

        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
            <button 
                onClick={onClose} 
                className="px-5 py-2.5 text-gray-500 font-bold hover:bg-gray-200 hover:text-gray-700 rounded-xl transition-colors text-sm"
            >
                {t.config.cancel}
            </button>
            <button 
                onClick={handleSave}
                className="px-6 py-2.5 bg-gradient-to-r from-pink-600 to-rose-600 text-white font-bold rounded-xl shadow-lg shadow-pink-200 hover:shadow-pink-300 hover:-translate-y-0.5 transition-all flex items-center gap-2 text-sm"
            >
                <Save className="w-4 h-4" />
                {t.config.save}
            </button>
        </div>
      </div>
    </div>
  );
};

export default ConfigModal;
