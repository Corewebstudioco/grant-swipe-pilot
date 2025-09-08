
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, FileText, Clock, CheckCircle, XCircle, AlertCircle, Edit3, Plus } from 'lucide-react';
import { ApplicationForm } from '@/components/ApplicationForm';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';

const Applications = () => {
  const [selectedTab, setSelectedTab] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const { toast } = useToast();

  const fetchApplications = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          id,
          status,
          application_data,
          notes,
          created_at,
          updated_at,
          grants:grant_id (
            title,
            agency,
            amount
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data to match expected format
      const transformedApplications = data?.map(app => {
        const appData = app.application_data as any;
        return {
          id: app.id,
          grantTitle: appData?.grant_name || app.grants?.title || 'Untitled Grant',
          organization: app.grants?.agency || 'Unknown Organization',
          amount: appData?.requested_amount 
            ? `$${appData.requested_amount.toLocaleString()}` 
            : app.grants?.amount || '$0',
          status: app.status === 'pending' ? 'submitted' : app.status,
          progress: app.status === 'draft' ? 50 : 100,
          deadline: '2025-12-31', // Default deadline
          lastUpdated: app.updated_at,
          nextAction: getNextAction(app.status),
          strength: Math.floor(Math.random() * 30) + 70, // Mock strength score
          documentsComplete: appData?.support_documents?.length || 0,
          documentsTotal: appData?.support_documents?.length || 0
        };
      }) || [];

      setApplications(transformedApplications);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast({
        title: "Error",
        description: "Failed to load applications. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getNextAction = (status: string) => {
    switch (status) {
      case 'draft':
        return 'Complete and submit application';
      case 'pending':
      case 'submitted':
        return 'Awaiting review';
      case 'in_review':
        return 'Under review - no action needed';
      case 'approved':
        return 'Review approval details';
      case 'rejected':
        return 'Review feedback and consider reapplying';
      default:
        return 'No action required';
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [user?.id]);

  const refreshApplications = () => {
    fetchApplications();
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'draft':
        return { label: 'Draft', color: 'bg-gray-100 text-gray-800', icon: Edit3 };
      case 'submitted':
        return { label: 'Submitted', color: 'bg-blue-100 text-blue-800', icon: FileText };
      case 'under-review':
        return { label: 'Under Review', color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle };
      case 'approved':
        return { label: 'Approved', color: 'bg-green-100 text-green-800', icon: CheckCircle };
      case 'rejected':
        return { label: 'Rejected', color: 'bg-red-100 text-red-800', icon: XCircle };
      default:
        return { label: 'Unknown', color: 'bg-gray-100 text-gray-800', icon: FileText };
    }
  };

  const getStatusCounts = () => {
    return {
      all: applications.length,
      draft: applications.filter(app => app.status === 'draft').length,
      submitted: applications.filter(app => app.status === 'submitted').length,
      'under-review': applications.filter(app => app.status === 'under-review').length,
      approved: applications.filter(app => app.status === 'approved').length,
      rejected: applications.filter(app => app.status === 'rejected').length
    };
  };

  const filteredApplications = selectedTab === 'all' 
    ? applications 
    : applications.filter(app => app.status === selectedTab);

  const statusCounts = getStatusCounts();
  const successRate = Math.round((statusCounts.approved / (statusCounts.approved + statusCounts.rejected)) * 100) || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
              <p className="text-gray-600 mt-1">
                Track and manage your grant applications
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{statusCounts.all}</div>
                <div className="text-sm text-gray-500">Total Apps</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{successRate}%</div>
                <div className="text-sm text-gray-500">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">2.5</div>
                <div className="text-sm text-gray-500">Avg Processing (months)</div>
              </div>
              
              <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogTrigger asChild>
                  <Button className="ml-4">
                    <Plus className="w-4 h-4 mr-2" />
                    New Application
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Submit Grant Application</DialogTitle>
                  </DialogHeader>
                  <ApplicationForm 
                    onSuccess={() => {
                      setIsFormOpen(false);
                      refreshApplications();
                    }}
                    onCancel={() => setIsFormOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid grid-cols-6 w-full mb-8">
            <TabsTrigger value="all">All ({statusCounts.all})</TabsTrigger>
            <TabsTrigger value="draft">Draft ({statusCounts.draft})</TabsTrigger>
            <TabsTrigger value="submitted">Submitted ({statusCounts.submitted})</TabsTrigger>
            <TabsTrigger value="under-review">Review ({statusCounts['under-review']})</TabsTrigger>
            <TabsTrigger value="approved">Approved ({statusCounts.approved})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({statusCounts.rejected})</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedTab}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredApplications.map((app) => {
                const statusInfo = getStatusInfo(app.status);
                const StatusIcon = statusInfo.icon;
                const daysLeft = Math.ceil((new Date(app.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                
                return (
                  <Card key={app.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg leading-tight mb-2">
                            {app.grantTitle}
                          </CardTitle>
                          <CardDescription>
                            {app.organization} • {app.amount}
                          </CardDescription>
                        </div>
                        <Badge className={statusInfo.color}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusInfo.label}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Application Progress</span>
                          <span>{app.progress}%</span>
                        </div>
                        <Progress value={app.progress} className="h-2" />
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-gray-500">Application Strength</div>
                          <div className="font-semibold text-green-600">{app.strength}/100</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Documents</div>
                          <div className="font-semibold">
                            {app.documentsComplete}/{app.documentsTotal} complete
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <div>
                            <div className="text-gray-500">Deadline</div>
                            <div className={`font-medium ${daysLeft <= 7 ? 'text-red-600' : daysLeft <= 30 ? 'text-orange-600' : 'text-green-600'}`}>
                              {daysLeft > 0 ? `${daysLeft} days left` : 'Deadline passed'}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <div>
                            <div className="text-gray-500">Last Updated</div>
                            <div className="font-medium">
                              {new Date(app.lastUpdated).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-sm font-medium text-gray-900 mb-1">Next Action:</div>
                        <div className="text-sm text-gray-600">{app.nextAction}</div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button className="flex-1">
                          {app.status === 'draft' ? 'Continue Application' : 'View Details'}
                        </Button>
                        {app.status === 'draft' && (
                          <Button variant="outline">
                            Save Draft
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading applications...</p>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              {selectedTab === 'all' ? 'No applications found' : `No applications in this category`}
            </h3>
            <p className="text-gray-500 mb-6">
              {selectedTab === 'all' 
                ? 'Submit your first grant application to get started'
                : 'Start discovering grants to begin your application journey'
              }
            </p>
            <Button asChild>
              <a href="/discover">Discover Grants</a>
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Applications;
