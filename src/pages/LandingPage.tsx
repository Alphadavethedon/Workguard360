import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { motion } from 'framer-motion';

const features = [
  {
    title: 'Real-time Monitoring',
    description: '24/7 surveillance with instant alerts',
    icon: '👁️',
  },
  {
    title: 'Compliance Management',
    description: 'Automated regulatory reporting',
    icon: '📋',
  },
  {
    title: 'Biometric Access',
    description: 'Facial & fingerprint recognition',
    icon: '🔒',
  },
];

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <main className="container mx-auto px-4 py-20">
        {/* Hero Section */}
        <section
          className="text-center max-w-3xl mx-auto"
          aria-labelledby="landing-page-title"
        >
          <h1
            id="landing-page-title"
            className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight"
          >
            Secure Your Workplace with{' '}
            <span className="text-blue-600">WorkGuard360</span>
          </h1>
          <p className="text-lg text-slate-600 mb-8">
            Advanced biometric access control and real-time monitoring for
            modern enterprises.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button onClick={() => navigate('/login')} size="lg">
              Get Started
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/demo')}
              size="lg"
            >
              Request Demo
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section
          className="mt-24 grid md:grid-cols-3 gap-8"
          aria-labelledby="features-title"
        >
          <h2 id="features-title" className="sr-only">
            Key Features
          </h2>
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-shadow focus-within:ring-2 focus-within:ring-blue-500"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15 }}
              tabIndex={0}
              role="article"
              aria-label={feature.title}
            >
              <div className="text-3xl mb-4" aria-hidden="true">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-slate-600">{feature.description}</p>
            </motion.div>
          ))}
        </section>
      </main>
    </div>
  );
}
