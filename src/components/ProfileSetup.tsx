
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Building, MapPin, Users, Target, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { profileApi } from '@/utils/api';

interface ProfileSetupProps {
  onComplete: () => void;
}

const ProfileSetup = ({ onComplete }: ProfileSetupProps) => {
  const navigate = useNavigate();
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Check online status
  React.useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }

    if (!formData.industry) {
      newErrors.industry = 'Industry is required';
    }

    if (!formData.businessSize) {
      newErrors.businessSize = 'Business size is required';
    }

    if (formData.interests.length === 0) {
      newErrors.interests = 'Please select at least one area of interest';
    }

    if (formData.website && !formData.website.startsWith('http')) {
      newErrors.website = 'Website must start with http:// or https://';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInterestChange = (interest: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      interests: checked 
        ? [...prev.interests, interest]
        : prev.interests.filter(i => i !== interest)
    }));
    
    if (checked && errors.interests) {
      setErrors(prev => ({ ...prev, interests: '' }));
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isOffline) {
      toast.error('You are offline. Please check your internet connection and try again.');
      return;
    }
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    console.log('Starting profile creation with Supabase');

    try {
      const startTime = Date.now();
      
      // Check auth status first
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      
      if (authError || !session) {
        throw new Error('Authentication expired. Please refresh and login again.');
      }

      const profileData = {
        companyName: formData.companyName,
        industry: formData.industry,
        businessSize: formData.businessSize,
        location: formData.location || '',
        website: formData.website || '',
        description: formData.description || '',
        fundingNeeds: formData.fundingNeeds || '',
        interests: formData.interests,
      };

      console.log('Saving profile data to Supabase:', profileData);

      const result = await profileApi.setup(profileData);
      const duration = Date.now() - startTime;
      
      console.log(`Profile creation completed in ${duration}ms`);
      
      if (result.success) {
        console.log('Profile created successfully');
        setShowSuccess(true);
        toast.success('Profile created successfully!');
        
        setTimeout(() => {
          onComplete();
          navigate('/dashboard');
        }, 1500);
      } else {
        throw new Error(result.error || 'Failed to create profile');
      }
    } catch (error) {
      console.error('Profile setup error:', error);
      
      let errorMessage = 'Failed to create profile. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('timeout')) {
          errorMessage = 'Request timeout. Please check your connection and try again.';
        } else if (error.message.includes('Authentication expired')) {
          errorMessage = error.message;
          // Redirect to login after a delay
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        } else if (error.message.includes('offline') || error.message.includes('network')) {
          errorMessage = 'Network error. Please check your internet connection.';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast.error(errorMessage);
    } finally {
      if (!showSuccess) {
        setIsSubmitting(false);
      }
    }
  };

  const handleRetry = () => {
    console.log('Retrying profile creation');
    handleSubmit(new Event('submit') as any);
  };

  // Show success state
  if (showSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Profile Created!
            </h2>
            <p className="text-slate-600 mb-4">
              Welcome to GrantSwipe! Redirecting you to your dashboard...
            </p>
            <LoadingSpinner size="md" className="justify-center" />
          </CardContent>
        </Card>
      </div>
    );
  }

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
          
          {isOffline && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-3 text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">You are offline. Please check your connection.</span>
            </div>
          )}
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
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    className={errors.companyName ? 'border-red-500' : ''}
                    disabled={isSubmitting || isOffline}
                    required
                  />
                  {errors.companyName && (
                    <p className="text-sm text-red-500 mt-1">{errors.companyName}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="https://example.com"
                    className={errors.website ? 'border-red-500' : ''}
                    disabled={isSubmitting || isOffline}
                  />
                  {errors.website && (
                    <p className="text-sm text-red-500 mt-1">{errors.website}</p>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="industry">Industry *</Label>
                  <Select 
                    value={formData.industry} 
                    onValueChange={(value) => handleInputChange('industry', value)}
                    disabled={isSubmitting || isOffline}
                  >
                    <SelectTrigger className={errors.industry ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select your industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {industries.map(industry => (
                        <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.industry && (
                    <p className="text-sm text-red-500 mt-1">{errors.industry}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="businessSize">Business Size *</Label>
                  <Select 
                    value={formData.businessSize} 
                    onValueChange={(value) => handleInputChange('businessSize', value)}
                    disabled={isSubmitting || isOffline}
                  >
                    <SelectTrigger className={errors.businessSize ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select business size" />
                    </SelectTrigger>
                    <SelectContent>
                      {businessSizes.map(size => (
                        <SelectItem key={size} value={size}>{size}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.businessSize && (
                    <p className="text-sm text-red-500 mt-1">{errors.businessSize}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="City, State/Province, Country"
                    className="pl-10"
                    disabled={isSubmitting || isOffline}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Company Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Brief description of your business and what you do..."
                  rows={3}
                  disabled={isSubmitting || isOffline}
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
                  onChange={(e) => handleInputChange('fundingNeeds', e.target.value)}
                  placeholder="What do you plan to use grant funding for? (e.g., equipment, research, expansion, etc.)"
                  rows={3}
                  disabled={isSubmitting || isOffline}
                />
              </div>
            </div>

            {/* Interests */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Users className="h-5 w-5" />
                Areas of Interest *
              </div>
              <p className="text-sm text-slate-600">Select areas that match your business focus</p>
              
              <div className="grid md:grid-cols-2 gap-3">
                {interestOptions.map(interest => (
                  <div key={interest} className="flex items-center space-x-2">
                    <Checkbox 
                      id={interest}
                      checked={formData.interests.includes(interest)}
                      onCheckedChange={(checked) => handleInterestChange(interest, checked as boolean)}
                      disabled={isSubmitting || isOffline}
                    />
                    <Label htmlFor={interest} className="text-sm font-normal">{interest}</Label>
                  </div>
                ))}
              </div>
              {errors.interests && (
                <p className="text-sm text-red-500">{errors.interests}</p>
              )}
            </div>

            <div className="space-y-3">
              <Button 
                type="submit" 
                className="w-full bg-blue-800 hover:bg-blue-900 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting || isOffline}
              >
                {isSubmitting ? (
                  <LoadingSpinner size="sm" text="Creating Profile..." />
                ) : (
                  'Complete Setup'
                )}
              </Button>

              {isSubmitting && (
                <div className="text-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRetry}
                    className="text-blue-600 hover:text-blue-800"
                    disabled={isOffline}
                  >
                    Taking too long? Click to retry
                  </Button>
                </div>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileSetup;
