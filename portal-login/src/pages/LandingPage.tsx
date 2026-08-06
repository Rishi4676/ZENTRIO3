import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ThemeToggle } from '../components/ThemeToggle';
import {
  Code2,
  Cpu,
  Layers,
  Smartphone,
  ChevronRight,
  Shield,
  Zap,
  Star,
  Check,
  Mail,
  Phone,
  MapPin,
  ChevronDown,
  ChevronUp,
  Globe
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { setCurrentPage, currentUser, logout } = useApp();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loginMenuOpen, setLoginMenuOpen] = useState(false);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (contactForm.name && contactForm.email && contactForm.message) {
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setContactForm({ name: '', email: '', message: '' });
      }, 4000);
    }
  };

  const servicesList = [
    { icon: <Globe className="w-6 h-6 text-indigo-500" />, title: 'Web Development', desc: 'Custom frontend & backend web applications engineered for speed, responsiveness, and scale.' },
    { icon: <Cpu className="w-6 h-6 text-purple-500" />, title: 'AI & Machine Learning', desc: 'Custom LLM fine-tuning, predictive modeling, and intelligent workflow automation integrations.' },
    { icon: <Smartphone className="w-6 h-6 text-pink-500" />, title: 'Mobile App Development', desc: 'High-performance native and cross-platform apps built with React Native and Expo.' },
    { icon: <Code2 className="w-6 h-6 text-cyan-500" />, title: 'Full Stack Development', desc: 'Robust server structures, database schema planning, and clean API integrations.' },
    { icon: <Layers className="w-6 h-6 text-emerald-500" />, title: 'Cloud Solutions', desc: 'Scalable serverless microservices, secure containerized deployments, and cost-reduction audits.' },
    { icon: <Zap className="w-6 h-6 text-amber-500" />, title: 'UI/UX Design', desc: 'Intuitive modern user journeys and dark-mode compatible design systems built on Figma.' }
  ];

  const portfolioList = [
    { title: 'Zendesk AI Chatbot Integration', category: 'AI & ML', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=400', tech: ['React', 'Python', 'FastAPI'] },
    { title: 'Shopify Headless Checkout System', category: 'E-Commerce', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=400', tech: ['Shopify API', 'Tailwind', 'Next.js'] },
    { title: 'Apex Realtime iOS Dashboard', category: 'Mobile App', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=400', tech: ['React Native', 'Expo', 'Recharts'] }
  ];

  const faqs = [
    { q: 'What project categories do you support?', a: 'We specialize in Web Development, Full Stack platforms, Mobile App Development (React Native), AI & Machine Learning setups, UI/UX systems, Power BI Dashboards, and custom enterprise automations.' },
    { q: 'How does client project tracking work?', a: 'Once registered, clients log into their portal to view active projects, track stage workflows (Pending, Approved, Development, Testing, etc.), download deliverables directly, and raise support tickets.' },
    { q: 'Can we assign workers directly to our project?', a: 'Projects are managed and assigned by the Admin. However, clients can interact directly with assigned workers through the live ticket update terminal or chat.' },
    { q: 'What payment options do you support?', a: 'We support all major payment types including Razorpay, UPI, Credit Cards, Debit Cards, and Net Banking, complete with automatic PDF invoice generation.' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300">
      
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none animate-float"></div>
      <div className="absolute top-[1200px] right-1/4 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[140px] pointer-events-none animate-float-reverse"></div>

      {/* FLOATING GLASS HEADER */}
      <header className="sticky top-0 z-50 w-full px-4 lg:px-8 py-3">
        <nav className="max-w-7xl mx-auto glass-nav rounded-2xl px-6 py-3 flex items-center justify-between shadow-lg">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentPage('home')}>
            <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center bg-transparent">
              <img src="/LOGOO.png" alt="Zentrio Logo" className="w-8 h-8 object-contain" />
            </div>
            <span className="font-extrabold text-xl bg-gradient-to-r from-slate-900 to-indigo-950 dark:from-white dark:to-indigo-200 bg-clip-text text-transparent tracking-tight">
              Zentrio
            </span>
          </div>

          {/* Nav links */}
          <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600 dark:text-slate-300">
            <a href="#services" className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">Services</a>
            <a href="#portfolio" className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">Portfolio</a>
            <a href="#pricing" className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">FAQ</a>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-3 relative">
            <ThemeToggle />
            
            {currentUser ? (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(`${currentUser.role}-dashboard`)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all duration-200 shadow-md hover:shadow-indigo-500/20"
                >
                  Dashboard
                </button>
                <button
                  onClick={logout}
                  className="px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 rounded-xl transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setLoginMenuOpen(!loginMenuOpen)}
                  className="px-5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-xl transition-all duration-200 shadow-md flex items-center space-x-1.5 active:scale-95"
                >
                  <span>Portal Login</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>

                {loginMenuOpen && (
                  <div className="absolute right-0 mt-3 w-52 glass-card rounded-xl shadow-xl py-2 z-50 border border-slate-200/50 dark:border-slate-800/50">
                    <button
                      onClick={() => { setCurrentPage('client-login'); setLoginMenuOpen(false); }}
                      className="w-full text-left px-4 py-2.5 text-xs hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400 text-slate-700 dark:text-slate-300 font-medium transition"
                    >
                      Client Portal
                    </button>
                    <button
                      onClick={() => { setCurrentPage('worker-login'); setLoginMenuOpen(false); }}
                      className="w-full text-left px-4 py-2.5 text-xs hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400 text-slate-700 dark:text-slate-300 font-medium transition"
                    >
                      Worker Portal
                    </button>
                    <button
                      onClick={() => { setCurrentPage('admin-login'); setLoginMenuOpen(false); }}
                      className="w-full text-left px-4 py-2.5 text-xs hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400 text-slate-700 dark:text-slate-300 font-medium transition border-t border-slate-100 dark:border-slate-800/50"
                    >
                      Administrator Access
                    </button>
                    <div className="p-2 border-t border-slate-100 dark:border-slate-800/50">
                      <button
                        onClick={() => { setCurrentPage('client-register'); setLoginMenuOpen(false); }}
                        className="w-full py-1.5 text-center text-xs font-semibold bg-indigo-600/15 hover:bg-indigo-600 hover:text-white text-indigo-600 dark:text-indigo-400 rounded-lg transition"
                      >
                        Register New Client
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </nav>
      </header>

      {/* HERO SECTION */}
      <section className="relative px-6 pt-16 pb-24 lg:pt-28 lg:pb-36 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Badge */}
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full glass border border-slate-300/30 dark:border-slate-800/50 text-indigo-600 dark:text-indigo-400 text-xs font-semibold mb-6 shadow-sm">
          <Shield className="w-3.5 h-3.5" />
          <span>Enterprise Grade Management Platform</span>
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight max-w-5xl">
          Supercharge Your Startup's{' '}
          <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Product Engineering
          </span>
        </h1>

        <p className="mt-6 text-base md:text-lg lg:text-xl text-slate-500 dark:text-slate-400 max-w-3xl leading-relaxed">
          Order projects, track development progress in real-time, collaborate directly with expert developers, and handle payments in a secure glassmorphism interface.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          <button
            onClick={() => setCurrentPage('client-register')}
            className="w-full sm:w-auto px-8 py-4 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition duration-200 shadow-lg hover:shadow-indigo-500/30 flex items-center justify-center space-x-2 active:scale-95 cursor-pointer"
          >
            <span>Get Started Now</span>
            <ChevronRight className="w-5 h-5" />
          </button>
          
          <a
            href="#services"
            className="w-full sm:w-auto px-8 py-4 font-bold text-slate-700 dark:text-slate-200 glass hover:bg-slate-100/50 dark:hover:bg-slate-900/50 rounded-xl transition duration-200 flex items-center justify-center space-x-2 border border-slate-300/30 dark:border-slate-800/50"
          >
            Explore Services
          </a>
        </div>

        {/* Visual Mockups Floating Section */}
        <div className="mt-16 w-full max-w-5xl glass-card rounded-2xl p-2.5 shadow-2xl border border-slate-200/50 dark:border-slate-800/50 relative">
          <div className="bg-slate-900 rounded-xl overflow-hidden aspect-[16/9] relative shadow-inner">
            <img
              src="https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&q=80&w=1200"
              alt="Zentrio Dashboard Preview"
              className="w-full h-full object-cover opacity-85 object-top"
            />
            {/* Absolute overlay of metrics */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end justify-between p-6 md:p-10">
              <div className="text-left max-w-md">
                <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Active Dashboard Portal</span>
                </div>
                <h3 className="text-white text-lg md:text-xl font-bold">Realtime Milestone Tracking</h3>
                <p className="text-slate-400 text-xs md:text-sm mt-1">Clients can visually observe active workflows, stage revisions, and review source files.</p>
              </div>
              
              <div className="hidden sm:flex items-center space-x-4 bg-slate-900/90 backdrop-filter backdrop-blur p-4 rounded-xl border border-slate-800 text-left">
                <div>
                  <div className="text-xs text-slate-500 font-medium">Deliverables Complete</div>
                  <div className="text-lg font-bold text-white">99.2%</div>
                </div>
                <div className="w-px h-8 bg-slate-800"></div>
                <div>
                  <div className="text-xs text-slate-500 font-medium">Active Engineers</div>
                  <div className="text-lg font-bold text-indigo-400">140+</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE SERVICES SECTION */}
      <section id="services" className="py-20 bg-slate-100/50 dark:bg-slate-900/30 border-y border-slate-200/50 dark:border-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Our Specialized Engineering Capabilities</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-4">We deliver enterprise-grade digital products across multiple specialized domain verticals.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {servicesList.map((service, index) => (
              <div
                key={index}
                className="glass-card hover:border-indigo-500/30 dark:hover:border-indigo-500/20 p-8 rounded-2xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg group"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  {service.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">{service.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PORTFOLIO SECTION */}
      <section id="portfolio" className="py-20 max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Featured Collaborations</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-4">Explore actual solutions shipped to our clients, built to professional standard specifications.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {portfolioList.map((item, index) => (
            <div key={index} className="glass-card overflow-hidden rounded-2xl group shadow-sm hover:shadow-md transition">
              <div className="relative aspect-[4/3] overflow-hidden bg-slate-950">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                />
                <div className="absolute top-3 left-3 bg-slate-900/90 text-white text-xs font-semibold px-2.5 py-1 rounded-lg">
                  {item.category}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
                  {item.title}
                </h3>
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {item.tech.map((t, idx) => (
                    <span key={idx} className="text-[10px] font-semibold bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 bg-indigo-900/10 dark:bg-indigo-950/10 border-y border-indigo-500/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Trusted by Startup Founders</h2>
            <p className="text-indigo-900/60 dark:text-indigo-300/60 mt-4">What executive leaders say about our delivery schedules and engineering standards.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="glass-card p-8 rounded-2xl relative">
              <div className="flex items-center space-x-1 text-amber-500 mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
              </div>
              <p className="text-sm italic text-slate-600 dark:text-slate-300 leading-relaxed">
                "Zentrio built our headless ecommerce system in under a month. The ability to monitor active milestones, download staging APKs, and review task tickets right from the client dashboard kept our entire marketing team aligned."
              </p>
              <div className="mt-6 flex items-center space-x-3.5">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100"
                  alt="Sarah Lin"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Sarah Lin</div>
                  <div className="text-[10px] text-slate-500 font-medium">Founder, Bloom Cosmetics</div>
                </div>
              </div>
            </div>

            <div className="glass-card p-8 rounded-2xl relative">
              <div className="flex items-center space-x-1 text-amber-500 mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
              </div>
              <p className="text-sm italic text-slate-600 dark:text-slate-300 leading-relaxed">
                "The AI support agent David Chen built for us reduced ticket counts by 75% in the first two weeks. Having access to transparent invoicing and support tickets made managing this complex integration extremely pleasant."
              </p>
              <div className="mt-6 flex items-center space-x-3.5">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100"
                  alt="Marcus Vance"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Marcus Vance</div>
                  <div className="text-[10px] text-slate-500 font-medium">CTO, NexusCorp</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING PLANS */}
      <section id="pricing" className="py-20 max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Flexible Engagement Plans</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-4">Predictable subscription pricing packages matching your development milestones.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Plan 1 */}
          <div className="glass-card p-8 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Starter Suite</h3>
              <div className="mt-4 flex items-baseline">
                <span className="text-4xl font-extrabold tracking-tight">$4,999</span>
                <span className="ml-1 text-sm text-slate-500">/project</span>
              </div>
              <p className="mt-3 text-xs text-slate-500 leading-relaxed">Perfect for simple landing pages, UI design mockups, and early MVP prototypes.</p>
              
              <ul className="mt-8 space-y-4 text-xs font-medium text-slate-600 dark:text-slate-400">
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>1 Custom React Native / Web Module</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>Interactive Client Milestone tracking</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>Basic Support Tickets access</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>14-day QA Bug Guarantee</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => setCurrentPage('client-register')}
              className="mt-8 w-full py-3 px-4 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-white bg-indigo-600/10 hover:bg-indigo-600 rounded-xl transition duration-200 active:scale-95"
            >
              Order Project
            </button>
          </div>

          {/* Plan 2 - Featured */}
          <div className="glass-card p-8 rounded-2xl border-2 border-indigo-500/80 relative flex flex-col justify-between shadow-lg ring-4 ring-indigo-500/5">
            <div className="absolute top-0 right-6 transform -translate-y-1/2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-[10px] font-bold tracking-wider uppercase px-3 py-1 rounded-full shadow-md">
              Most Popular
            </div>
            <div>
              <h3 className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Growth Engine</h3>
              <div className="mt-4 flex items-baseline">
                <span className="text-4xl font-extrabold tracking-tight">$9,999</span>
                <span className="ml-1 text-sm text-slate-500">/project</span>
              </div>
              <p className="mt-3 text-xs text-slate-500 leading-relaxed">Designed for full SaaS builds, custom LLM integrations, and payment automation setups.</p>
              
              <ul className="mt-8 space-y-4 text-xs font-medium text-slate-600 dark:text-slate-400">
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>Full Stack Application (React + Node)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>Dedicated Expert Worker Assigned</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>Secure Razorpay / UPI Integration</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>30-day Post Launch Support</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => setCurrentPage('client-register')}
              className="mt-8 w-full py-3 px-4 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition duration-200 active:scale-95 shadow-md shadow-indigo-500/20"
            >
              Order Project
            </button>
          </div>

          {/* Plan 3 */}
          <div className="glass-card p-8 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Enterprise Custom</h3>
              <div className="mt-4 flex items-baseline">
                <span className="text-4xl font-extrabold tracking-tight">Custom</span>
              </div>
              <p className="mt-3 text-xs text-slate-500 leading-relaxed">Ideal for high-throughput scaling apps, security audits, and continuous DevOps deployment integrations.</p>
              
              <ul className="mt-8 space-y-4 text-xs font-medium text-slate-600 dark:text-slate-400">
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>Full-time Multi-developer Squad</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>24/7 Priority Live Support Chat</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>ISO-27001 compliant security setups</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>Flexible Monthly Retainer Billing</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => setCurrentPage('client-register')}
              className="mt-8 w-full py-3 px-4 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-white glass hover:bg-slate-900 rounded-xl transition duration-200 active:scale-95"
            >
              Contact Solutions
            </button>
          </div>
        </div>
      </section>

      {/* TEAM SECTION */}
      <section className="py-20 bg-slate-100/50 dark:bg-slate-900/30 border-y border-slate-200/50 dark:border-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Meet Our Core Squad</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-4">The senior engineers leading AetherFlow product design and platform infrastructure.</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-8">
            <div className="glass-card text-center p-6 rounded-2xl">
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200"
                alt="Emma Sterling"
                className="w-20 h-20 rounded-full mx-auto object-cover border-2 border-indigo-500"
              />
              <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">Emma Sterling</h3>
              <p className="text-xs text-slate-500 font-semibold mt-1">Chief Executive Officer</p>
            </div>

            <div className="glass-card text-center p-6 rounded-2xl">
              <img
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200"
                alt="David Chen"
                className="w-20 h-20 rounded-full mx-auto object-cover border-2 border-purple-500"
              />
              <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">David Chen</h3>
              <p className="text-xs text-slate-500 font-semibold mt-1">Head of AI Research</p>
            </div>

            <div className="glass-card text-center p-6 rounded-2xl">
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200"
                alt="Sarah Jenkins"
                className="w-20 h-20 rounded-full mx-auto object-cover border-2 border-pink-500"
              />
              <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">Sarah Jenkins</h3>
              <p className="text-xs text-slate-500 font-semibold mt-1">Lead UI Architect</p>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT FORM */}
      <section className="py-20 max-w-3xl mx-auto px-6">
        <div className="glass-card p-8 md:p-12 rounded-3xl relative border border-slate-200/50 dark:border-slate-800/50 shadow-xl overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo-500/10 to-transparent rounded-bl-full"></div>
          
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">Have a Project in Mind?</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">Send us a brief message. Our solutions architect will respond within 4 business hours.</p>

          <form onSubmit={handleContactSubmit} className="mt-8 space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  className="w-full text-sm px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white/50 dark:bg-slate-950/45 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. john@company.com"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  className="w-full text-sm px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white/50 dark:bg-slate-950/45 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Message Outline</label>
              <textarea
                required
                rows={4}
                placeholder="Briefly describe your project requirements and target deadline..."
                value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                className="w-full text-sm px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white/50 dark:bg-slate-950/45 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              ></textarea>
            </div>

            {submitted ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/20 text-center animate-pulse">
                Message transmitted successfully! Check your inbox for our follow-up confirmation.
              </div>
            ) : (
              <button
                type="submit"
                className="w-full py-4 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition duration-200 shadow-md hover:shadow-indigo-500/25 active:scale-95 cursor-pointer"
              >
                Send Message
              </button>
            )}
          </form>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="py-20 max-w-4xl mx-auto px-6 border-t border-slate-200/50 dark:border-slate-900">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Frequently Asked Questions</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Find instant answers to common onboarding and pipeline questions.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="glass-card rounded-2xl overflow-hidden transition">
              <button
                onClick={() => toggleFaq(index)}
                className="w-full text-left p-6 font-semibold text-slate-800 dark:text-white flex items-center justify-between hover:text-indigo-600 dark:hover:text-indigo-400 transition"
              >
                <span className="text-sm md:text-base">{faq.q}</span>
                {activeFaq === index ? (
                  <ChevronUp className="w-5 h-5 shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 shrink-0" />
                )}
              </button>
              {activeFaq === index && (
                <div className="px-6 pb-6 text-slate-500 dark:text-slate-400 text-xs md:text-sm leading-relaxed border-t border-slate-100 dark:border-slate-800/30 pt-4">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-100 dark:bg-slate-950/70 border-t border-slate-200/50 dark:border-slate-900 py-12 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center bg-transparent">
                <img src="/LOGOO.png" alt="Zentrio Logo" className="w-6 h-6 object-contain" />
              </div>
              <span className="font-extrabold text-lg tracking-tight">Zentrio</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Modern engineering suite and project delivery workspace for fast-moving enterprise companies.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-4">Support & Media</h4>
            <ul className="space-y-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              <li><a href="#" className="hover:text-indigo-500">Security Credentials</a></li>
              <li><a href="#" className="hover:text-indigo-500">Razorpay Integration</a></li>
              <li><a href="#" className="hover:text-indigo-500">Status Check</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-4">Portals</h4>
            <ul className="space-y-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              <li><button onClick={() => setCurrentPage('client-login')} className="hover:text-indigo-500">Client Workspace</button></li>
              <li><button onClick={() => setCurrentPage('worker-login')} className="hover:text-indigo-500">Worker Terminal</button></li>
              <li><button onClick={() => setCurrentPage('admin-login')} className="hover:text-indigo-500">Admin Central</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-4">Contact Info</h4>
            <ul className="space-y-3 text-xs font-medium text-slate-500 dark:text-slate-400">
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-indigo-500" />
                <span>contact@zentrio.ai</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-indigo-500" />
                <span>+1 (555) 234-5678</span>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-indigo-500 shrink-0" />
                <span>100 Pine St, San Francisco, CA</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-slate-200/50 dark:border-slate-800/40 text-center flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-medium">
          <div>© {new Date().getFullYear()} Zentrio AI. All rights reserved.</div>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <a href="#" className="hover:text-indigo-500">Terms of Service</a>
            <a href="#" className="hover:text-indigo-500">Privacy Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
