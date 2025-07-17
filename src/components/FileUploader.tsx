import React, { useState, useRef } from 'react';
import { FileReferenceService } from '../services/FileReferenceService';
import GlassButton from './GlassButton';
import GlassCard from './GlassCard';
import LoadingSpinner from './LoadingSpinner';

interface FileUploaderProps {
  onUploadComplete?: (documentId: string) => void;
  className?: string;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onUploadComplete, className }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileService = new FileReferenceService();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setIsUploading(true);
    setError(null);
    setSuccess(null);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + 10;
          if (newProgress >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return newProgress;
        });
      }, 300);

      // Upload the file
      const documentId = await fileService.uploadFile(file, {
        author: 'Current User', // In a real app, get this from user context
        keywords: ['uploaded', 'document'], // In a real app, extract or prompt for keywords
      });

      clearInterval(progressInterval);
      setUploadProgress(100);
      setSuccess(`File "${file.name}" uploaded successfully!`);
      
      if (onUploadComplete) {
        onUploadComplete(documentId);
      }
    } catch (err) {
      setError(`Upload failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsUploading(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <GlassCard className={`p-6 ${className || ''}`}>
      <h3 className="text-xl font-semibold mb-4">Upload Document</h3>
      
      <div className="mb-4">
        <p className="text-sm text-gray-200 mb-2">
          Upload PDF, DOCX, or TXT files to reference in your content generation.
        </p>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf,.docx,.doc,.txt"
          className="hidden"
        />
        
        <GlassButton
          onClick={triggerFileInput}
          disabled={isUploading}
          className="w-full"
        >
          {isUploading ? 'Uploading...' : 'Select File'}
        </GlassButton>
      </div>
      
      {isUploading && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm">Uploading...</span>
            <span className="text-sm">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <div className="mt-2 flex justify-center">
            <LoadingSpinner size="small" />
          </div>
        </div>
      )}
      
      {error && (
        <div className="text-red-400 text-sm mt-2 p-2 bg-red-900 bg-opacity-20 rounded">
          {error}
        </div>
      )}
      
      {success && (
        <div className="text-green-400 text-sm mt-2 p-2 bg-green-900 bg-opacity-20 rounded">
          {success}
        </div>
      )}
    </GlassCard>
  );
};

export default FileUploader;