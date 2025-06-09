
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { LogoUploadArea } from './LogoUploadArea';

interface LogoFile {
  file: File;
  preview: string;
}

interface LogoConfigurationCardProps {
  form: UseFormReturn<any>;
  primaryLogo: LogoFile | null;
  dropdownLogo: LogoFile | null;
  onPrimaryLogoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDropdownLogoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemovePrimaryLogo: () => void;
  onRemoveDropdownLogo: () => void;
}

export const LogoConfigurationCard: React.FC<LogoConfigurationCardProps> = ({
  form,
  primaryLogo,
  dropdownLogo,
  onPrimaryLogoUpload,
  onDropdownLogoUpload,
  onRemovePrimaryLogo,
  onRemoveDropdownLogo
}) => (
  <Card className="border-[#6EFFC6]/30">
    <CardHeader>
      <CardTitle className="text-[#003079]" style={{ fontFamily: 'Montserrat' }}>
        Logo Configuration
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <LogoUploadArea
          title="Primary Logo"
          logo={primaryLogo}
          onFileSelect={onPrimaryLogoUpload}
          onRemove={onRemovePrimaryLogo}
        />

        <LogoUploadArea
          title="Dropdown Logo"
          logo={dropdownLogo}
          onFileSelect={onDropdownLogoUpload}
          onRemove={onRemoveDropdownLogo}
        />
      </div>

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
);
