
import React from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface LogoFile {
  file: File;
  preview: string;
}

interface LogoUploadAreaProps {
  title: string;
  logo: LogoFile | null;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
}

export const LogoUploadArea: React.FC<LogoUploadAreaProps> = ({ 
  title, 
  logo, 
  onFileSelect, 
  onRemove 
}) => (
  <div className="space-y-2">
    <Label className="text-[#003079]">{title}</Label>
    {logo ? (
      <div className="relative border border-[#6EFFC6]/30 rounded-lg p-4 bg-gray-50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-[#003079] font-medium">{logo.file.name}</span>
          <Button
            type="button"
            onClick={onRemove}
            variant="ghost"
            size="sm"
            className="text-red-500 hover:text-red-700 p-1"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex items-center justify-center">
          <img
            src={logo.preview}
            alt="Logo preview"
            className="max-w-32 max-h-20 object-contain"
          />
        </div>
      </div>
    ) : (
      <div className="relative border-2 border-dashed border-[#6EFFC6]/50 rounded-lg p-8 text-center hover:border-[#6EFFC6] transition-colors cursor-pointer">
        <input
          type="file"
          accept="image/png,image/jpeg,image/jpg"
          onChange={onFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <Upload className="w-8 h-8 text-[#753BBD] mx-auto mb-2" />
        <p className="text-sm text-[#1D253A]">Upload {title.toLowerCase()}</p>
        <p className="text-xs text-gray-500">PNG, JPG up to 2MB</p>
      </div>
    )}
  </div>
);
