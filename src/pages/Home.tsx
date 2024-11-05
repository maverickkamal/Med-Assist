import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight, Brain, Shield, Clock, Database } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Home() {
  const features = [
    {
      icon: Brain,
      title: 'Multimodal Data Processing',
      description: 'Analyze medical images, EHRs, test results, and physician notes for comprehensive diagnostic support.'
    },
    {
      icon: Shield,
      title: 'Privacy-First Approach',
      description: 'On-device processing ensures patient data privacy and security while maintaining high performance.'
    },
    {
      icon: Clock,
      title: 'Real-Time Research Access',
      description: 'Stay updated with the latest medical research and standards for informed decision-making.'
    },
    {
      icon: Database,
      title: 'Explainable AI',
      description: 'Understand the reasoning behind each recommendation with clear explanations and evidence.'
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-purple-600 via-blue-400 to-purple-600 text-transparent bg-clip-text">
                AI-Powered Diagnostic
              </span>
              <br />
              Assistant for Doctors
            </h1>
            <p className="text-xl text-zinc-400 mb-8 max-w-2xl mx-auto">
              Enhance your diagnostic process with our privacy-focused, AI-powered assistant that provides real-time support and research access.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/about">
                <Button size="lg" variant="outline">
                  Learn More
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Gradient orbs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/30 rounded-full filter blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/30 rounded-full filter blur-3xl opacity-20 translate-x-1/2 translate-y-1/2" />
      </section>

      {/* Features Section */}
      <section className="py-20 bg-zinc-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
    </Layout>
  );
} 