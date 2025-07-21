
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, FileText, Clock, CheckCircle, XCircle, AlertCircle, Edit3, Plus } from 'lucide-react';
import { ApplicationForm } from '@/components/ApplicationForm';

const Applications = () => {
  const [selectedTab, setSelectedTab] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Sample applications data
  const applications = [
    {
      id: 'app-001',
      grantTitle: 'Small Business Innovation Research',
      organization: 'Department of Defense',
      amount: '$500,000',
      status: 'submitted',
      progress: 100,
      deadline: '2025-03-15',
      lastUpdated: '2025-01-15',
      nextAction: 'Awaiting review',
      strength: 92,
      documentsComplete: 8,
      documentsTotal: 8
    },
    {
      id: 'app-002',
      grantTitle: 'Tech Development Fund',
      organization: 'State Economic Development',
      amount: '$250,000',
      status: 'draft',
      progress: 65,
      deadline: '2025-04-30',
      lastUpdated: '2025-01-20',
      nextAction: 'Complete financial projections',
      strength: 78,
      documentsComplete: 5,
      documentsTotal: 7
    },
    {
      id: 'app-003',
      grantTitle: 'Green Energy Innovation Grant',
      organization: 'Environmental Protection Agency',
      amount: '$750,000',
      status: 'under-review',
      progress: 100,
      deadline: '2025-02-28',
      lastUpdated: '2025-01-10',
      nextAction: 'Under review - no action needed',
      strength: 88,
      documentsComplete: 12,
      documentsTotal: 12
    },
    {
      id: 'app-004',
      grantTitle: 'Export Development Program',
      organization: 'Department of Commerce',
      amount: '$100,000',
      status: 'approved',
      progress: 100,
      deadline: '2025-05-15',
      lastUpdated: '2025-01-18',
      nextAction: 'Sign agreement documents',
      strength: 95,
      documentsComplete: 6,
      documentsTotal: 6
    },
    {
      id: 'app-005',
      grantTitle: 'Workforce Training Initiative',
      organization: 'Department of Labor',
      amount: '$300,000',
      status: 'rejected',
      progress: 100,
      deadline: '2025-06-01',
      lastUpdated: '2025-01-12',
      nextAction: 'Review feedback and reapply',
      strength: 72,
      documentsComplete: 9,
      documentsTotal: 9
    }
  ];

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
                    onSuccess={() => setIsFormOpen(false)}
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

        {filteredApplications.length === 0 && (
          <div className="text-center py-16">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No applications in this category
            </h3>
            <p className="text-gray-500 mb-6">
              Start discovering grants to begin your application journey
            </p>
            <Button asChild>
              <a href="/discover">Discover Grants</a>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Applications;
