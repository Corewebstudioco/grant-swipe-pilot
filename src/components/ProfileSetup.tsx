
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { profileApi } from '@/utils/api';
import { Building, MapPin, Users, Target } from 'lucide-react';

interface ProfileSetupProps {
  onComplete: () => void;
}

const ProfileSetup = ({ onComplete }: ProfileSetupProps) => {
  const [formData, setFormData] = useState({
    companyName: '',
    industry: '',
    businessSize: '',
    location: '',
    website: '',
    description: '',
    fundingNeeds: '',
    interests: [] as string[]
  });
  const [isLoading, setIsLoading] = useState(false);

  const industries = [
    'Technology', 'Healthcare', 'Finance', 'Education', 'Manufacturing',
    'Retail', 'Agriculture', 'Energy', 'Transportation', 'Construction',
    'Food & Beverage', 'Media & Entertainment', 'Non-profit', 'Other'
  ];

  const businessSizes = [
    '1-10 employees', '11-50 employees', '51-200 employees', 
    '201-500 employees', '501-1000 employees', '1000+ employees'
  ];

  const interestOptions = [
    'Research & Development', 'Business Expansion', 'Equipment Purchase',
    'Marketing & Sales', 'Training & Development', 'Technology Upgrade',
    'Export Development', 'Environmental Initiatives', 'Innovation',
    'Community Development', 'Cybersecurity', 'Digital Transformation'
  ];

  const handleInterestChange = (interest: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      interests: checked 
        ? [...prev.interests, interest]
        : prev.interests.filter(i => i !== interest)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await profileApi.setup(formData);
      if (response.error) {
        throw new Error(response.error);
      }
      
      toast.success('Profile created successfully!');
      onComplete();
    } catch (error) {
      console.error('Profile setup error:', error);
      toast.error('Failed to create profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Welcome to GrantSwipe! 🚀
          </CardTitle>
          <p className="text-slate-600 text-center">
            Let's set up your business profile to find the perfect grants for you
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Building className="h-5 w-5" />
                Company Information
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="https://example.com"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="industry">Industry *</Label>
                  <Select value={formData.industry} onValueChange={(value) => setFormData(prev => ({ ...prev, industry: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {industries.map(industry => (
                        <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="businessSize">Business Size *</Label>
                  <Select value={formData.businessSize} onValueChange={(value) => setFormData(prev => ({ ...prev, businessSize: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select business size" />
                    </SelectTrigger>
                    <SelectContent>
                      {businessSizes.map(size => (
                        <SelectItem key={size} value={size}>{size}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="City, State/Province, Country"
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Company Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of your business and what you do..."
                  rows={3}
                />
              </div>
            </div>

            {/* Funding Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Target className="h-5 w-5" />
                Funding Information
              </div>
              
              <div>
                <Label htmlFor="fundingNeeds">Funding Needs</Label>
                <Textarea
                  id="fundingNeeds"
                  value={formData.fundingNeeds}
                  onChange={(e) => setFormData(prev => ({ ...prev, fundingNeeds: e.target.value }))}
                  placeholder="What do you plan to use grant funding for? (e.g., equipment, research, expansion, etc.)"
                  rows={3}
                />
              </div>
            </div>

            {/* Interests */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Users className="h-5 w-5" />
                Areas of Interest
              </div>
              <p className="text-sm text-slate-600">Select areas that match your business focus</p>
              
              <div className="grid md:grid-cols-2 gap-3">
                {interestOptions.map(interest => (
                  <div key={interest} className="flex items-center space-x-2">
                    <Checkbox 
                      id={interest}
                      checked={formData.interests.includes(interest)}
                      onCheckedChange={(checked) => handleInterestChange(interest, checked as boolean)}
                    />
                    <Label htmlFor={interest} className="text-sm font-normal">{interest}</Label>
                  </div>
                ))}
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-blue-800 hover:bg-blue-900"
              disabled={isLoading || !formData.companyName || !formData.industry || !formData.businessSize}
            >
              {isLoading ? 'Creating Profile...' : 'Complete Setup'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileSetup;
