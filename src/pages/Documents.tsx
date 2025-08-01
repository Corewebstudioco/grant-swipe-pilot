import { DocumentUpload } from '@/components/DocumentUpload';
import { DocumentList } from '@/components/DocumentList';

const Documents = () => {
  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Document Management</h1>
        <p className="text-muted-foreground">
          Upload and manage your documents for grant applications
        </p>
      </div>
      
      <div className="grid gap-8">
        <DocumentUpload />
        <DocumentList />
      </div>
    </div>
  );
};

export default Documents;