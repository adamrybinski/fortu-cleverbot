import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Upload, Palette, Check, X, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const colorPalettes = [
  { name: 'Ocean Blue', colors: ['#003079', '#6EFFC6', '#F1EDFF'] },
  { name: 'Forest Green', colors: ['#2D5A27', '#7ED321', '#F7F7F7'] },
  { name: 'Sunset Orange', colors: ['#D73027', '#FCA311', '#F8F9FA'] },
  { name: 'Purple Rain', colors: ['#6A0572', '#AB83A1', '#FDF2F8'] },
  { name: 'Midnight', colors: ['#1A1A1A', '#4ECDC4', '#F0F0F0'] }
];

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

    // Validate file type and size
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    const maxSize = 2 * 1024 * 1024; // 2MB

    if (!validTypes.includes(file.type)) {
      alert('Please upload a PNG or JPG file.');
      return;
    }

    if (file.size > maxSize) {
      alert('File size must be less than 2MB.');
      return;
    }

    // Create preview URL
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
    
    // Prepare the instance data with challenge context and logos
    const instanceData = {
      ...data,
      primaryLogo: primaryLogo?.file,
      dropdownLogo: dropdownLogo?.file,
      challenge: payload?.refinedChallenge,
      selectedQuestions: payload?.selectedQuestions,
      createdAt: new Date().toISOString()
    };

    // Send back to chat for final confirmation or processing
    if (onSendQuestionsToChat) {
      onSendQuestionsToChat([], 'instance');
    }

    // Here you would typically send this data to your backend
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

  // Clean up object URLs on unmount
  React.useEffect(() => {
    return () => {
      if (primaryLogo?.preview) URL.revokeObjectURL(primaryLogo.preview);
      if (dropdownLogo?.preview) URL.revokeObjectURL(dropdownLogo.preview);
    };
  }, []);

  const LogoUploadArea: React.FC<{
    title: string;
    logo: LogoFile | null;
    onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onRemove: () => void;
  }> = ({ title, logo, onFileSelect, onRemove }) => (
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

  return (
    <div className="p-6 bg-gradient-to-br from-[#F1EDFF] to-[#EEFFF3] min-h-full">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#003079] mb-2" style={{ fontFamily: 'Montserrat' }}>
            Set Up Your fortu.ai Instance
          </h1>
          <p className="text-[#1D253A]">
            Configure your personalised fortu.ai workspace to tackle your challenge: "{payload?.refinedChallenge}"
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Client Information */}
            <Card className="border-[#6EFFC6]/30">
              <CardHeader>
                <CardTitle className="text-[#003079]" style={{ fontFamily: 'Montserrat' }}>
                  Client Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="clientName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#003079]">Client Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter client organisation name"
                          className="border-[#6EFFC6]/30 focus:border-[#753BBD]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Logo Configuration */}
            <Card className="border-[#6EFFC6]/30">
              <CardHeader>
                <CardTitle className="text-[#003079]" style={{ fontFamily: 'Montserrat' }}>
                  Logo Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Primary Logo */}
                  <LogoUploadArea
                    title="Primary Logo"
                    logo={primaryLogo}
                    onFileSelect={(e) => handleFileUpload(e, setPrimaryLogo)}
                    onRemove={() => removeLogo(setPrimaryLogo, primaryLogo)}
                  />

                  {/* Dropdown Logo */}
                  <LogoUploadArea
                    title="Dropdown Logo"
                    logo={dropdownLogo}
                    onFileSelect={(e) => handleFileUpload(e, setDropdownLogo)}
                    onRemove={() => removeLogo(setDropdownLogo, dropdownLogo)}
                  />
                </div>

                {/* Logo Background Colour */}
                <FormField
                  control={form.control}
                  name="logoBackgroundColour"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#003079]">Logo Background Colour</FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input 
                            type="color"
                            className="w-16 h-10 border-[#6EFFC6]/30 cursor-pointer"
                            {...field} 
                          />
                        </FormControl>
                        <FormControl>
                          <Input 
                            placeholder="#FFFFFF"
                            className="border-[#6EFFC6]/30 focus:border-[#753BBD]"
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Colour Palette Selection */}
            <Card className="border-[#6EFFC6]/30">
              <CardHeader>
                <CardTitle className="text-[#003079]" style={{ fontFamily: 'Montserrat' }}>
                  Colour Palette
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {colorPalettes.map((palette, index) => (
                    <div
                      key={palette.name}
                      className={`border-2 rounded-lg p-3 cursor-pointer transition-all ${
                        selectedPaletteIndex === index
                          ? 'border-[#753BBD] bg-[#753BBD]/10'
                          : 'border-[#6EFFC6]/30 hover:border-[#6EFFC6]'
                      }`}
                      onClick={() => handlePaletteSelect(index)}
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
                    onClick={handleCustomColors}
                    className={`mb-4 ${
                      customColors 
                        ? 'border-[#753BBD] bg-[#753BBD]/10 text-[#753BBD]' 
                        : 'border-[#6EFFC6]/30 hover:border-[#6EFFC6]'
                    }`}
                  >
                    <Palette className="w-4 h-4 mr-2" />
                    Use Custom Colours
                  </Button>

                  {(customColors || selectedPaletteIndex !== null) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="sidebarGradientStart"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[#003079]">Sidebar Gradient Start</FormLabel>
                            <div className="flex gap-2">
                              <FormControl>
                                <Input 
                                  type="color"
                                  className="w-16 h-10 border-[#6EFFC6]/30 cursor-pointer"
                                  {...field} 
                                />
                              </FormControl>
                              <FormControl>
                                <Input 
                                  placeholder="#F1EDFF"
                                  className="border-[#6EFFC6]/30 focus:border-[#753BBD]"
                                  value={field.value}
                                  onChange={field.onChange}
                                />
                              </FormControl>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="sidebarGradientEnd"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[#003079]">Sidebar Gradient End</FormLabel>
                            <div className="flex gap-2">
                              <FormControl>
                                <Input 
                                  type="color"
                                  className="w-16 h-10 border-[#6EFFC6]/30 cursor-pointer"
                                  {...field} 
                                />
                              </FormControl>
                              <FormControl>
                                <Input 
                                  placeholder="#EEFFF3"
                                  className="border-[#6EFFC6]/30 focus:border-[#753BBD]"
                                  value={field.value}
                                  onChange={field.onChange}
                                />
                              </FormControl>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="sidebarSelectedBackground"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[#003079]">Selected Background</FormLabel>
                            <div className="flex gap-2">
                              <FormControl>
                                <Input 
                                  type="color"
                                  className="w-16 h-10 border-[#6EFFC6]/30 cursor-pointer"
                                  {...field} 
                                />
                              </FormControl>
                              <FormControl>
                                <Input 
                                  placeholder="#753BBD"
                                  className="border-[#6EFFC6]/30 focus:border-[#753BBD]"
                                  value={field.value}
                                  onChange={field.onChange}
                                />
                              </FormControl>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="sidebarSelectedFontColor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[#003079]">Selected Font Colour</FormLabel>
                            <div className="flex gap-2">
                              <FormControl>
                                <Input 
                                  type="color"
                                  className="w-16 h-10 border-[#6EFFC6]/30 cursor-pointer"
                                  {...field} 
                                />
                              </FormControl>
                              <FormControl>
                                <Input 
                                  placeholder="#FFFFFF"
                                  className="border-[#6EFFC6]/30 focus:border-[#753BBD]"
                                  value={field.value}
                                  onChange={field.onChange}
                                />
                              </FormControl>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
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
