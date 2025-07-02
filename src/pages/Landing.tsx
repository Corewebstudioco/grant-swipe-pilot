
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Search, Settings, Star, CheckCircle, Users, TrendingUp, Zap, Shield, Award, Play, ChevronDown } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { useEffect, useState } from "react";

const Landing = () => {
  const { isAuthenticated } = useUser();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [animatedStats, setAnimatedStats] = useState({
    grants: 0,
    applications: 0,
    success: 0
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    setIsVisible(true);
    
    // Animate statistics
    const timer = setTimeout(() => {
      const duration = 2000;
      const steps = 60;
      const stepTime = duration / steps;
      let step = 0;

      const interval = setInterval(() => {
        step++;
        const progress = step / steps;
        const easeOut = 1 - Math.pow(1 - progress, 3);
        
        setAnimatedStats({
          grants: Math.floor(easeOut * 2000000),
          applications: Math.floor(easeOut * 10000),
          success: Math.floor(easeOut * 85)
        });

        if (step >= steps) {
          clearInterval(interval);
        }
      }, stepTime);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const testimonials = [
    {
      name: "Sarah Chen",
      company: "TechStartup Inc",
      amount: "$150K",
      quote: "GrantSwipe helped us find and secure funding in just 3 weeks. The AI matching is incredible!",
      avatar: "SC"
    },
    {
      name: "Marcus Rodriguez",
      company: "Green Energy Co",
      amount: "$250K",
      quote: "We went from hours of research to minutes. Already secured two grants this quarter.",
      avatar: "MR"
    },
    {
      name: "Jennifer Kim",
      company: "HealthTech Solutions",
      amount: "$500K",
      quote: "The application assistance is game-changing. Our success rate improved by 300%.",
      avatar: "JK"
    }
  ];

  const faqs = [
    {
      question: "How does the AI matching work?",
      answer: "Our AI analyzes your business profile, industry, size, and funding needs to match you with the most relevant grants. It considers eligibility requirements, deadlines, and historical success rates."
    },
    {
      question: "What types of grants are available?",
      answer: "We cover federal, state, local, and private foundation grants across industries including R&D, expansion, hiring, equipment, sustainability, and innovation projects."
    },
    {
      question: "How much does GrantSwipe cost?",
      answer: "We offer a free plan with basic features, and paid plans starting at $29/month for advanced matching and application assistance."
    },
    {
      question: "What's your success rate?",
      answer: "Our users see an average 85% improvement in grant application success rates compared to traditional methods."
    }
  ];

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-green-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-green-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-800 to-green-500 rounded-lg flex items-center justify-center transform hover:scale-110 transition-transform duration-200">
              <span className="text-white font-bold text-sm">G$</span>
            </div>
            <span className="text-xl font-bold text-slate-900">GrantSwipe</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-slate-600 hover:text-slate-900 transition-colors hover:scale-105 transform duration-200">Features</a>
            <a href="#pricing" className="text-slate-600 hover:text-slate-900 transition-colors hover:scale-105 transform duration-200">Pricing</a>
            <a href="#testimonials" className="text-slate-600 hover:text-slate-900 transition-colors hover:scale-105 transform duration-200">Success Stories</a>
            <Link to="/login" className="text-slate-600 hover:text-slate-900 transition-colors hover:scale-105 transform duration-200">Login</Link>
            <Link to="/signup">
              <Button className="bg-blue-800 hover:bg-blue-900 text-white transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl">
                Sign Up
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 relative">
        <div className="container mx-auto text-center max-w-4xl">
          {/* Social Proof Badges */}
          <div className={`flex justify-center gap-4 mb-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">
              <Award className="w-3 h-3 mr-1" />
              Y Combinator
            </Badge>
            <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">
              <Star className="w-3 h-3 mr-1" />
              TechCrunch Featured
            </Badge>
            <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">
              <Shield className="w-3 h-3 mr-1" />
              SOC 2 Certified
            </Badge>
          </div>

          <h1 className={`text-5xl md:text-6xl font-bold text-slate-900 mb-6 transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            Find Perfect Grants in 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-800 to-green-500 animate-pulse"> Minutes</span>, Not Months
          </h1>
          
          <p className={`text-xl text-slate-600 mb-8 max-w-2xl mx-auto transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            Swipe through thousands of grants tailored to your business. When you find a match, our AI helps you apply.
          </p>
          
          <div className={`flex flex-col sm:flex-row gap-4 justify-center mb-12 transition-all duration-1000 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <Link to="/signup">
              <Button size="lg" className="bg-blue-800 hover:bg-blue-900 text-white px-8 py-3 text-lg transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl">
                Start Swiping
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="px-8 py-3 text-lg border-2 border-slate-300 hover:border-slate-400 transform hover:scale-105 transition-all duration-200 group">
              <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
              Watch Demo
            </Button>
          </div>

          {/* Animated Dashboard Mockup */}
          <div className={`relative max-w-4xl mx-auto transition-all duration-1000 delay-800 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl p-8 shadow-2xl transform hover:scale-105 transition-transform duration-500">
              <div className="bg-white rounded-lg p-6 shadow-lg">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center animate-pulse">
                    <Search className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-slate-900">Smart Grant Discovery</div>
                    <div className="text-slate-600 text-sm">AI-powered matching in action</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg hover:bg-green-100 transition-colors duration-200 cursor-pointer">
                    <div className="text-green-800 font-semibold">$50K Match</div>
                    <div className="text-green-600 text-sm flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                      95% compatibility
                    </div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg hover:bg-blue-100 transition-colors duration-200 cursor-pointer">
                    <div className="text-blue-800 font-semibold">$25K Grant</div>
                    <div className="text-blue-600 text-sm flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
                      88% compatibility
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-16 px-4 bg-slate-50">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-8">The Grant Search Problem</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-600 text-2xl">😤</span>
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Endless Searching</h3>
              <p className="text-slate-600">Businesses waste 40+ hours per month searching through irrelevant grants</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-orange-600 text-2xl">📋</span>
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Complex Applications</h3>
              <p className="text-slate-600">Grant applications are confusing, with 73% being rejected due to poor preparation</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-yellow-600 text-2xl">⏰</span>
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Missed Deadlines</h3>
              <p className="text-slate-600">Most businesses miss 60% of relevant opportunities due to poor tracking</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">How GrantSwipe Works</h2>
            <p className="text-xl text-slate-600">From setup to funding in 4 simple steps</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: 1, title: "Create Profile", desc: "Tell us about your business in 5 minutes", icon: Users },
              { step: 2, title: "AI Matching", desc: "Our AI finds grants perfect for you", icon: Zap },
              { step: 3, title: "Swipe & Apply", desc: "Swipe through matches, apply with one click", icon: Search },
              { step: 4, title: "Get Funded", desc: "Track applications and celebrate success", icon: TrendingUp }
            ].map((item, index) => (
              <div key={index} className="text-center group hover:scale-105 transition-transform duration-300">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-800 to-green-500 rounded-full flex items-center justify-center mx-auto group-hover:rotate-12 transition-transform duration-300">
                    <item.icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-sm font-bold text-slate-900">{item.step}</span>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section id="features" className="py-20 px-4 bg-slate-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Grant Discovery Made Simple
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Our AI-powered platform transforms the tedious grant search process into an engaging, efficient experience.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group hover:-translate-y-2">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Search className="h-8 w-8 text-blue-600 group-hover:rotate-12 transition-transform duration-300" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-4">Smart Matching</h3>
                <p className="text-slate-600 mb-4">
                  Our AI analyzes your business profile and matches you with the most relevant grants, saving hours of manual searching.
                </p>
                <div className="text-sm text-green-600 font-semibold">95% accuracy rate</div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group hover:-translate-y-2">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <ArrowRight className="h-8 w-8 text-green-600 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-4">One-Click Apply</h3>
                <p className="text-slate-600 mb-4">
                  Streamlined application process with pre-filled forms and intelligent suggestions to maximize your success rate.
                </p>
                <div className="text-sm text-green-600 font-semibold">5x faster applications</div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group hover:-translate-y-2">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Settings className="h-8 w-8 text-purple-600 group-hover:rotate-90 transition-transform duration-300" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-4">Track Success</h3>
                <p className="text-slate-600 mb-4">
                  Monitor your application progress with real-time updates and analytics to improve your grant success rate.
                </p>
                <div className="text-sm text-green-600 font-semibold">Real-time tracking</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Animated Statistics */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center">
          <p className="text-slate-600 mb-8">Trusted by 500+ businesses</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center opacity-60 mb-12">
            {["TechCorp", "InnovateLab", "GrowthCo", "StartupXYZ"].map((company) => (
              <div key={company} className="bg-slate-100 rounded-lg p-6 font-semibold text-slate-700 hover:bg-slate-200 transition-colors duration-200 cursor-pointer">
                {company}
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center group hover:scale-105 transition-transform duration-300">
              <div className="text-4xl font-bold text-green-600 mb-2">
                ${animatedStats.grants.toLocaleString()}+
              </div>
              <div className="text-slate-600">in grants secured</div>
            </div>
            <div className="text-center group hover:scale-105 transition-transform duration-300">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {animatedStats.applications.toLocaleString()}+
              </div>
              <div className="text-slate-600">applications submitted</div>
            </div>
            <div className="text-center group hover:scale-105 transition-transform duration-300">
              <div className="text-4xl font-bold text-purple-600 mb-2">
                {animatedStats.success}%
              </div>
              <div className="text-slate-600">success rate improvement</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-4 bg-slate-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Success Stories</h2>
            <p className="text-xl text-slate-600">See how businesses like yours are winning with GrantSwipe</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group hover:-translate-y-2">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-800 to-green-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">{testimonial.name}</div>
                      <div className="text-sm text-slate-600">{testimonial.company}</div>
                    </div>
                    <div className="ml-auto">
                      <Badge className="bg-green-100 text-green-800">{testimonial.amount}</Badge>
                    </div>
                  </div>
                  <p className="text-slate-700 italic">"{testimonial.quote}"</p>
                  <div className="flex mt-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-slate-600">Choose the plan that's right for your business</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Free Plan */}
            <Card className="border-2 border-slate-200 hover:border-blue-300 transition-colors duration-300">
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Free</h3>
                <div className="text-3xl font-bold text-slate-900 mb-4">$0<span className="text-sm font-normal text-slate-600">/month</span></div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center text-slate-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    5 grant swipes per month
                  </li>
                  <li className="flex items-center text-slate-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Basic matching
                  </li>
                  <li className="flex items-center text-slate-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Email support
                  </li>
                </ul>
                <Button variant="outline" className="w-full">Get Started</Button>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="border-2 border-blue-500 shadow-lg hover:shadow-xl transition-all duration-300 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-500 text-white">Most Popular</Badge>
              </div>
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Professional</h3>
                <div className="text-3xl font-bold text-slate-900 mb-4">$99<span className="text-sm font-normal text-slate-600">/month</span></div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center text-slate-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Unlimited swipes
                  </li>
                  <li className="flex items-center text-slate-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    AI application assistance
                  </li>
                  <li className="flex items-center text-slate-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Team collaboration
                  </li>
                  <li className="flex items-center text-slate-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Priority support
                  </li>
                </ul>
                <Button className="w-full bg-blue-800 hover:bg-blue-900">Start Free Trial</Button>
              </CardContent>
            </Card>

            {/* Enterprise Plan */}
            <Card className="border-2 border-slate-200 hover:border-green-300 transition-colors duration-300">
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Enterprise</h3>
                <div className="text-3xl font-bold text-slate-900 mb-4">Custom</div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center text-slate-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Everything in Professional
                  </li>
                  <li className="flex items-center text-slate-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Custom integrations
                  </li>
                  <li className="flex items-center text-slate-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Dedicated account manager
                  </li>
                  <li className="flex items-center text-slate-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    SLA guarantee
                  </li>
                </ul>
                <Button variant="outline" className="w-full">Contact Sales</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-slate-600">Everything you need to know about GrantSwipe</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="border border-slate-200 hover:shadow-md transition-shadow duration-200">
                <CardContent className="p-0">
                  <button
                    className="w-full p-6 text-left flex items-center justify-between hover:bg-slate-50 transition-colors duration-200"
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  >
                    <h3 className="font-semibold text-slate-900">{faq.question}</h3>
                    <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-200 ${openFaq === index ? 'rotate-180' : ''}`} />
                  </button>
                  {openFaq === index && (
                    <div className="px-6 pb-6">
                      <p className="text-slate-600">{faq.answer}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-800 to-green-500 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Grant Strategy?</h2>
          <p className="text-xl mb-8 text-blue-100">Join hundreds of businesses already winning with GrantSwipe</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link to="/signup">
              <Button size="lg" className="bg-white text-blue-800 hover:bg-slate-100 px-8 py-3 text-lg transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl">
                Start Your Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-800 px-8 py-3 text-lg transform hover:scale-105 transition-all duration-200">
              Schedule Demo
            </Button>
          </div>

          <p className="text-sm text-blue-100">No credit card required • 14-day free trial • Cancel anytime</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-green-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">G$</span>
                </div>
                <span className="text-xl font-bold">GrantSwipe</span>
              </div>
              <p className="text-slate-400">
                Making grant discovery and application simple for businesses everywhere.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
            <p>&copy; 2024 GrantSwipe. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
