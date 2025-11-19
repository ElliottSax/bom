'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Book, MessageCircle, Network, ImageIcon, Sparkles } from 'lucide-react';
import ImmersiveReader from '@/components/features/ImmersiveReader';
import AIAssistant from '@/components/features/AIAssistant';
import ScriptureNetwork from '@/components/features/ScriptureNetwork';
import VerseCardGenerator from '@/components/features/VerseCardGenerator';

type Feature = 'reader' | 'ai-assistant' | 'network' | 'card-generator' | null;

export default function Home() {
  const [activeFeature, setActiveFeature] = useState<Feature>(null);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-blue-950 dark:to-purple-950">
      {/* Hero Section */}
      {!activeFeature && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center min-h-screen p-8"
        >
          {/* Title */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center mb-4">
              <Sparkles className="w-12 h-12 text-blue-600 mr-3" />
              <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Scripture Study
              </h1>
            </div>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Community of Christ - Visually Stunning AI-Powered Platform
            </p>
          </motion.div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl w-full">
            {/* Immersive Reader */}
            <FeatureCard
              icon={<Book className="w-8 h-8" />}
              title="Immersive Reader"
              description="Beautiful typography, focus mode, and scroll-driven animations for a serene reading experience"
              gradient="from-blue-500 to-cyan-400"
              delay={0.3}
              onClick={() => setActiveFeature('reader')}
            />

            {/* AI Assistant */}
            <FeatureCard
              icon={<MessageCircle className="w-8 h-8" />}
              title="AI Study Assistant"
              description="Conversational AI that understands context and provides insights on any verse"
              gradient="from-purple-500 to-pink-400"
              delay={0.4}
              onClick={() => setActiveFeature('ai-assistant')}
            />

            {/* Scripture Network */}
            <FeatureCard
              icon={<Network className="w-8 h-8" />}
              title="Scripture Network"
              description="Interactive 3D visualization of cross-references and thematic connections"
              gradient="from-emerald-500 to-teal-400"
              delay={0.5}
              onClick={() => setActiveFeature('network')}
            />

            {/* Verse Card Generator */}
            <FeatureCard
              icon={<ImageIcon className="w-8 h-8" />}
              title="Verse Card Generator"
              description="AI-powered beautiful verse cards with mood-based design and shareable graphics"
              gradient="from-orange-500 to-red-400"
              delay={0.6}
              onClick={() => setActiveFeature('card-generator')}
            />
          </div>

          {/* Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-12 text-sm text-gray-500"
          >
            Click any feature to explore the prototype
          </motion.p>
        </motion.div>
      )}

      {/* Feature Views */}
      {activeFeature === 'reader' && <ImmersiveReader onBack={() => setActiveFeature(null)} />}
      {activeFeature === 'ai-assistant' && <AIAssistant onBack={() => setActiveFeature(null)} />}
      {activeFeature === 'network' && <ScriptureNetwork onBack={() => setActiveFeature(null)} />}
      {activeFeature === 'card-generator' && <VerseCardGenerator onBack={() => setActiveFeature(null)} />}
    </main>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
  delay: number;
  onClick: () => void;
}

function FeatureCard({ icon, title, description, gradient, delay, onClick }: FeatureCardProps) {
  return (
    <motion.button
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay }}
      whileHover={{ scale: 1.03, y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="group relative p-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 text-left overflow-hidden"
    >
      {/* Gradient Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

      {/* Icon */}
      <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${gradient} text-white mb-4`}>
        {icon}
      </div>

      {/* Content */}
      <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400">
        {description}
      </p>

      {/* Arrow */}
      <div className="mt-4 text-transparent group-hover:text-blue-600 transition-colors">
        →
      </div>
    </motion.button>
  );
}
