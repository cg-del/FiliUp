import React, { useState, useEffect, useCallback, useRef, useMemo, memo } from 'react';
import { Menu, X, BookOpen, Users, Target, Trophy, ChevronDown, CheckCircle, TrendingUp, Share2, Facebook, Twitter, Linkedin, Instagram, Star, Send, ChevronLeft, ChevronRight, PlayCircle, Plus, Minus, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';

// Navigation items
const navigation = [
  { name: 'Features', href: '#features', icon: <CheckCircle className="mr-2 h-4 w-4" /> },
  { name: 'Phases', href: '#levels', icon: <BookOpen className="mr-2 h-4 w-4" /> },
  { name: 'Activities', href: '#activities', icon: <Target className="mr-2 h-4 w-4" /> },
  { name: 'About', href: '#about', icon: <Star className="mr-2 h-4 w-4" /> },
];

// Features
const features = [
  {
    name: 'Interactive Lessons',
    description: 'Mag-aral ng Bahagi ng Pananalita sa pamamagitan ng interactive activities',
    icon: <BookOpen className="h-10 w-10 text-white" />,
    bgColor: 'bg-emerald-500',
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=500&h=300&fit=crop',
  },
  {
    name: 'Four Activity Types',
    description: 'Multiple Choice, Drag & Drop, Matching Pairs, at Story Comprehension',
    icon: <Target className="h-10 w-10 text-white" />,
    bgColor: 'bg-green-500',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=500&h=300&fit=crop',
  },
  {
    name: 'Progress Tracking',
    description: 'Subaybayan ang inyong progress at makakuha ng mga rewards',
    icon: <TrendingUp className="h-10 w-10 text-white" />,
    bgColor: 'bg-emerald-600',
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=500&h=300&fit=crop',
  },
  {
    name: 'Multi-Role System',
    description: 'Admin, Teacher, at Student roles na may kanya-kanyang features',
    icon: <Users className="h-10 w-10 text-white" />,
    bgColor: 'bg-green-600',
    image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=500&h=300&fit=crop',
  },
];

// Stats
const stats = [
  { label: 'Mga Estudyante', value: '1000', display: '1,000+' },
  { label: 'Mga Guro', value: '50', display: '50+' },
  { label: 'Mga Paaralan', value: '20', display: '20+' },
  { label: 'Success Rate', value: '95', display: '95%' },
];

// FAQs
const faqs = [
  {
    question: 'Paano mag-start sa FiliUp?',
    answer: 'Mag-register lang kayo bilang student o teacher, at magsisimula na kayo sa Level 1 - Pangngalan. Ang platform ay user-friendly at may mga tutorial para sa mga baguhan.',
  },
  {
    question: 'Ano ang mga uri ng activities?',
    answer: 'May apat na uri ng activities: Multiple Choice, Drag & Drop, Matching Pairs, at Story Comprehension. Lahat ng ito ay interactive at engaging para sa mga bata.',
  },
  {
    question: 'May bayad ba ang FiliUp?',
    answer: 'Ang basic features ay libre para sa lahat. May premium features din kami para sa mga guro na gusto ng mas advanced na tools.',
  },
];

// Memoized Feature Card
const FeatureCard = memo(({ feature, idx, currentFeature, setCurrentFeature }: { 
  feature: any; 
  idx: number; 
  currentFeature: number; 
  setCurrentFeature: (idx: number) => void; 
}) => (
  <div
    className={`w-full flex-shrink-0 lg:flex lg:items-center lg:gap-x-12 p-8 transition-all duration-500 ${
      idx === currentFeature ? 'opacity-100 scale-100' : 'opacity-50 scale-95'
    }`}
  >
    <div className="lg:w-1/2">
      <div className={`inline-flex rounded-full p-4 ${feature.bgColor} shadow-md mb-6 transform hover:scale-110 transition-transform duration-300`}>
        {feature.icon}
      </div>
      <h3 className="text-2xl font-bold text-gray-900">{feature.name}</h3>
      <p className="mt-4 text-gray-600">{feature.description}</p>
      <button
        onClick={() => setCurrentFeature(idx)}
        className="mt-6 text-sm font-medium text-emerald-600 hover:text-emerald-800 flex items-center"
      >
        Matuto pa <ChevronRight className="ml-1 h-4 w-4" />
      </button>
    </div>
    <div className="mt-8 lg:mt-0 lg:w-1/2">
      <img
        src={feature.image}
        alt={`${feature.name} screenshot`}
        className="w-full h-64 object-cover rounded-lg shadow-md transform hover:scale-105 transition-transform duration-300"
        loading="lazy"
      />
    </div>
  </div>
));

export const LandingPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [currentFeature, setCurrentFeature] = useState(0);
  const [progress, setProgress] = useState(0);
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [visibleSections, setVisibleSections] = useState({});

  // Handle scroll for header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-rotate feature carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
      setProgress(0);
    }, 5000);
    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 2, 100));
    }, 100);
    return () => {
      clearInterval(interval);
      clearInterval(progressInterval);
    };
  }, []);

  // Smooth scroll handler
  const handleSmoothScroll = useCallback((e, href) => {
    e.preventDefault();
    const targetId = href.replace('#', '');
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setMobileMenuOpen(false);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className={`fixed inset-x-0 top-0 z-40 transition-all duration-300 ${scrolled ? 'bg-card/95 backdrop-blur-md shadow-md' : 'bg-card'}`}>
        <nav className="flex items-center justify-between p-4 lg:px-8 max-w-7xl mx-auto">
          <div className="flex lg:flex-1">
            <a href="#" className="flex items-center group">
              <div className="h-12 w-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                <BookOpen className="h-7 w-7 text-white" />
              </div>
              <span className="ml-3 text-2xl font-extrabold text-primary group-hover:text-primary/80 transition-colors">FiliUp</span>
            </a>
          </div>
          <div className="flex lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
            >
              <Menu className="h-7 w-7" />
            </button>
          </div>
          <div className="hidden lg:flex lg:gap-x-8">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={(e) => handleSmoothScroll(e, item.href)}
                className="relative text-sm font-semibold text-muted-foreground hover:text-primary group flex items-center px-4 py-2 rounded-lg transition-colors"
              >
                {React.cloneElement(item.icon, { className: 'mr-2 h-4 w-4 text-muted-foreground group-hover:text-primary' })}
                {item.name}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-primary transition-all duration-300 group-hover:w-full"></span>
              </a>
            ))}
          </div>
          <div className="hidden lg:flex lg:flex-1 lg:justify-end gap-x-6">
            <Link to="/login">
              <Button variant="ghost" className="text-muted-foreground hover:text-primary">
                Mag-login
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="hero">
                Mag-register
              </Button>
            </Link>
          </div>
        </nav>
        {mobileMenuOpen && (
          <div className="lg:hidden">
            <div className="fixed inset-0 z-50 bg-gray-900/70 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
            <div className="fixed inset-y-0 right-0 z-50 w-80 bg-card px-6 py-6 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-primary">FiliUp</span>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-lg text-muted-foreground hover:bg-muted">
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="mt-8 space-y-4">
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    onClick={(e) => handleSmoothScroll(e, item.href)}
                    className="flex items-center px-4 py-3 text-base font-semibold text-muted-foreground hover:bg-muted hover:text-primary rounded-lg transition-colors"
                  >
                    {React.cloneElement(item.icon, { className: 'mr-3 h-5 w-5 text-muted-foreground' })}
                    {item.name}
                  </a>
                ))}
                <Link to="/login" className="w-full">
                  <Button variant="ghost" className="w-full justify-start">
                    Mag-login
                  </Button>
                </Link>
                <Link to="/register" className="w-full">
                  <Button variant="hero" className="w-full">
                    Mag-register
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <div className="relative isolate pt-24 sm:pt-32 lg:pt-40 pb-24 lg:pb-32 overflow-hidden">
          <div
            className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-60"
            style={{
              clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
          >
            <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-primary opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
          </div>
          <div className="mx-auto max-w-4xl px-6 lg:px-8">
            <div className="text-center">
              <div className="flex items-center justify-center mb-8">
                <span className="inline-flex items-center rounded-full bg-muted px-4 py-2 text-sm font-medium text-primary">
                  <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
                  Interactive Learning
                </span>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground mb-8">
                <span className="block">FiliUp</span>
                <span className="block text-transparent bg-clip-text bg-gradient-primary">
                  Mag-aral ng Filipino nang Masaya!
                </span>
              </h1>
              <p className="mt-8 text-xl leading-8 text-muted-foreground max-w-3xl mx-auto">
                Ang komprehensibong plataporma para sa pag-aaral ng Bahagi ng Pananalita - 
                Pangngalan, Pandiwa, at Pang-uri gamit ang apat na uri ng aktibidad.
              </p>
              <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6">
                <Link to="/register">
                  <Button variant="hero" className="w-full sm:w-auto px-10 py-5 text-xl font-semibold">
                    Simulan ang Pag-aaral
                    <ArrowRight className="ml-3 h-6 w-6" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" className="w-full sm:w-auto px-10 py-5 text-xl font-semibold">
                    Mag-login
                  </Button>
                </Link>
              </div>
              <div className="mt-10 flex items-center justify-center text-base text-muted-foreground">
                <CheckCircle className="mr-2 h-5 w-5 text-primary" /> Libre ang paggamit
                <span className="mx-4">•</span>
                <CheckCircle className="mr-2 h-5 w-5 text-primary" /> Interactive activities
                <span className="mx-4">•</span>
                <CheckCircle className="mr-2 h-5 w-5 text-primary" /> Para sa lahat ng edad
              </div>
            </div>
          </div>
        </div>

        {/* Feature Carousel Section */}
        <section id="features" className="bg-card py-20 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-base font-semibold text-primary">Powerful Tools</h2>
              <p className="mt-2 text-4xl font-extrabold text-foreground sm:text-5xl">
                Mga Features ng FiliUp
              </p>
              <p className="mt-6 text-lg text-muted-foreground">
                Tuklasin ang mga features na magpapagaan sa pag-aaral ng Filipino.
              </p>
            </div>
            <div className="mt-16 relative">
              <div className="relative overflow-hidden rounded-2xl shadow-xl bg-muted/30">
                <div className="flex transition-transform duration-500" style={{ transform: `translateX(-${currentFeature * 100}%)` }}>
                  {features.map((feature, idx) => (
                    <FeatureCard key={feature.name} feature={feature} idx={idx} currentFeature={currentFeature} setCurrentFeature={setCurrentFeature} />
                  ))}
                </div>
                <button
                  onClick={() => setCurrentFeature((prev) => (prev - 1 + features.length) % features.length)}
                  className="absolute top-1/2 left-4 transform -translate-y-1/2 p-2 bg-card rounded-full shadow-md hover:bg-muted transition-colors"
                >
                  <ChevronLeft className="h-6 w-6 text-primary" />
                </button>
                <button
                  onClick={() => setCurrentFeature((prev) => (prev + 1) % features.length)}
                  className="absolute top-1/2 right-4 transform -translate-y-1/2 p-2 bg-card rounded-full shadow-md hover:bg-muted transition-colors"
                >
                  <ChevronRight className="h-6 w-6 text-primary" />
                </button>
              </div>
              <div className="mt-4 w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-100"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="mt-6 flex justify-center space-x-2">
                {features.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setCurrentFeature(idx); setProgress(0); }}
                    className={`h-2 w-2 rounded-full ${currentFeature === idx ? 'bg-primary' : 'bg-muted'} transition-colors`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>


        {/* Learning Phases Section */}
        <section id="levels" className="bg-muted/30 py-20 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-base font-semibold text-primary">Learning Path</h2>
              <p className="mt-2 text-3xl font-extrabold text-foreground sm:text-4xl">
                Mga Learning Phases
              </p>
              <p className="mt-6 text-lg text-muted-foreground">
                Structured curriculum na sunod-sunod ang pag-aaral ng Filipino
              </p>
            </div>
            <div className="space-y-6">
              {[
                {
                  phase: 'Phase 1',
                  title: 'Bahagi ng Pananalita',
                  description: 'Pag-aaral ng mga pangunahing bahagi ng pananalita tulad ng pangngalan, pandiwa, at pang-uri',
                  color: 'bg-gradient-teal-cyan',
                },
                {
                  phase: 'Phase 2', 
                  title: 'Kasingkahulugan at Kasalungat',
                  description: 'Pagkilala sa mga salitang magkakatulad at magkakasalungat ang kahulugan',
                  color: 'bg-gradient-warm',
                },
                {
                  phase: 'Phase 3',
                  title: 'Pagbuo ng Pangungusap', 
                  description: 'Sentence Construction & Structure - Pag-aaral ng tamang pagbuo at estruktura ng pangungusap',
                  color: 'bg-gradient-success',
                },
              ].map((phase, index) => (
                <Card key={index} className="learning-card">
                  <CardContent className="flex items-center p-6">
                    <div className={`${phase.color} text-white p-4 rounded-lg mr-6`}>
                      <span className="font-bold text-lg">{phase.phase}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-2">{phase.title}</h3>
                      <p className="text-muted-foreground">{phase.description}</p>
                    </div>
                    <Button variant="outline" className="btn-bounce">
                      Simulan
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faqs" className="bg-white py-20 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-base font-semibold text-emerald-600">Mga Tanong</h2>
              <p className="mt-2 text-4xl font-extrabold text-gray-900 sm:text-5xl">
                Frequently Asked Questions
              </p>
              <p className="mt-6 text-lg text-gray-600">
                Mga sagot sa mga karaniwang tanong tungkol sa FiliUp.
              </p>
            </div>
            <div className="mt-16 max-w-3xl mx-auto space-y-4">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
                >
                  <button
                    onClick={() => setExpandedFAQ(expandedFAQ === idx ? null : idx)}
                    className="w-full px-6 py-4 flex justify-between items-center text-left text-lg font-medium text-gray-900 hover:bg-gray-50 transition-colors"
                  >
                    <span>{faq.question}</span>
                    {expandedFAQ === idx ? (
                      <Minus className="h-5 w-5 text-emerald-600" />
                    ) : (
                      <Plus className="h-5 w-5 text-emerald-600" />
                    )}
                  </button>
                  {expandedFAQ === idx && (
                    <div className="px-6 pb-4 text-gray-600">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-primary py-20 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-4xl font-extrabold text-white sm:text-5xl">
                Handa na ba kayong mag-aral ng Filipino?
              </h2>
              <p className="mt-6 text-lg text-white/80 max-w-2xl mx-auto">
                Sumali sa libu-libong estudyante na nag-aaral ng Filipino gamit ang FiliUp.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row justify-center gap-6">
                <Link to="/register">
                  <Button className="px-8 py-4 text-lg font-semibold bg-white text-primary hover:bg-white/90">
                    Simulan Ngayon
                  </Button>
                </Link>
                <Link to="/login">
                  <Button className="px-8 py-4 text-lg font-semibold bg-white text-primary hover:bg-white/90">
                    Mag-login
                  </Button>
                </Link>
              </div>
              <div className="mt-8 flex items-center justify-center text-sm text-white/70">
                <CheckCircle className="mr-2 h-4 w-4" /> Libre ang paggamit
                <span className="mx-3">•</span>
                <CheckCircle className="mr-2 h-4 w-4" /> Interactive learning
                <span className="mx-3">•</span>
                <CheckCircle className="mr-2 h-4 w-4" /> Para sa lahat ng edad
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border">
        <div className="mx-auto max-w-7xl px-6 pb-8 pt-16 sm:pt-24 lg:px-8 lg:pt-32">
          <div className="xl:grid xl:grid-cols-3 xl:gap-8">
            <div className="space-y-8">
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg">
                  <BookOpen className="h-7 w-7 text-white" />
                </div>
                <span className="ml-3 text-2xl font-bold text-primary">FiliUp</span>
              </div>
              <p className="text-sm leading-6 text-muted-foreground">
                Empowering students sa pag-aaral ng Filipino through interactive at engaging activities.
              </p>
              <div className="flex space-x-6">
                <Facebook className="h-6 w-6 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
                <Twitter className="h-6 w-6 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
                <Instagram className="h-6 w-6 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
              </div>
            </div>
            <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Platform</h3>
                <ul className="mt-6 space-y-4">
                  <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Features</a></li>
                  <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Learning Phases</a></li>
                  <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Activities</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">Support</h3>
                <ul className="mt-6 space-y-4">
                  <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Help Center</a></li>
                  <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Contact Us</a></li>
                  <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacy</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-16 border-t border-border pt-8">
            <p className="text-xs text-muted-foreground text-center">© 2024 FiliUp. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
