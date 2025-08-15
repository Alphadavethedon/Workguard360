import { motion, useScroll, useTransform } from 'framer-motion';
import { Shield, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { loginSchema, LoginFormData } from '../lib/validations';

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.4]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginFormData) => {
    setError('');
    try {
      await login(data.email, data.password);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-950 via-indigo-950 to-black text-white flex overflow-hidden font-sans">

      {/* Left Hero Panel */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 250, damping: 25 }}
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(99,102,241,0.35),_transparent_60%)] opacity-60" />
        <div className="relative z-10 flex flex-col justify-center px-12">
          <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3, duration: 0.4 }} className="mb-8">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-[conic-gradient(at_top_left,_var(--tw-gradient-stops))] from-indigo-600 via-cyan-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-indigo-600 via-cyan-500 to-purple-600 bg-clip-text text-transparent">
                  WorkGuard360
                </h1>
                <p className="text-sm text-indigo-300">Enterprise Security & Compliance</p>
              </div>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tighter mb-4">
              Next-Level
              <span className="bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-indigo-600 via-cyan-500 to-purple-600 bg-clip-text text-transparent">
                {' '}Protection
              </span>
            </h2>
            <p className="text-lg text-indigo-100/90 leading-relaxed mb-8 max-w-md">
              Advanced access control, real-time monitoring, and automated compliance for modern enterprises.
            </p>
          </motion.div>

          <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5, duration: 0.4 }} className="space-y-3">
            {['Threat Detection', '24/7 Monitoring', 'Automated Compliance', 'Dynamic Access Control'].map((item, idx) => (
              <div key={idx} className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
                <span className="text-sm text-indigo-200">{item}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Right Login Panel */}
      <motion.div
        style={{ opacity: heroOpacity }}
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 250, damping: 25 }}
        className="flex-1 flex items-center justify-center p-6 sm:p-8"
      >
        <div className="w-full max-w-md">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="bg-black/70 backdrop-blur-2xl border border-indigo-700/50 rounded-2xl p-8 shadow-lg shadow-indigo-600/40"
          >
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-[conic-gradient(at_top_left,_var(--tw-gradient-stops))] from-indigo-600 via-cyan-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-extrabold text-white mb-2">Secure Sign-In</h2>
              <p className="text-indigo-300 text-sm">Access your WorkGuard360 dashboard</p>
            </div>

            {/* Error */}
            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mb-6 p-3 bg-rose-500/20 border border-rose-500/30 rounded-lg flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-400" />
                <span className="text-rose-400 text-sm">{error}</span>
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-indigo-200 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-300 w-5 h-5" />
                  <input
                    {...register('email')}
                    type="email"
                    className="w-full pl-10 pr-4 py-3 bg-black/50 border border-indigo-700/50 rounded-lg text-white placeholder-indigo-300/50 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-200"
                    placeholder="Enter your email"
                  />
                </div>
                {errors.email && <p className="text-rose-400 text-xs mt-1">{errors.email.message}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-indigo-200 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-300 w-5 h-5" />
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    className="w-full pl-10 pr-12 py-3 bg-black/50 border border-indigo-700/50 rounded-lg text-white placeholder-indigo-300/50 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-200"
                    placeholder="Enter your password"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-indigo-300 hover:text-white transition-colors">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-rose-400 text-xs mt-1">{errors.password.message}</p>}
              </div>

              {/* Submit */}
              <Button
                type="submit"
                variant="primary"
                className="w-full text-base px-6 py-3 bg-[linear-gradient(45deg,#6366f1,#22d3ee)] hover:opacity-85 shadow-lg shadow-indigo-600/50 flex justify-center items-center"
                disabled={isLoading}
              >
                {isLoading ? <LoadingSpinner size="sm" className="mr-2" /> : <ArrowRight className="w-4 h-4 mr-2" />}
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
