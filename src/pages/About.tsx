import React from 'react';
import { Layout } from '@/components/Layout';
import { motion } from 'framer-motion';
import { 
  Brain, Shield, Clock, Database, 
  Microscope, Stethoscope, Lock, Share2 
} from 'lucide-react';

interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
}

export function About() {
  const features: Feature[] = [
    {
      icon: Brain,
      title: 'Advanced AI Technology',
      description: 'Our AI system uses state-of-the-art machine learning models to analyze medical data and provide accurate diagnostic support.'
    },
    {
      icon: Shield,
      title: 'Data Security',
      description: 'We prioritize patient privacy with on-device processing and advanced encryption protocols.'
    },
    {
      icon: Clock,
      title: 'Real-Time Updates',
      description: 'Access the latest medical research and guidelines instantly to make informed decisions.'
    },
    {
      icon: Database,
      title: 'Comprehensive Analysis',
      description: 'Process multiple types of medical data including images, EHRs, and test results.'
    }
  ];

  const benefits: Feature[] = [
    {
      icon: Microscope,
      title: 'Enhanced Accuracy',
      description: 'AI-powered analysis helps reduce diagnostic errors and improves patient outcomes.'
    },
    {
      icon: Stethoscope,
      title: 'Streamlined Workflow',
      description: 'Efficient tools and interfaces designed specifically for medical professionals.'
    },
    {
      icon: Lock,
      title: 'HIPAA Compliant',
      description: 'Full compliance with healthcare privacy regulations and standards.'
    },
    {
      icon: Share2,
      title: 'Collaborative Platform',
      description: 'Seamlessly share insights and collaborate with colleagues while maintaining privacy.'
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            About{' '}
            <span className="bg-gradient-to-r from-purple-600 via-blue-400 to-purple-600 text-transparent bg-clip-text">
              MedAssist
            </span>
          </h1>
          <p className="text-xl text-zinc-400 max-w-3xl mx-auto">
            MedAssist is an AI-powered diagnostic assistant designed to support medical professionals
            with advanced technology while maintaining the highest standards of privacy and security.
          </p>
        </motion.div>

        {/* Gradient orbs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/30 rounded-full filter blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/30 rounded-full filter blur-3xl opacity-20 translate-x-1/2 translate-y-1/2" />
      </section>

      {/* Features Section */}
      <section className="py-20 bg-zinc-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-4">Key Features</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Our platform combines cutting-edge AI technology with practical medical applications
              to enhance your diagnostic capabilities.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-6 rounded-xl backdrop-blur-xl bg-zinc-800/50 border border-zinc-700"
              >
                <feature.icon className="w-12 h-12 mb-4 text-blue-400" />
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-zinc-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-4">Benefits</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Experience the advantages of AI-assisted medical diagnosis while maintaining
              complete control over your practice.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-6 rounded-xl backdrop-blur-xl bg-zinc-800/50 border border-zinc-700"
              >
                <benefit.icon className="w-12 h-12 mb-4 text-blue-400" />
                <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                <p className="text-zinc-400">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
} 