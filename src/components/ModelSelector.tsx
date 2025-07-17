import React from 'react';
import type { GeminiModel } from '../types';
import type { ModelCapability } from '../services/GeminiService';
import GlassCard from './GlassCard';
import GlassButton from './GlassButton';

interface ModelSelectorProps {
  models: ModelCapability[];
  selectedModel: GeminiModel;
  onSelectModel: (model: GeminiModel) => void;
  isApiKeyValid: boolean | null;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({
  models,
  selectedModel,
  onSelectModel,
  isApiKeyValid
}) => {
  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold mb-4 text-white">Select AI Model</h2>
      
      {!isApiKeyValid && (
        <div className="mb-4 p-4 rounded-lg bg-red-500/20 backdrop-blur-sm border border-red-500/30">
          <p className="text-red-200">
            Please add your Google API key in Settings to use these models.
          </p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {models.map((model) => (
          <GlassCard
            key={model.name}
            className={`cursor-pointer transition-all duration-300 ${
              selectedModel === model.name
                ? 'ring-2 ring-blue-400 shadow-lg shadow-blue-500/20'
                : 'hover:shadow-md hover:shadow-blue-500/10'
            }`}
            onClick={() => onSelectModel(model.name)}
          >
            <div className="p-4">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-medium text-white">{model.displayName}</h3>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  model.speed === 'Fast' 
                    ? 'bg-green-500/20 text-green-200' 
                    : model.speed === 'Medium'
                      ? 'bg-yellow-500/20 text-yellow-200'
                      : 'bg-red-500/20 text-red-200'
                }`}>
                  {model.speed}
                </span>
              </div>
              
              <p className="text-sm text-blue-100 mt-2">{model.description}</p>
              
              <div className="mt-4">
                <div className="flex justify-between text-xs text-blue-200 mb-2">
                  <span>Max Tokens:</span>
                  <span className="font-medium">{model.maxTokens.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs text-blue-200">
                  <span>Cost per 1K tokens:</span>
                  <span className="font-medium">{model.costPer1KTokens}</span>
                </div>
              </div>
              
              <div className="mt-4">
                <h4 className="text-xs uppercase tracking-wider text-blue-300 mb-2">Best For</h4>
                <ul className="text-xs text-blue-100">
                  {model.bestFor.map((use, index) => (
                    <li key={index} className="mb-1 flex items-start">
                      <span className="mr-1 text-blue-400">•</span>
                      <span>{use}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {selectedModel === model.name && (
                <div className="mt-4">
                  <GlassButton
                    className="w-full"
                    disabled={!isApiKeyValid}
                  >
                    Selected
                  </GlassButton>
                </div>
              )}
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};

export default ModelSelector;