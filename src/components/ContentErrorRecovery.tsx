import React, { useState, useEffect } from 'react';
import { ApiError } from '../utils/apiErrorHandling';
import { 
  getValidationErrors, 
  getPartialContent, 
  getFramingConflict, 
  getCitationErrors,
  clearPartialContent,
  clearFramingConflict,
  clearCitationErrors,
  ValidationErrorDetails,
  FramingConflict,
  CitationError
} from '../utils/contentErrorRecovery';
import GlassCard from './GlassCard';
import GlassButton from './GlassButton';

interface ContentErrorRecoveryProps {
  error?: ApiError;
  onRetry?: () => void;
  onResumePartial?: (content: string) => void;
  onResolveFramingConflict?: (selectedFrame: string) => void;
  onFixCitation?: (fixedCitation: any) => void;
}

/**
 * Component for displaying content generation errors and recovery options
 */
const ContentErrorRecovery: React.FC<ContentErrorRecoveryProps> = ({
  error,
  onRetry,
  onResumePartial,
  onResolveFramingConflict,
  onFixCitation
}) => {
  const [validationErrors, setValidationErrors] = useState<ValidationErrorDetails[]>([]);
  const [partialContent, setPartialContent] = useState<any>(null);
  const [framingConflict, setFramingConflict] = useState<FramingConflict | null>(null);
  const [citationErrors, setCitationErrors] = useState<CitationError[]>([]);
  const [activeTab, setActiveTab] = useState<'validation' | 'partial' | 'framing' | 'citation'>('validation');

  // Load error recovery data
  useEffect(() => {
    setValidationErrors(getValidationErrors());
    setPartialContent(getPartialContent());
    setFramingConflict(getFramingConflict());
    setCitationErrors(getCitationErrors());
    
    // Set active tab based on available data
    if (getValidationErrors().length > 0) {
      setActiveTab('validation');
    } else if (getPartialContent()) {
      setActiveTab('partial');
    } else if (getFramingConflict()) {
      setActiveTab('framing');
    } else if (getCitationErrors().length > 0) {
      setActiveTab('citation');
    }
  }, [error]);

  // Determine if we have any recovery options
  const hasRecoveryOptions = 
    validationErrors.length > 0 || 
    partialContent || 
    framingConflict || 
    citationErrors.length > 0;

  if (!hasRecoveryOptions && !error) {
    return null;
  }

  return (
    <GlassCard className="p-4 mb-4">
      <h3 className="text-xl font-semibold mb-4">Content Generation Issues</h3>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 bg-opacity-30 rounded-lg">
          <p className="font-medium">{error.getUserFriendlyMessage()}</p>
          <ul className="mt-2 list-disc list-inside">
            {error.getTroubleshootingSteps().map((step, index) => (
              <li key={index} className="text-sm">{step}</li>
            ))}
          </ul>
        </div>
      )}
      
      {hasRecoveryOptions && (
        <>
          <div className="flex border-b border-gray-200 mb-4">
            {validationErrors.length > 0 && (
              <button
                className={`px-4 py-2 ${activeTab === 'validation' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
                onClick={() => setActiveTab('validation')}
              >
                Validation ({validationErrors.length})
              </button>
            )}
            {partialContent && (
              <button
                className={`px-4 py-2 ${activeTab === 'partial' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
                onClick={() => setActiveTab('partial')}
              >
                Partial Content
              </button>
            )}
            {framingConflict && (
              <button
                className={`px-4 py-2 ${activeTab === 'framing' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
                onClick={() => setActiveTab('framing')}
              >
                Framing Conflict
              </button>
            )}
            {citationErrors.length > 0 && (
              <button
                className={`px-4 py-2 ${activeTab === 'citation' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
                onClick={() => setActiveTab('citation')}
              >
                Citations ({citationErrors.length})
              </button>
            )}
          </div>
          
          <div className="p-2">
            {/* Validation Errors */}
            {activeTab === 'validation' && validationErrors.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Please fix the following issues:</h4>
                <ul className="list-disc list-inside">
                  {validationErrors.map((error, index) => (
                    <li key={index} className="mb-2">
                      <span className="font-medium">{error.field}:</span> {error.message}
                      {error.suggestion && (
                        <p className="text-sm text-gray-600 ml-5">Suggestion: {error.suggestion}</p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Partial Content Recovery */}
            {activeTab === 'partial' && partialContent && (
              <div>
                <h4 className="font-medium mb-2">Partial content available from previous attempt:</h4>
                <p className="text-sm mb-2">
                  We found {partialContent.content.length} characters of content from a previous generation 
                  attempt that was interrupted. You can resume from this content or start fresh.
                </p>
                <div className="max-h-40 overflow-y-auto p-2 bg-gray-100 bg-opacity-30 rounded mb-3">
                  <p className="text-sm">{partialContent.content.substring(0, 200)}...</p>
                </div>
                <div className="flex space-x-2">
                  <GlassButton 
                    onClick={() => {
                      if (onResumePartial) {
                        onResumePartial(partialContent.content);
                      }
                    }}
                  >
                    Resume from partial content
                  </GlassButton>
                  <GlassButton 
                    variant="secondary"
                    onClick={() => {
                      clearPartialContent();
                      setPartialContent(null);
                      if (onRetry) {
                        onRetry();
                      }
                    }}
                  >
                    Start fresh
                  </GlassButton>
                </div>
              </div>
            )}
            
            {/* Framing Conflict Resolution */}
            {activeTab === 'framing' && framingConflict && (
              <div>
                <h4 className="font-medium mb-2">Framing conflict detected:</h4>
                <p className="text-sm mb-3">
                  We detected conflicting frames in your content: 
                  <span className="font-medium"> {framingConflict.conflictingFrames.frame1.name}</span> and 
                  <span className="font-medium"> {framingConflict.conflictingFrames.frame2.name}</span>. 
                  Please select which frame you'd prefer to emphasize:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  <GlassCard className="p-3">
                    <h5 className="font-medium">{framingConflict.conflictingFrames.frame1.name}</h5>
                    <p className="text-sm">{framingConflict.conflictingFrames.frame1.description}</p>
                    <p className="text-sm mt-1">
                      <span className="font-medium">Values:</span> {framingConflict.conflictingFrames.frame1.values.join(', ')}
                    </p>
                    <div className="mt-2">
                      <GlassButton 
                        size="small"
                        onClick={() => {
                          if (onResolveFramingConflict) {
                            onResolveFramingConflict(framingConflict.conflictingFrames.frame1.name);
                          }
                          clearFramingConflict();
                          setFramingConflict(null);
                        }}
                      >
                        Use this frame
                      </GlassButton>
                    </div>
                  </GlassCard>
                  
                  <GlassCard className="p-3">
                    <h5 className="font-medium">{framingConflict.conflictingFrames.frame2.name}</h5>
                    <p className="text-sm">{framingConflict.conflictingFrames.frame2.description}</p>
                    <p className="text-sm mt-1">
                      <span className="font-medium">Values:</span> {framingConflict.conflictingFrames.frame2.values.join(', ')}
                    </p>
                    <div className="mt-2">
                      <GlassButton 
                        size="small"
                        onClick={() => {
                          if (onResolveFramingConflict) {
                            onResolveFramingConflict(framingConflict.conflictingFrames.frame2.name);
                          }
                          clearFramingConflict();
                          setFramingConflict(null);
                        }}
                      >
                        Use this frame
                      </GlassButton>
                    </div>
                  </GlassCard>
                </div>
                
                <h5 className="font-medium mb-2">Alternative suggestions:</h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {framingConflict.alternativeSuggestions.map((frame, index) => (
                    <GlassCard key={index} className="p-3">
                      <h5 className="font-medium">{frame.name}</h5>
                      <p className="text-sm">{frame.description}</p>
                      <div className="mt-2">
                        <GlassButton 
                          size="small"
                          onClick={() => {
                            if (onResolveFramingConflict) {
                              onResolveFramingConflict(frame.name);
                            }
                            clearFramingConflict();
                            setFramingConflict(null);
                          }}
                        >
                          Use this frame
                        </GlassButton>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              </div>
            )}
            
            {/* Citation Error Handling */}
            {activeTab === 'citation' && citationErrors.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Citation issues detected:</h4>
                <p className="text-sm mb-3">
                  We found {citationErrors.length} citation issues that need your attention.
                </p>
                
                {citationErrors.map((error, index) => (
                  <GlassCard key={index} className="p-3 mb-3">
                    <h5 className="font-medium">
                      Citation {index + 1}: {error.errorType === 'incomplete' ? 'Incomplete' : error.errorType === 'invalid' ? 'Invalid' : 'Error'}
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      <div>
                        <h6 className="text-sm font-medium">Original Citation:</h6>
                        <p className="text-sm">{error.citation.title || 'No title'}</p>
                        <p className="text-sm">Author: {error.citation.author || 'Unknown'}</p>
                        <p className="text-sm">Source: {error.citation.source || 'Unknown'}</p>
                        {error.citation.url && <p className="text-sm">URL: {error.citation.url}</p>}
                      </div>
                      
                      <div>
                        <h6 className="text-sm font-medium">Suggested Fix:</h6>
                        {error.suggestion ? (
                          <>
                            <p className="text-sm">{error.suggestion.title || 'No title'}</p>
                            <p className="text-sm">Author: {error.suggestion.author || 'Unknown'}</p>
                            <p className="text-sm">Source: {error.suggestion.source || 'Unknown'}</p>
                            {error.suggestion.url && <p className="text-sm">URL: {error.suggestion.url}</p>}
                          </>
                        ) : (
                          <p className="text-sm">No suggestion available</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-3 flex space-x-2">
                      {error.suggestion && (
                        <GlassButton 
                          size="small"
                          onClick={() => {
                            if (onFixCitation) {
                              onFixCitation(error.suggestion);
                            }
                            clearCitationErrors(error.citation.source);
                            setCitationErrors(citationErrors.filter((_, i) => i !== index));
                          }}
                        >
                          Use suggested fix
                        </GlassButton>
                      )}
                      <GlassButton 
                        size="small"
                        variant="secondary"
                        onClick={() => {
                          clearCitationErrors(error.citation.source);
                          setCitationErrors(citationErrors.filter((_, i) => i !== index));
                        }}
                      >
                        Ignore this issue
                      </GlassButton>
                    </div>
                  </GlassCard>
                ))}
              </div>
            )}
          </div>
        </>
      )}
      
      {error && error.retryable && onRetry && (
        <div className="mt-4">
          <GlassButton onClick={onRetry}>
            Retry Generation
          </GlassButton>
        </div>
      )}
    </GlassCard>
  );
};

export default ContentErrorRecovery;