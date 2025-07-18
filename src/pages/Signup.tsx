import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { useUser } from "@/contexts/UserContext";
import { supabase } from "@/integrations/supabase/client";

const Signup = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [signupTimeout, setSignupTimeout] = useState<NodeJS.Timeout | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    companyName: "",
    industry: "",
    companySize: "",
    companyStage: "",
    interests: [] as string[]
  });

  const { user, isAuthenticated } = useUser();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (signupTimeout) {
        clearTimeout(signupTimeout);
      }
    };
  }, [signupTimeout]);

  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  // Validate current step
  const canProceed = useMemo(() => {
    if (currentStep === 1) {
      return formData.fullName && 
             formData.email.includes('@') && 
             formData.password.length >= 6 && 
             formData.password === formData.confirmPassword;
    } else if (currentStep === 2) {
      return formData.companyName && 
             formData.industry && 
             formData.companySize && 
             formData.companyStage;
    } else if (currentStep === 3) {
      return formData.interests.length > 0;
    }
    return false;
  }, [currentStep, formData]);

  const handleNext = () => {
    // Validate current step
    if (currentStep === 1) {
      if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) {
        toast.error("Please fill in all fields");
        return;
      }
      if (!formData.email.includes('@')) {
        toast.error("Please enter a valid email address");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords don't match");
        return;
      }
      if (formData.password.length < 6) {
        toast.error("Password must be at least 6 characters");
        return;
      }
    } else if (currentStep === 2) {
      if (!formData.companyName || !formData.industry || !formData.companySize || !formData.companyStage) {
        toast.error("Please fill in all company information");
        return;
      }
    }

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleSubmit = async () => {
    if (formData.interests.length === 0) {
      toast.error("Please select at least one grant interest");
      return;
    }

    if (isLoading) {
      return; // Prevent double submission
    }

    setIsLoading(true);
    console.log('Starting signup process for:', formData.email);

    // Set a timeout for long-running requests
    const timeoutId = setTimeout(() => {
      toast.error("Signup is taking longer than expected. Please check your connection.");
      setIsLoading(false);
    }, 20000); // 20 second timeout for signup
    
    setSignupTimeout(timeoutId);

    try {
      const startTime = Date.now();
      const userData = {
        displayName: formData.fullName,
        companyName: formData.companyName,
        industry: formData.industry,
        companySize: formData.companySize,
        companyStage: formData.companyStage,
        interests: formData.interests
      };

      console.log('Creating user with data:', userData);

      // Use Supabase signup
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: userData
        }
      });
      
      const result = { success: !error, user: data.user, error };
      const duration = Date.now() - startTime;
      
      console.log(`Signup attempt completed in ${duration}ms`);
      
      if (result.success) {
        console.log('Account created successfully');
        toast.success("Account created successfully! Welcome to GrantSwipe!");
        // The useEffect hook will handle the redirect when authentication state changes
      } else {
        console.error('Signup error:', result.error);
        
        if (result.error?.code === 'auth/email-already-in-use') {
          toast.error("An account with this email already exists");
        } else if (result.error?.code === 'auth/weak-password') {
          toast.error("Password is too weak. Please choose a stronger password.");
        } else if (result.error?.code === 'auth/network-request-failed') {
          toast.error("Network error. Please check your internet connection.");
        } else if (result.error?.message) {
          toast.error(result.error.message);
        } else {
          toast.error("Failed to create account. Please try again.");
        }
      }
    } catch (error) {
      console.error('Unexpected signup error:', error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      if (signupTimeout) {
        clearTimeout(signupTimeout);
        setSignupTimeout(null);
      }
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    console.log('Retrying signup');
    handleSubmit();
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          placeholder="Your full name"
          value={formData.fullName}
          onChange={(e) => handleInputChange("fullName", e.target.value)}
          className="h-11"
          disabled={isLoading}
          autoComplete="name"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          placeholder="your@email.com"
          value={formData.email}
          onChange={(e) => handleInputChange("email", e.target.value)}
          className="h-11"
          disabled={isLoading}
          autoComplete="email"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Create a strong password (min 6 characters)"
          value={formData.password}
          onChange={(e) => handleInputChange("password", e.target.value)}
          className="h-11"
          disabled={isLoading}
          autoComplete="new-password"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="Confirm your password"
          value={formData.confirmPassword}
          onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
          className="h-11"
          disabled={isLoading}
          autoComplete="new-password"
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="companyName">Company Name</Label>
        <Input
          id="companyName"
          placeholder="Your company name"
          value={formData.companyName}
          onChange={(e) => handleInputChange("companyName", e.target.value)}
          className="h-11"
          disabled={isLoading}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="industry">Industry</Label>
        <select
          id="industry"
          value={formData.industry}
          onChange={(e) => handleInputChange("industry", e.target.value)}
          className="w-full h-11 px-3 py-2 border border-input bg-background rounded-md text-sm disabled:opacity-50"
          disabled={isLoading}
        >
          <option value="">Select your industry</option>
          <option value="Technology">Technology</option>
          <option value="Healthcare">Healthcare</option>
          <option value="Manufacturing">Manufacturing</option>
          <option value="Retail">Retail</option>
          <option value="Professional Services">Professional Services</option>
          <option value="Non-profit">Non-profit</option>
          <option value="Education">Education</option>
          <option value="Other">Other</option>
        </select>
      </div>
      
      <div className="space-y-2">
        <Label>Company Size</Label>
        <div className="space-y-2">
          {[
            "1-10 employees",
            "11-50 employees", 
            "51-200 employees",
            "201-500 employees",
            "500+ employees"
          ].map((size) => (
            <div key={size} className="flex items-center space-x-2">
              <input
                type="radio"
                id={size}
                name="companySize"
                value={size}
                checked={formData.companySize === size}
                onChange={(e) => handleInputChange("companySize", e.target.value)}
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 disabled:opacity-50"
                disabled={isLoading}
              />
              <Label htmlFor={size} className="text-sm font-normal cursor-pointer">
                {size}
              </Label>
            </div>
          ))}
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="companyStage">Company Stage</Label>
        <select
          id="companyStage"
          value={formData.companyStage}
          onChange={(e) => handleInputChange("companyStage", e.target.value)}
          className="w-full h-11 px-3 py-2 border border-input bg-background rounded-md text-sm disabled:opacity-50"
          disabled={isLoading}
        >
          <option value="">Select company stage</option>
          <option value="Startup (0-2 years)">Startup (0-2 years)</option>
          <option value="Growth (3-5 years)">Growth (3-5 years)</option>
          <option value="Established (5+ years)">Established (5+ years)</option>
        </select>
      </div>
    </div>
  );

  const renderStep3 = () => {
    const interests = [
      "Research & Development",
      "Business Expansion",
      "Hiring & Training",
      "Equipment & Technology",
      "Export Development",
      "Sustainability/Green Initiatives",
      "Innovation Projects"
    ];

    return (
      <div className="space-y-4">
        <div>
          <Label className="text-base font-medium">Grant Interests</Label>
          <p className="text-sm text-slate-600 mb-4">
            Select the types of grants you're most interested in:
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-3">
          {interests.map((interest) => (
            <div key={interest} className="flex items-center space-x-3">
              <input
                type="checkbox"
                id={interest}
                checked={formData.interests.includes(interest)}
                onChange={() => handleInterestToggle(interest)}
                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 disabled:opacity-50"
                disabled={isLoading}
              />
              <Label htmlFor={interest} className="text-sm font-normal cursor-pointer">
                {interest}
              </Label>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex">
      {/* Left side - Value proposition */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-800 to-blue-900 text-white p-12 flex-col justify-center">
        <div className="max-w-md">
          <h1 className="text-4xl font-bold mb-6">
            Join thousands of businesses finding perfect grants
          </h1>
          <p className="text-xl text-blue-100 mb-8">
            Our AI-powered platform has helped secure over $2M in grant funding. Start your journey today.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">✓</span>
              </div>
              <span>Smart grant matching based on your profile</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">✓</span>
              </div>
              <span>AI-assisted application writing</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">✓</span>
              </div>
              <span>Real-time application tracking</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-800 to-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">G$</span>
              </div>
              <span className="text-2xl font-bold text-slate-900">GrantSwipe</span>
            </Link>
          </div>

          <Card className="border-0 shadow-xl">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold text-slate-900">
                Create your account
              </CardTitle>
              <p className="text-slate-600">
                Step {currentStep} of {totalSteps}
              </p>
              <Progress value={progress} className="mt-4" />
            </CardHeader>
            
            <CardContent className="space-y-6">
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
              
              <div className="flex gap-3">
                {currentStep > 1 && (
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    className="flex-1 h-11"
                    disabled={isLoading}
                  >
                    Previous
                  </Button>
                )}
                
                <Button
                  onClick={currentStep === totalSteps ? handleSubmit : handleNext}
                  disabled={isLoading || !canProceed}
                  className="flex-1 h-11 bg-blue-800 hover:bg-blue-900 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <LoadingSpinner size="sm" text="Creating Account..." />
                  ) : (
                    currentStep === totalSteps ? "Create Account" : "Continue"
                  )}
                </Button>
              </div>

              {isLoading && (
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
              
              {currentStep === 1 && (
                <>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-slate-500">Or sign up with</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" className="h-11" disabled={isLoading}>
                      Google
                    </Button>
                    <Button variant="outline" className="h-11" disabled={isLoading}>
                      LinkedIn
                    </Button>
                  </div>
                </>
              )}
              
              <div className="text-center">
                <span className="text-slate-600">Already have an account? </span>
                <Link
                  to="/login"
                  className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  Sign in
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Signup;
