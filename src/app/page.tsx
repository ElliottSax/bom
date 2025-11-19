'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Book, MessageCircle, Network, ImageIcon, Sparkles, Zap, Heart, Star } from 'lucide-react';
import ImmersiveReader from '@/components/features/ImmersiveReader';
import AIAssistant from '@/components/features/AIAssistant';
import ScriptureNetwork from '@/components/features/ScriptureNetwork';
import VerseCardGenerator from '@/components/features/VerseCardGenerator';

type Feature = 'reader' | 'ai-assistant' | 'network' | 'card-generator' | null;

export default function Home() {
  const [activeFeature, setActiveFeature] = useState<Feature>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-blue-950 dark:to-purple-950 relative overflow-hidden">
      {/* Animated Background Elements */}
      {!activeFeature && (
        <>
          <FloatingOrbs mousePosition={mousePosition} />
          <AnimatedGrid />
        </>
      )}

      {/* Hero Section */}
      <AnimatePresence mode="wait">
        {!activeFeature && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center min-h-screen p-8 relative z-10"
          >
            {/* Floating Icons */}
            <FloatingIcons />

            {/* Title */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
              className="text-center mb-12 relative"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -top-20 left-1/2 -translate-x-1/2 w-32 h-32 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"
              />
              <div className="flex items-center justify-center mb-4 relative">
                <motion.div
                  animate={{ rotate: [0, 10, 0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Sparkles className="w-12 h-12 text-blue-600 mr-3" />
                </motion.div>
                <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Scripture Study
                </h1>
              </div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-xl text-gray-600 dark:text-gray-400"
              >
                Community of Christ - Visually Stunning AI-Powered Platform
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-4 flex items-center justify-center gap-2"
              >
                <span className="px-3 py-1 rounded-full text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                  4 Stunning Features
                </span>
                <span className="px-3 py-1 rounded-full text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                  AI-Powered
                </span>
                <span className="px-3 py-1 rounded-full text-xs bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300">
                  Open Source
                </span>
              </motion.div>
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-12 text-center"
          >
            <p className="text-sm text-gray-500 mb-2">
              Click any feature to explore the prototype
            </p>
            <p className="text-xs text-gray-400">
              Built with Next.js, TypeScript, Tailwind CSS, and Framer Motion
            </p>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* Feature Views */}
      <AnimatePresence mode="wait">
        {activeFeature === 'reader' && (
          <motion.div
            key="reader"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
          >
            <ImmersiveReader onBack={() => setActiveFeature(null)} />
          </motion.div>
        )}
        {activeFeature === 'ai-assistant' && (
          <motion.div
            key="ai-assistant"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
          >
            <AIAssistant onBack={() => setActiveFeature(null)} />
          </motion.div>
        )}
        {activeFeature === 'network' && (
          <motion.div
            key="network"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
          >
            <ScriptureNetwork onBack={() => setActiveFeature(null)} />
          </motion.div>
        )}
        {activeFeature === 'card-generator' && (
          <motion.div
            key="card-generator"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
          >
            <VerseCardGenerator onBack={() => setActiveFeature(null)} />
          </motion.div>
        )}
      </AnimatePresence>
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
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay, type: "spring", stiffness: 100 }}
      whileHover={{ scale: 1.03, y: -8 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative p-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 text-left overflow-hidden border border-gray-200/50 dark:border-gray-700/50"
    >
      {/* Gradient Background */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br ${gradient}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 0.1 : 0 }}
        transition={{ duration: 0.3 }}
      />

      {/* Animated Border Glow */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-2xl`}
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 0.2 : 0 }}
        style={{ filter: 'blur(20px)', transform: 'scale(1.05)' }}
      />

      {/* Icon with animation */}
      <motion.div
        className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${gradient} text-white mb-4 relative z-10`}
        animate={{ rotate: isHovered ? [0, -10, 10, 0] : 0 }}
        transition={{ duration: 0.5 }}
      >
        {icon}
      </motion.div>

      {/* Content */}
      <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white relative z-10">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 relative z-10 leading-relaxed">
        {description}
      </p>

      {/* Arrow with animation */}
      <motion.div
        className="mt-4 flex items-center gap-2 relative z-10"
        initial={{ x: 0 }}
        animate={{ x: isHovered ? 5 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <span className={`text-2xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
          Explore
        </span>
        <motion.span
          animate={{ x: isHovered ? [0, 5, 0] : 0 }}
          transition={{ repeat: isHovered ? Infinity : 0, duration: 1 }}
          className={`text-2xl bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}
        >
          →
        </motion.span>
      </motion.div>

      {/* Particle effect on hover */}
      {isHovered && <CardParticles />}
    </motion.button>
  );
}

// Helper Components
function FloatingOrbs({ mousePosition }: { mousePosition: { x: number; y: number } }) {
  const orbs = [
    { size: 400, x: 20, y: 20, color: 'from-blue-400/20 to-cyan-400/20' },
    { size: 300, x: 70, y: 60, color: 'from-purple-400/20 to-pink-400/20' },
    { size: 350, x: 50, y: 80, color: 'from-emerald-400/20 to-teal-400/20' },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none">
      {orbs.map((orb, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full bg-gradient-to-br ${orb.color} blur-3xl`}
          style={{
            width: orb.size,
            height: orb.size,
            left: `${orb.x}%`,
            top: `${orb.y}%`,
          }}
          animate={{
            x: (mousePosition.x - window.innerWidth / 2) / (20 + i * 10),
            y: (mousePosition.y - window.innerHeight / 2) / (20 + i * 10),
          }}
          transition={{ type: 'spring', stiffness: 50, damping: 30 }}
        />
      ))}
    </div>
  );
}

function AnimatedGrid() {
  return (
    <div className="fixed inset-0 pointer-events-none opacity-10">
      <svg width="100%" height="100%">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>
  );
}

function FloatingIcons() {
  const icons = [
    { Icon: Book, x: 10, y: 20, delay: 0 },
    { Icon: Heart, x: 85, y: 15, delay: 0.5 },
    { Icon: Star, x: 15, y: 75, delay: 1 },
    { Icon: Zap, x: 90, y: 70, delay: 1.5 },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none">
      {icons.map(({ Icon, x, y, delay }, i) => (
        <motion.div
          key={i}
          className="absolute opacity-20"
          style={{ left: `${x}%`, top: `${y}%` }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0.1, 0.3, 0.1],
            scale: [1, 1.2, 1],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 4,
            delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Icon className="w-8 h-8 text-purple-500" />
        </motion.div>
      ))}
    </div>
  );
}

function CardParticles() {
  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map(({ id, x, y }) => (
        <motion.div
          key={id}
          className="absolute w-1 h-1 bg-blue-400 rounded-full"
          style={{ left: `${x}%`, top: `${y}%` }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0],
            y: [0, -30],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  );
}
