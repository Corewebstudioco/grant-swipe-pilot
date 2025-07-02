
import React, { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Building2, Users, MapPin, FileText, BarChart3, Settings, Upload, Download } from 'lucide-react';

const Profile = () => {
  const { user, updateProfile } = useUser();
  const [activeTab, setActiveTab] = useState('company');
  const [isEditing, setIsEditing] = useState(false);

  if (!user) {
    return <div>Please log in to view your profile.</div>;
  }

  const handleSave = () => {
    // Save logic would go here
    setIsEditing(false);
  };

  const industries = [
    'Technology & Software',
    'Healthcare & Biotechnology',
    'Manufacturing & Industrial',
    'Retail & E-commerce',
    'Financial Services',
    'Professional Services',
    'Non-profit & Social Impact',
    'Education & Training',
    'Agriculture & Food',
    'Energy & Utilities',
    'Transportation & Logistics',
    'Real Estate & Construction',
    'Media & Entertainment',
    'Tourism & Hospitality',
    'Other'
  ];

  const grantInterests = [
    'Research & Development',
    'Business Expansion',
    'Hiring & Training',
    'Equipment & Technology',
    'Export & International Trade',
    'Sustainability & Green Initiatives',
    'Innovation & IP Development',
    'Marketing & Sales',
    'Working Capital',
    'Real Estate & Facilities',
    'Community Development',
    'Diversity & Inclusion Programs'
  ];

  const teamMembers = [
    { id: 1, name: 'John Smith', email: 'john@techstartup.com', role: 'Admin', avatar: null },
    { id: 2, name: 'Sarah Wilson', email: 'sarah@techstartup.com', role: 'Member', avatar: null },
    { id: 3, name: 'Mike Chen', email: 'mike@techstartup.com', role: 'Viewer', avatar: null }
  ];

  const documents = [
    { id: 1, name: 'Business Plan 2025', type: 'PDF', size: '2.4 MB', uploaded: '2025-01-15' },
    { id: 2, name: 'Financial Statements Q4', type: 'Excel', size: '856 KB', uploaded: '2025-01-12' },
    { id: 3, name: 'Company Pitch Deck', type: 'PowerPoint', size: '12.3 MB', uploaded: '2025-01-10' },
    { id: 4, name: 'Certificate of Incorporation', type: 'PDF', size: '1.2 MB', uploaded: '2025-01-08' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-navy-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xl font-bold">
                  {user.company.name.charAt(0)}
                </span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{user.company.name}</h1>
                <p className="text-gray-600">{user.company.industry} • {user.company.size}</p>
              </div>
            </div>
            
            <Button 
              onClick={() => setIsEditing(!isEditing)}
              variant={isEditing ? "default" : "outline"}
            >
              {isEditing ? 'Save Changes' : 'Edit Profile'}
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="company">Company</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
          </TabsList>

          {/* Company Information Tab */}
          <TabsContent value="company" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Company Information
                </CardTitle>
                <CardDescription>
                  Basic information about your company
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="company-name">Company Name</Label>
                    <Input 
                      id="company-name" 
                      value={user.company.name} 
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input 
                      id="website" 
                      placeholder="https://your-company.com" 
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="industry">Industry</Label>
                    <Select disabled={!isEditing} value={user.company.industry}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {industries.map((industry) => (
                          <SelectItem key={industry} value={industry}>
                            {industry}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="company-size">Company Size</Label>
                    <Select disabled={!isEditing} value={user.company.size}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1 employee">Solo entrepreneur (1 employee)</SelectItem>
                        <SelectItem value="2-10 employees">Small team (2-10 employees)</SelectItem>
                        <SelectItem value="11-50 employees">Growing business (11-50 employees)</SelectItem>
                        <SelectItem value="51-200 employees">Mid-size company (51-200 employees)</SelectItem>
                        <SelectItem value="201-500 employees">Large company (201-500 employees)</SelectItem>
                        <SelectItem value="500+ employees">Enterprise (500+ employees)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description">Business Description</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Describe your business, products, and services..."
                    disabled={!isEditing}
                    rows={4}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="founded">Founded Year</Label>
                    <Input 
                      id="founded" 
                      placeholder="2020" 
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="revenue">Annual Revenue</Label>
                    <Select disabled={!isEditing}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="under-100k">Under $100K</SelectItem>
                        <SelectItem value="100k-1m">$100K - $1M</SelectItem>
                        <SelectItem value="1m-10m">$1M - $10M</SelectItem>
                        <SelectItem value="10m-50m">$10M - $50M</SelectItem>
                        <SelectItem value="50m-plus">$50M+</SelectItem>
                        <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="stage">Company Stage</Label>
                    <Select disabled={!isEditing} value={user.company.stage}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pre-launch">Pre-launch (Idea stage)</SelectItem>
                        <SelectItem value="Startup (0-2 years)">Startup (0-2 years)</SelectItem>
                        <SelectItem value="Growth (3-5 years)">Growth stage (3-5 years)</SelectItem>
                        <SelectItem value="Established (5+ years)">Established (5+ years)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Grant Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Grant Preferences</CardTitle>
                <CardDescription>
                  Customize your grant matching preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-base font-medium">Areas of Interest</Label>
                  <p className="text-sm text-gray-500 mb-3">Select all grant types that interest you</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {grantInterests.map((interest) => (
                      <label key={interest} className="flex items-center space-x-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          defaultChecked={user.company.interests.includes(interest)}
                          disabled={!isEditing}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm">{interest}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-base font-medium">Preferred Grant Size</Label>
                  <RadioGroup defaultValue="no-preference" disabled={!isEditing} className="mt-3">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="under-25k" id="under-25k" />
                      <Label htmlFor="under-25k">Under $25K</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="25k-100k" id="25k-100k" />
                      <Label htmlFor="25k-100k">$25K - $100K</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="100k-500k" id="100k-500k" />
                      <Label htmlFor="100k-500k">$100K - $500K</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="500k-1m" id="500k-1m" />
                      <Label htmlFor="500k-1m">$500K - $1M</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="1m-plus" id="1m-plus" />
                      <Label htmlFor="1m-plus">$1M+</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no-preference" id="no-preference" />
                      <Label htmlFor="no-preference">No preference</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location">Primary Location</Label>
                    <Input 
                      id="location" 
                      placeholder="City, State" 
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="complexity">Application Complexity Preference</Label>
                    <Select disabled={!isEditing}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select preference" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="simple">Simple applications only</SelectItem>
                        <SelectItem value="moderate">Moderate complexity okay</SelectItem>
                        <SelectItem value="complex">All complexity levels</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Document Library
                </CardTitle>
                <CardDescription>
                  Manage documents for your grant applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-6">
                  <p className="text-sm text-gray-500">{documents.length} documents stored</p>
                  <Button>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Document
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <FileText className="w-8 h-8 text-gray-400" />
                        <div>
                          <div className="font-medium">{doc.name}</div>
                          <div className="text-sm text-gray-500">
                            {doc.type} • {doc.size} • Uploaded {new Date(doc.uploaded).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          Share
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Team Members
                </CardTitle>
                <CardDescription>
                  Manage team access and permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-6">
                  <p className="text-sm text-gray-500">{teamMembers.length} team members</p>
                  <Button>
                    Invite Member
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">{member.name}</div>
                          <div className="text-sm text-gray-500">{member.email}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{member.role}</Badge>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Success Metrics Tab */}
          <TabsContent value="metrics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="text-2xl font-bold text-green-600">85%</div>
                  <div className="text-sm text-gray-500">Success Rate</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-2xl font-bold text-blue-600">12</div>
                  <div className="text-sm text-gray-500">Total Applications</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-2xl font-bold text-purple-600">$1.2M</div>
                  <div className="text-sm text-gray-500">Funding Secured</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-2xl font-bold text-orange-600">2.5</div>
                  <div className="text-sm text-gray-500">Avg Processing (mo)</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Performance Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  Performance charts and analytics would be displayed here
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
