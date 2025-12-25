import { useCallback, useState } from 'react';
import type { FileDropZoneProps } from '../../types';

export function FileDropZone({ onFileDrop, isLoading = false }: FileDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      onFileDrop(file);
    }
  }, [onFileDrop]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileDrop(file);
    }
  }, [onFileDrop]);

  return (
    <div
      className={`
        relative group cursor-pointer flex flex-col items-center justify-center gap-6
        rounded-xl border-2 border-dashed transition-all duration-300
        px-6 py-12 h-full min-h-[320px]
        ${isDragging
          ? 'border-primary bg-primary/10'
          : 'border-surface-border hover:border-primary hover:bg-primary/5'
        }
        ${isLoading ? 'pointer-events-none opacity-50' : ''}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Icon Circle */}
      <div className="size-20 rounded-full bg-surface-dark flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
        <span className="material-symbols-outlined text-primary text-4xl">
          {isLoading ? 'hourglass_empty' : 'cloud_upload'}
        </span>
      </div>

      <div className="flex max-w-[480px] flex-col items-center gap-2 z-10">
        <p className="text-slate-900 dark:text-white text-xl font-bold leading-tight tracking-tight text-center">
          {isLoading ? 'Loading...' : 'Drop your .es3 file here'}
        </p>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-normal leading-normal text-center">
          or tap to browse your device
        </p>
      </div>

      <label className="flex min-w-[120px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-6 bg-surface-dark border border-surface-border text-white text-sm font-bold leading-normal tracking-wide hover:bg-primary hover:border-primary transition-colors shadow-md">
        <span className="truncate">Select File</span>
        <input
          type="file"
          accept=".es3"
          className="hidden"
          onChange={handleFileSelect}
          disabled={isLoading}
        />
      </label>

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-10 pointer-events-none transition-opacity duration-500 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat rounded-lg" />
    </div>
  );
}
