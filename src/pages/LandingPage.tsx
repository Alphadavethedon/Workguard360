import { motion, useScroll, useTransform } from 'framer-motion';
import {
  Shield,
  Users,
  BarChart3,
  AlertTriangle,
  Eye,
  TrendingUp,
  ArrowRight,
  Globe,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { GlassCard } from '../components/ui/GlassCard';

const LandingPage: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.4]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.98]);

  const features = [
    {
      icon: Shield,
      title: 'Ironclad Security',
      description: 'End-to-end encryption and adaptive access policies to safeguard enterprise operations.',
      color: 'indigo',
    },
    {
      icon: Users,
      title: 'Smart Access Control',
      description: 'Manage users and roles with precision, ensuring only authorized personnel have access.',
      color: 'emerald',
    },
    {
      icon: BarChart3,
      title: 'Operational Insights',
      description: 'Real-time dashboards and analytics to monitor trends, anomalies, and performance.',
      color: 'violet',
    },
    {
      icon: AlertTriangle,
      title: 'ThreatSense',
      description: 'Proactively detect unauthorized activity and compliance violations across your organization.',
      color: 'rose',
    },
    {
      icon: Eye,
      title: 'OmniWatch Monitoring',
      description: 'Continuous, full-spectrum surveillance of systems and user activities for maximum security.',
      color: 'cyan',
    },
    {
      icon: TrendingUp,
      title: 'Compliance Automation',
      description: 'Generate audit-ready reports and track compliance effortlessly across your enterprise.',
      color: 'amber',
    },
  ];

  const stats = [
    { number: '99.99%', label: 'System Uptime' },
    { number: '25K+', label: 'Active Users' },
    { number: '1.5K+', label: 'Enterprise Clients' },
    { number: '24/7', label: 'Global Support' },
  ];

  const testimonials = [
    {
      name: 'Maina Wambua',
      role: 'Cybersecurity Lead',
      company: 'TechTrend',
      content: 'WorkGuard360 has transformed the way we secure our operations—reliable, scalable, and intuitive.',
    },
    {
      name: 'Sifuna Vanvicker',
      role: 'People Operations Manager',
      company: 'Nexlify',
      content: 'Managing access and monitoring teams globally has never been this seamless and secure.',
    },
    {
      name: 'Emanuel Mwangi',
      role: 'Compliance Strategist',
      company: 'SecureFin',
      content: 'Audits and compliance tracking are now effortless with WorkGuard360’s tools.',
    },
  ];

  const getColorClasses = (color: string) => ({
    indigo: 'bg-gradient-to-br from-indigo-600/50 to-indigo-900/50 border-indigo-600/60 hover:shadow-indigo-600/60',
    emerald: 'bg-gradient-to-br from-emerald-600/50 to-emerald-900/50 border-emerald-600/60 hover:shadow-emerald-600/60',
    violet: 'bg-gradient-to-br from-violet-600/50 to-violet-900/50 border-violet-600/60 hover:shadow-violet-600/60',
    rose: 'bg-gradient-to-br from-rose-600/50 to-rose-900/50 border-rose-600/60 hover:shadow-rose-600/60',
    cyan: 'bg-gradient-to-br from-cyan-600/50 to-cyan-900/50 border-cyan-600/60 hover:shadow-cyan-600/60',
    amber: 'bg-gradient-to-br from-amber-600/50 to-amber-900/50 border-amber-600/60 hover:shadow-amber-600/60',
  })[color] || 'bg-gradient-to-br from-indigo-600/50 to-indigo-900/50 border-indigo-600/60 hover:shadow-indigo-600/60';

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-950 via-indigo-950 to-black text-white overflow-hidden font-sans">

      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 250, damping: 25 }}
        className="fixed top-0 left-0 right-0 z-50 bg-black/85 backdrop-blur-2xl border-b border-indigo-700/50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-[conic-gradient(at_top_left,_var(--tw-gradient-stops))] from-indigo-600 via-cyan-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-extrabold tracking-tight">WorkGuard360</h1>
                <p className="text-xs text-indigo-300">Enterprise Security & Compliance</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Link to="/login">
                <Button variant="ghost" className="text-indigo-200 hover:text-white hover:bg-indigo-700/70 text-sm px-4 py-2">
                  Sign In
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="primary" className="bg-[linear-gradient(45deg,#6366f1,#22d3ee)] hover:opacity-85 text-sm px-4 py-2">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative">
        <motion.div style={{ opacity: heroOpacity, scale: heroScale }} className="max-w-5xl mx-auto text-center relative z-10">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tighter mb-4 leading-tight">
            Enterprise-Grade
            <span className="bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-indigo-600 via-cyan-500 to-purple-600 bg-clip-text text-transparent">
              {' '}Security
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-indigo-100/90 mb-6 max-w-3xl mx-auto">
            Complete access control, monitoring, and compliance management built for enterprises.
          </p>
          <Link to="/login">
            <Button variant="primary" className="text-base px-6 py-3 bg-[linear-gradient(45deg,#6366f1,#22d3ee)] hover:opacity-85 shadow-lg shadow-indigo-600/50">
              <ArrowRight className="w-4 h-4 mr-2" />
              Start Free Trial
            </Button>
          </Link>
        </motion.div>
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.35),_transparent_60%)] opacity-60" />
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <motion.div key={index} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, delay: index * 0.1 }} className="text-center p-4 bg-black/70 rounded-lg border border-indigo-700/50 hover:bg-indigo-900/30 transition-colors">
              <div className="text-2xl sm:text-3xl font-bold text-white mb-1">{stat.number}</div>
              <div className="text-xs text-indigo-300">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="text-center mb-10">
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tighter mb-3">
              Enterprise
              <span className="bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-indigo-600 via-cyan-500 to-purple-600 bg-clip-text text-transparent">
                {' '}Security Suite
              </span>
            </h2>
            <p className="text-base sm:text-lg text-indigo-100/90 max-w-xl mx-auto">
              Tools to protect, monitor, and optimize every aspect of your enterprise operations.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} whileHover={{ y: -8, scale: 1.03, transition: { duration: 0.2 } }} transition={{ duration: 0.3, delay: index * 0.05 }}>
                <GlassCard className={`${getColorClasses(feature.color)} p-5 rounded-xl transition-all duration-300 relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.15),_transparent_70%)] -z-10" />
                  <div className="w-8 h-8 rounded-md bg-white/15 flex items-center justify-center mb-3">
                    <feature.icon className="w-5 h-5 text-indigo-300" />
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-indigo-100/90">{feature.description}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,_rgba(99,102,241,0.25),_transparent_70%)] opacity-60" />
      </section>

      {/* Testimonials Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="text-center mb-10">
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tighter mb-3">
              Trusted by
              <span className="bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-indigo-600 via-cyan-500 to-purple-600 bg-clip-text text-transparent">
                {' '}Enterprises
              </span>
            </h2>
            <p className="text-base sm:text-lg text-indigo-100/90 max-w-xl mx-auto">
              Leading organizations rely on WorkGuard360 to secure and streamline their operations.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {testimonials.map((testimonial, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} whileHover={{ y: -8, scale: 1.03, transition: { duration: 0.2 } }} transition={{ duration: 0.3, delay: index * 0.05 }}>
                <GlassCard className="p-5 bg-black/70 border-indigo-700/50 rounded-xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.15),_transparent_70%)] -z-10" />
                  <p className="text-sm text-indigo-100/90 mb-4 italic leading-relaxed">"{testimonial.content}"</p>
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-[conic-gradient(at_top_left,_var(--tw-gradient-stops))] from-indigo-600 via-cyan-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white font-medium text-xs">{testimonial.name.split(' ').map((n) => n[0]).join('')}</span>
                    </div>
                    <div>
                      <div className="text-white font-medium text-sm">{testimonial.name}</div>
                      <div className="text-indigo-300 text-xs">{testimonial.role}</div>
                      <div className="text-indigo-400/80 text-xs">{testimonial.company}</div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <GlassCard className="bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-indigo-600/40 via-cyan-500/40 to-purple-600/40 border-indigo-700/60 p-8 rounded-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.2),_transparent_70%)] -z-10" />
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tighter mb-4">Secure the Future of Your Enterprise</h2>
              <p className="text-base sm:text-lg text-indigo-100/90 mb-6 max-w-md mx-auto">
                Engineered for enterprises. Join the revolution in security, monitoring, and compliance.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/login">
                  <Button variant="primary" className="text-base px-6 py-3 bg-[linear-gradient(45deg,#6366f1,#22d3ee)] hover:opacity-85 shadow-lg shadow-indigo-600/50">
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Get Started
                  </Button>
                </Link>
                <Button variant="secondary" className="text-base px-6 py-3 bg-transparent border-indigo-600 text-indigo-200 hover:bg-indigo-700/70">
                  <Globe className="w-4 h-4 mr-2" />
                  Contact Sales
                </Button>
              </div>
            </GlassCard>
          </motion.div>
        </div>
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_bottom,_rgba(99,102,241,0.35),_transparent_60%)] opacity-60" />
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-indigo-700/50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between">
          <div className="flex items-center space-x-3 mb-4 sm:mb-0">
            <div className="w-6 h-6 bg-[conic-gradient(at_top_left,_var(--tw-gradient-stops))] from-indigo-600 via-cyan-500 to-purple-600 rounded-md flex items-center justify-center">
              <Shield className="w-3 h-3 text-white" />
            </div>
            <div>
              <div className="text-white font-semibold text-sm">WorkGuard360</div>
              <div className="text-indigo-300 text-xs">Enterprise Security & Compliance</div>
            </div>
          </div>
          <div className="text-indigo-300 text-xs">© 2025 WorkGuard360. All rights reserved.</div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
