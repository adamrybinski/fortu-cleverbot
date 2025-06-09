
import React from 'react';
import { Check, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface ColorPalette {
  name: string;
  colors: string[];
}

export const colorPalettes: ColorPalette[] = [
  { name: 'Ocean Blue', colors: ['#003079', '#6EFFC6', '#F1EDFF'] },
  { name: 'Forest Green', colors: ['#2D5A27', '#7ED321', '#F7F7F7'] },
  { name: 'Sunset Orange', colors: ['#D73027', '#FCA311', '#F8F9FA'] },
  { name: 'Purple Rain', colors: ['#6A0572', '#AB83A1', '#FDF2F8'] },
  { name: 'Midnight', colors: ['#1A1A1A', '#4ECDC4', '#F0F0F0'] }
];

interface ColorPaletteSelectorProps {
  selectedPaletteIndex: number | null;
  customColors: boolean;
  onPaletteSelect: (paletteIndex: number) => void;
  onCustomColors: () => void;
}

export const ColorPaletteSelector: React.FC<ColorPaletteSelectorProps> = ({
  selectedPaletteIndex,
  customColors,
  onPaletteSelect,
  onCustomColors
}) => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {colorPalettes.map((palette, index) => (
        <div
          key={palette.name}
          className={`border-2 rounded-lg p-3 cursor-pointer transition-all ${
            selectedPaletteIndex === index
              ? 'border-[#753BBD] bg-[#753BBD]/10'
              : 'border-[#6EFFC6]/30 hover:border-[#6EFFC6]'
          }`}
          onClick={() => onPaletteSelect(index)}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-[#003079]">{palette.name}</span>
            {selectedPaletteIndex === index && (
              <Check className="w-4 h-4 text-[#753BBD]" />
            )}
          </div>
          <div className="flex gap-1">
            {palette.colors.map((color, colorIndex) => (
              <div
                key={colorIndex}
                className="w-6 h-6 rounded border border-gray-200"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>

    <div className="pt-4 border-t border-[#6EFFC6]/30">
      <Button
        type="button"
        variant="outline"
        onClick={onCustomColors}
        className={`mb-4 ${
          customColors 
            ? 'border-[#753BBD] bg-[#753BBD]/10 text-[#753BBD]' 
            : 'border-[#6EFFC6]/30 hover:border-[#6EFFC6]'
        }`}
      >
        <Palette className="w-4 h-4 mr-2" />
        Use Custom Colours
      </Button>
    </div>
  </div>
);
