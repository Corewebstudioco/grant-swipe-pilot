
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { useState } from "react";

const Signup = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    companyName: "",
    yourName: "",
    email: "",
    password: "",
    industry: "",
    companySize: "",
    location: "",
    grantInterests: [] as string[]
  });

  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  const handleNext = () => {
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
      grantInterests: prev.grantInterests.includes(interest)
        ? prev.grantInterests.filter(i => i !== interest)
        : [...prev.grantInterests, interest]
    }));
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="companyName">Company Name</Label>
        <Input
          id="companyName"
          placeholder="Your company name"
          value={formData.companyName}
          onChange={(e) => handleInputChange("companyName", e.target.value)}
          className="h-11"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="yourName">Your Name</Label>
        <Input
          id="yourName"
          placeholder="Your full name"
          value={formData.yourName}
          onChange={(e) => handleInputChange("yourName", e.target.value)}
          className="h-11"
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
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Create a strong password"
          value={formData.password}
          onChange={(e) => handleInputChange("password", e.target.value)}
          className="h-11"
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="industry">Industry</Label>
        <select
          id="industry"
          value={formData.industry}
          onChange={(e) => handleInputChange("industry", e.target.value)}
          className="w-full h-11 px-3 py-2 border border-input bg-background rounded-md text-sm"
        >
          <option value="">Select your industry</option>
          <option value="technology">Technology</option>
          <option value="healthcare">Healthcare</option>
          <option value="manufacturing">Manufacturing</option>
          <option value="retail">Retail</option>
          <option value="education">Education</option>
          <option value="finance">Finance</option>
          <option value="other">Other</option>
        </select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="companySize">Company Size</Label>
        <select
          id="companySize"
          value={formData.companySize}
          onChange={(e) => handleInputChange("companySize", e.target.value)}
          className="w-full h-11 px-3 py-2 border border-input bg-background rounded-md text-sm"
        >
          <option value="">Select company size</option>
          <option value="1-10">1-10 employees</option>
          <option value="11-50">11-50 employees</option>
          <option value="51-200">51-200 employees</option>
          <option value="201-500">201-500 employees</option>
          <option value="500+">500+ employees</option>
        </select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          placeholder="City, State/Country"
          value={formData.location}
          onChange={(e) => handleInputChange("location", e.target.value)}
          className="h-11"
        />
      </div>
    </div>
  );

  const renderStep3 = () => {
    const interests = [
      "Research & Development",
      "Business Expansion",
      "Hiring & Training",
      "Technology Innovation",
      "Export Development",
      "Environmental Initiatives",
      "Small Business Support",
      "Minority/Women-Owned Business"
    ];

    return (
      <div className="space-y-4">
        <div>
          <Label className="text-base font-medium">Grant Interests</Label>
          <p className="text-sm text-slate-600 mb-4">
            Select the types of grants you're most interested in (select all that apply):
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-3">
          {interests.map((interest) => (
            <div key={interest} className="flex items-center space-x-3">
              <input
                type="checkbox"
                id={interest}
                checked={formData.grantInterests.includes(interest)}
                onChange={() => handleInterestToggle(interest)}
                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
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
                  >
                    Previous
                  </Button>
                )}
                
                <Button
                  onClick={currentStep === totalSteps ? () => console.log("Sign up!") : handleNext}
                  className="flex-1 h-11 bg-blue-800 hover:bg-blue-900 text-white"
                >
                  {currentStep === totalSteps ? "Create Account" : "Continue"}
                </Button>
              </div>
              
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
                    <Button variant="outline" className="h-11">
                      Google
                    </Button>
                    <Button variant="outline" className="h-11">
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
