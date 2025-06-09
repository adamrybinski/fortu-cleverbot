
import React from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';

interface CustomColorControlsProps {
  form: UseFormReturn<any>;
}

export const CustomColorControls: React.FC<CustomColorControlsProps> = ({ form }) => (
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
);
