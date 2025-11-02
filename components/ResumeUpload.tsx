import React, { useState, useCallback } from 'react';
import { uploadResume } from '../services/api';
import { Candidate } from '../types';
import { UploadIcon, SpinnerIcon } from './IconComponents';

interface ResumeUploadProps {
  onUploadSuccess: (candidate: Candidate) => void;
  onUploadError: (message: string) => void;
}

const ResumeUpload: React.FC<ResumeUploadProps> = ({ onUploadSuccess, onUploadError }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileChange = async (files: FileList | null) => {
    if (files && files.length > 0) {
      const file = files[0];
      setIsUploading(true);
      try {
        const newCandidate = await uploadResume(file);
        onUploadSuccess(newCandidate);
      } catch (error) {
        if (error instanceof Error) {
            onUploadError(error.message);
        } else {
            onUploadError('An unknown error occurred during upload.');
        }
      } finally {
        setIsUploading(false);
      }
    }
  };

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  }, []);

  const onDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const onDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    const files = event.dataTransfer.files;
    handleFileChange(files);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <h2 className="text-xl font-semibold mb-4 text-slate-700">Upload Resume</h2>
      <div 
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${isDragOver ? 'border-brand-primary bg-brand-light' : 'border-slate-300 bg-slate-50'}`}
      >
        <input
          type="file"
          id="file-upload"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={(e) => handleFileChange(e.target.files)}
          disabled={isUploading}
          accept=".pdf,.doc,.docx,.txt"
        />
        {isUploading ? (
          <div className="flex flex-col items-center justify-center space-y-2">
            <SpinnerIcon />
            <p className="text-slate-600">Processing resume...</p>
          </div>
        ) : (
          <label htmlFor="file-upload" className="flex flex-col items-center justify-center space-y-2 cursor-pointer">
            <UploadIcon />
            <p className="text-slate-600 font-medium">
              <span className="text-brand-primary font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-slate-500">PDF, DOC, DOCX, or TXT</p>
          </label>
        )}
      </div>
    </div>
  );
};

export default ResumeUpload;