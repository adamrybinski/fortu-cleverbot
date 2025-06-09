
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';

interface ClientInfoFormProps {
  form: UseFormReturn<any>;
}

export const ClientInfoForm: React.FC<ClientInfoFormProps> = ({ form }) => (
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
);
