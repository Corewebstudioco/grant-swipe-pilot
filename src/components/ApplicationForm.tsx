import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/contexts/UserContext';
import { useActivityLogger } from '@/hooks/useActivityLogger';
import { FileText, Upload, X } from 'lucide-react';

const applicationFormSchema = z.object({
  grantName: z.string().min(1, 'Grant name is required'),
  reason: z.string().min(10, 'Please provide at least 10 characters explaining your reason'),
  requestedAmount: z.number().min(1, 'Requested amount must be greater than 0'),
});

type ApplicationFormData = z.infer<typeof applicationFormSchema>;

interface ApplicationFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const ApplicationForm: React.FC<ApplicationFormProps> = ({ onSuccess, onCancel }) => {
  const { toast } = useToast();
  const { user } = useUser();
  const { logApplicationSubmit } = useActivityLogger();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationFormSchema),
    defaultValues: {
      grantName: '',
      reason: '',
      requestedAmount: 0,
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ApplicationFormData) => {
    if (!user?.id) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to submit an application.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare application data
      const applicationData = {
        grant_name: data.grantName,
        reason_for_applying: data.reason,
        requested_amount: data.requestedAmount,
        support_documents: selectedFiles.map(file => ({
          name: file.name,
          size: file.size,
          type: file.type,
        })),
      };

      // Insert application into database
      const { error } = await supabase
        .from('applications')
        .insert({
          user_id: user.id,
          application_data: applicationData,
          status: 'pending',
          notes: `Application for ${data.grantName}`,
        });

      if (error) {
        throw error;
      }

      // Log the application submission
      logApplicationSubmit(data.grantName);

      toast({
        title: "Application Submitted",
        description: "Your grant application has been submitted successfully.",
      });

      // Reset form
      form.reset();
      setSelectedFiles([]);
      
      // Call success callback
      onSuccess?.();

    } catch (error) {
      console.error('Error submitting application:', error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Apply for Grant
        </CardTitle>
        <CardDescription>
          Submit your grant application with all required information
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="grantName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Grant Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter the name of the grant you're applying for"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for Applying</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Explain why you're applying for this grant and how it will benefit your business..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="requestedAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Requested Amount ($)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      placeholder="0"
                      min="1"
                      step="1"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3">
              <label className="text-sm font-medium">Support Documents (Optional)</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">
                  Upload supporting documents for your application
                </p>
                <input
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                />
                <label htmlFor="file-upload">
                  <Button type="button" variant="outline" size="sm" asChild>
                    <span className="cursor-pointer">Choose Files</span>
                  </Button>
                </label>
              </div>

              {selectedFiles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Selected Files:</p>
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span className="text-sm truncate">{file.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </Button>
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};