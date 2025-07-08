
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
import { Building, MapPin, Users, Target, CheckCircle } from 'lucide-react';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { addDocument } from '@/utils/firebase';
import { useNavigate } from 'react-router-dom';

interface ProfileSetupProps {
  onComplete: () => void;
}

const ProfileSetup = ({ onComplete }: ProfileSetupProps) => {
  const { user, loading: authLoading } = useFirebaseAuth();
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
  const [submitTimeout, setSubmitTimeout] = useState<NodeJS.Timeout | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);

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
    
    // Clear interest error if user selects at least one
    if (checked && errors.interests) {
      setErrors(prev => ({ ...prev, interests: '' }));
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    if (!user) {
      toast.error('You must be logged in to create a profile');
      return;
    }

    if (isSubmitting) {
      return; // Prevent double submission
    }

    setIsSubmitting(true);
    console.log('Starting profile creation for user:', user.uid);

    // Set a timeout for long-running requests
    const timeoutId = setTimeout(() => {
      toast.error("Profile creation is taking longer than expected. Please check your connection.");
      setIsSubmitting(false);
    }, 15000);
    
    setSubmitTimeout(timeoutId);

    try {
      const startTime = Date.now();
      const profileData = {
        userId: user.uid,
        email: user.email,
        companyName: formData.companyName,
        industry: formData.industry,
        businessSize: formData.businessSize,
        location: formData.location || '',
        website: formData.website || '',
        description: formData.description || '',
        fundingNeeds: formData.fundingNeeds || '',
        interests: formData.interests,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log('Saving profile data:', profileData);

      const result = await addDocument('profiles', profileData);
      const duration = Date.now() - startTime;
      
      console.log(`Profile creation completed in ${duration}ms`);
      
      if (result.success) {
        console.log('Profile created successfully, showing success state');
        setShowSuccess(true);
        toast.success('Profile created successfully!');
        
        // Show success state briefly before navigating
        setTimeout(() => {
          onComplete();
          navigate('/dashboard');
        }, 1500);
      } else {
        throw new Error(result.error || 'Failed to create profile');
      }
    } catch (error) {
      console.error('Profile setup error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create profile. Please try again.';
      toast.error(errorMessage);
    } finally {
      if (submitTimeout) {
        clearTimeout(submitTimeout);
        setSubmitTimeout(null);
      }
      if (!showSuccess) {
        setIsSubmitting(false);
      }
    }
  };

  const handleRetry = () => {
    console.log('Retrying profile creation');
    handleSubmit(new Event('submit') as any);
  };

  // Show loading skeleton while auth is loading
  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mx-auto" />
            <Skeleton className="h-4 w-2/3 mx-auto mt-2" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Skeleton className="h-6 w-48" />
              <div className="grid md:grid-cols-2 gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
                    disabled={isSubmitting}
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
                    disabled={isSubmitting}
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
                    disabled={isSubmitting}
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
                    disabled={isSubmitting}
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
                    disabled={isSubmitting}
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
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
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
                      disabled={isSubmitting}
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
                disabled={isSubmitting}
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
