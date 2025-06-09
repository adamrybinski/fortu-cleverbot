import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { ClientInfoForm } from './setup/ClientInfoForm';
import { LogoConfigurationCard } from './setup/LogoConfigurationCard';
import { ColorPaletteSelector, colorPalettes } from './setup/ColorPaletteSelector';
import { CustomColorControls } from './setup/CustomColorControls';

const fortuInstanceSchema = z.object({
  clientName: z.string().min(1, 'Client name is required'),
  logoBackgroundColour: z.string().default('#FFFFFF'),
  sidebarGradientStart: z.string().default('#F1EDFF'),
  sidebarGradientEnd: z.string().default('#EEFFF3'),
  sidebarSelectedBackground: z.string().default('#753BBD'),
  sidebarSelectedFontColor: z.string().default('#FFFFFF'),
  selectedPalette: z.string().optional(),
});

type FortuInstanceFormData = z.infer<typeof fortuInstanceSchema>;

interface LogoFile {
  file: File;
  preview: string;
}

interface FortuInstanceSetupCanvasProps {
  payload?: {
    refinedChallenge?: string;
    selectedQuestions?: any[];
    timestamp?: string;
  };
  onSendQuestionsToChat?: (questions: any[], action?: 'refine' | 'instance' | 'both') => void;
}

export const FortuInstanceSetupCanvas: React.FC<FortuInstanceSetupCanvasProps> = ({
  payload,
  onSendQuestionsToChat
}) => {
  const [selectedPaletteIndex, setSelectedPaletteIndex] = useState<number | null>(null);
  const [customColors, setCustomColors] = useState(false);
  const [primaryLogo, setPrimaryLogo] = useState<LogoFile | null>(null);
  const [dropdownLogo, setDropdownLogo] = useState<LogoFile | null>(null);

  const form = useForm<FortuInstanceFormData>({
    resolver: zodResolver(fortuInstanceSchema),
    defaultValues: {
      clientName: '',
      logoBackgroundColour: '#FFFFFF',
      sidebarGradientStart: '#F1EDFF',
      sidebarGradientEnd: '#EEFFF3',
      sidebarSelectedBackground: '#753BBD',
      sidebarSelectedFontColor: '#FFFFFF',
    }
  });

  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    setLogo: React.Dispatch<React.SetStateAction<LogoFile | null>>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    const maxSize = 2 * 1024 * 1024;

    if (!validTypes.includes(file.type)) {
      alert('Please upload a PNG or JPG file.');
      return;
    }

    if (file.size > maxSize) {
      alert('File size must be less than 2MB.');
      return;
    }

    const preview = URL.createObjectURL(file);
    setLogo({ file, preview });
  };

  const removeLogo = (
    setLogo: React.Dispatch<React.SetStateAction<LogoFile | null>>,
    logo: LogoFile | null
  ) => {
    if (logo?.preview) {
      URL.revokeObjectURL(logo.preview);
    }
    setLogo(null);
  };

  const onSubmit = (data: FortuInstanceFormData) => {
    console.log('Fortu.ai instance setup data:', data);
    
    const instanceData = {
      ...data,
      primaryLogo: primaryLogo?.file,
      dropdownLogo: dropdownLogo?.file,
      challenge: payload?.refinedChallenge,
      selectedQuestions: payload?.selectedQuestions,
      createdAt: new Date().toISOString()
    };

    if (onSendQuestionsToChat) {
      onSendQuestionsToChat([], 'instance');
    }

    console.log('Ready to create fortu.ai instance with:', instanceData);
  };

  const handlePaletteSelect = (paletteIndex: number) => {
    setSelectedPaletteIndex(paletteIndex);
    setCustomColors(false);
    const palette = colorPalettes[paletteIndex];
    
    form.setValue('sidebarGradientStart', palette.colors[2]);
    form.setValue('sidebarGradientEnd', palette.colors[1]);
    form.setValue('sidebarSelectedBackground', palette.colors[0]);
    form.setValue('selectedPalette', palette.name);
  };

  const handleCustomColors = () => {
    setCustomColors(true);
    setSelectedPaletteIndex(null);
    form.setValue('selectedPalette', 'Custom');
  };

  React.useEffect(() => {
    return () => {
      if (primaryLogo?.preview) URL.revokeObjectURL(primaryLogo.preview);
      if (dropdownLogo?.preview) URL.revokeObjectURL(dropdownLogo.preview);
    };
  }, []);

  return (
    <div className="p-6 bg-gradient-to-br from-[#F1EDFF] to-[#EEFFF3] min-h-full">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#003079] mb-2" style={{ fontFamily: 'Montserrat' }}>
            fortu.ai Setup
          </h1>
          <p className="text-[#1D253A]">
            Configure your personalised fortu.ai workspace to tackle your challenge.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <ClientInfoForm form={form} />

            <LogoConfigurationCard
              form={form}
              primaryLogo={primaryLogo}
              dropdownLogo={dropdownLogo}
              onPrimaryLogoUpload={(e) => handleFileUpload(e, setPrimaryLogo)}
              onDropdownLogoUpload={(e) => handleFileUpload(e, setDropdownLogo)}
              onRemovePrimaryLogo={() => removeLogo(setPrimaryLogo, primaryLogo)}
              onRemoveDropdownLogo={() => removeLogo(setDropdownLogo, dropdownLogo)}
            />

            <Card className="border-[#6EFFC6]/30">
              <CardHeader>
                <CardTitle className="text-[#003079]" style={{ fontFamily: 'Montserrat' }}>
                  Colour Palette
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ColorPaletteSelector
                  selectedPaletteIndex={selectedPaletteIndex}
                  customColors={customColors}
                  onPaletteSelect={handlePaletteSelect}
                  onCustomColors={handleCustomColors}
                />

                {(customColors || selectedPaletteIndex !== null) && (
                  <CustomColorControls form={form} />
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button
                type="submit"
                className="bg-[#753BBD] hover:bg-[#753BBD]/90 text-white px-8 py-2"
                style={{ fontFamily: 'Montserrat' }}
              >
                Create fortu.ai Instance
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};
