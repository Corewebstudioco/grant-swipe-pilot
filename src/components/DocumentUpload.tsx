
import { useRef } from 'react';
import { Upload, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDocuments } from '@/hooks/useDocuments';
import { useToast } from '@/hooks/use-toast';

interface DocumentUploadProps {
  onUploadComplete?: () => void;
}

export const DocumentUpload = ({ onUploadComplete }: DocumentUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploading, uploadDocument } = useDocuments();
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "File size must be less than 10MB",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please select a PDF, image, Word document, or text file",
        variant: "destructive",
      });
      return;
    }

    try {
      await uploadDocument(file);
      onUploadComplete?.();
    } catch (error) {
      console.error('Upload failed:', error);
    }
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      // Process the dropped file directly without creating synthetic event
      // Create a FileList-like object for the file input
      const fileList = files;
      
      // Validate and upload the file directly
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "File size must be less than 10MB",
          variant: "destructive",
        });
        return;
      }

      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ];

      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please select a PDF, image, Word document, or text file",
          variant: "destructive",
        });
        return;
      }

      try {
        await uploadDocument(file);
        onUploadComplete?.();
      } catch (error) {
        console.error('Upload failed:', error);
      }
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Document
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div 
            className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors cursor-pointer"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={handleUploadClick}
          >
            <File className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground mb-4">
              Drag and drop files here, or click to select
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              Supported formats: PDF, Images (JPG, PNG, GIF), Word documents, Text files
              <br />
              Maximum file size: 10MB
            </p>
            <Button 
              disabled={uploading}
              className="w-full sm:w-auto"
              type="button"
            >
              {uploading ? 'Uploading...' : 'Select Files'}
            </Button>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx,.txt"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </CardContent>
    </Card>
  );
};
