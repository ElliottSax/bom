'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ZoomIn, ZoomOut, Maximize2, Filter, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { mockVerses, mockCrossReferences, type Verse, type CrossReference } from '@/lib/mock-data';

interface ScriptureNetworkProps {
  onBack: () => void;
}

interface NetworkNode {
  id: string;
  name: string;
  val: number;
  color: string;
  verse: Verse;
}

interface NetworkLink {
  source: string;
  target: string;
  color: string;
  type: string;
}

export default function ScriptureNetwork({ onBack }: ScriptureNetworkProps) {
  const [selectedNode, setSelectedNode] = useState<Verse | null>(null);
  const [filterScripture, setFilterScripture] = useState<'all' | 'book-of-mormon' | 'doctrine-and-covenants' | 'inspired-version'>('all');
  const [highlightConnections, setHighlightConnections] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Build network data
  const networkData = buildNetworkData(mockVerses, mockCrossReferences, filterScripture);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-teal-900 text-white"
    >
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 px-6 py-4 glass"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold">
              Scripture Network
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={filterScripture}
              onChange={(e) => setFilterScripture(e.target.value as any)}
              className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Scriptures</option>
              <option value="book-of-mormon">Book of Mormon</option>
              <option value="doctrine-and-covenants">D&C</option>
              <option value="inspired-version">Inspired Version</option>
            </select>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto p-6 flex gap-6 h-[calc(100vh-88px)]">
        {/* Network Visualization */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex-1 bg-white/5 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden relative"
          ref={containerRef}
        >
          {/* 2D Network Visualization (simplified) */}
          <svg className="w-full h-full">
            <NetworkVisualization
              nodes={networkData.nodes}
              links={networkData.links}
              onNodeClick={setSelectedNode}
              selectedNode={selectedNode}
            />
          </svg>

          {/* Legend */}
          <div className="absolute bottom-6 left-6 bg-black/50 backdrop-blur-sm rounded-lg p-4">
            <p className="text-sm font-semibold mb-2">Connection Types</p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-blue-400" />
                <span>Thematic</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-purple-400" />
                <span>Prophecy</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-pink-400" />
                <span>Quotation</span>
              </div>
            </div>
          </div>

          {/* Info Panel */}
          <div className="absolute top-6 left-6 bg-black/50 backdrop-blur-sm rounded-lg p-4 max-w-xs">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 mt-1 flex-shrink-0" />
              <p className="text-xs">
                Each node represents a verse. Connections show cross-references between scriptures.
                Click on a node to explore its connections.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Details Panel */}
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="w-96 flex-shrink-0"
        >
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-xl p-6 h-full overflow-y-auto">
            {selectedNode ? (
              <VerseDetails verse={selectedNode} connections={getConnections(selectedNode.id, mockCrossReferences, mockVerses)} />
            ) : (
              <EmptyState />
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function NetworkVisualization({ nodes, links, onNodeClick, selectedNode }: {
  nodes: NetworkNode[];
  links: NetworkLink[];
  onNodeClick: (verse: Verse) => void;
  selectedNode: Verse | null;
}) {
  const width = 800;
  const height = 600;

  // Simple force-directed layout simulation (simplified for demo)
  const positions = nodes.map((node, i) => {
    const angle = (i / nodes.length) * Math.PI * 2;
    const radius = 200;
    return {
      x: width / 2 + Math.cos(angle) * radius,
      y: height / 2 + Math.sin(angle) * radius,
      node,
    };
  });

  return (
    <g>
      {/* Links */}
      {links.map((link, i) => {
        const source = positions.find(p => p.node.id === link.source);
        const target = positions.find(p => p.node.id === link.target);
        if (!source || !target) return null;

        return (
          <motion.line
            key={i}
            x1={source.x}
            y1={source.y}
            x2={target.x}
            y2={target.y}
            stroke={link.color}
            strokeWidth={2}
            strokeOpacity={0.3}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, delay: i * 0.02 }}
          />
        );
      })}

      {/* Nodes */}
      {positions.map(({ x, y, node }, i) => {
        const isSelected = selectedNode?.id === node.id;
        return (
          <g key={node.id}>
            <motion.circle
              cx={x}
              cy={y}
              r={node.val}
              fill={node.color}
              stroke="white"
              strokeWidth={isSelected ? 3 : 1}
              style={{ cursor: 'pointer' }}
              onClick={() => onNodeClick(node.verse)}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.2 }}
              transition={{ delay: i * 0.05 }}
            />
            <text
              x={x}
              y={y - node.val - 5}
              textAnchor="middle"
              fill="white"
              fontSize="10"
              style={{ pointerEvents: 'none' }}
            >
              {node.verse.book}
            </text>
          </g>
        );
      })}
    </g>
  );
}

function VerseDetails({ verse, connections }: { verse: Verse; connections: Array<{ verse: Verse; type: string }> }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h3 className="text-xl font-bold mb-2">{verse.reference}</h3>
      <p className="text-sm opacity-80 mb-4 font-serif leading-relaxed">
        {verse.text}
      </p>

      {/* Themes */}
      {verse.themes && (
        <div className="mb-6">
          <p className="text-xs font-semibold opacity-70 mb-2">THEMES</p>
          <div className="flex flex-wrap gap-2">
            {verse.themes.map(theme => (
              <span key={theme} className="px-2 py-1 rounded-full text-xs bg-emerald-500/20 text-emerald-200">
                {theme}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Connections */}
      <div>
        <p className="text-xs font-semibold opacity-70 mb-3">CONNECTIONS ({connections.length})</p>
        <div className="space-y-3">
          {connections.map((conn, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold">{conn.verse.reference}</p>
                <span className={cn(
                  "text-xs px-2 py-0.5 rounded-full",
                  conn.type === 'thematic' && "bg-blue-500/20 text-blue-300",
                  conn.type === 'prophecy' && "bg-purple-500/20 text-purple-300",
                  conn.type === 'quotation' && "bg-pink-500/20 text-pink-300"
                )}>
                  {conn.type}
                </span>
              </div>
              <p className="text-xs opacity-70 line-clamp-2">
                {conn.verse.text}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="mb-4"
      >
        <svg className="w-16 h-16 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </motion.div>
      <p className="text-lg font-semibold mb-2">Explore the Network</p>
      <p className="text-sm opacity-70">
        Click on any node to see verse details and connections
      </p>
    </div>
  );
}

// Helper functions
function buildNetworkData(
  verses: Verse[],
  crossRefs: CrossReference[],
  filter: string
): { nodes: NetworkNode[]; links: NetworkLink[] } {
  const filteredVerses = filter === 'all'
    ? verses
    : verses.filter(v => v.scripture === filter);

  const colorMap = {
    'book-of-mormon': '#3B82F6',
    'doctrine-and-covenants': '#8B5CF6',
    'inspired-version': '#10B981'
  };

  const nodes: NetworkNode[] = filteredVerses.map(verse => ({
    id: verse.id,
    name: verse.reference,
    val: 15,
    color: colorMap[verse.scripture],
    verse
  }));

  const linkColorMap = {
    'thematic': '#60A5FA',
    'prophecy': '#A78BFA',
    'quotation': '#F472B6',
    'parallel': '#34D399',
    'fulfillment': '#FBBF24'
  };

  const links: NetworkLink[] = crossRefs
    .filter(cr =>
      filteredVerses.some(v => v.id === cr.sourceId) &&
      filteredVerses.some(v => v.id === cr.targetId)
    )
    .map(cr => ({
      source: cr.sourceId,
      target: cr.targetId,
      color: linkColorMap[cr.type] || '#60A5FA',
      type: cr.type
    }));

  return { nodes, links };
}

function getConnections(verseId: string, crossRefs: CrossReference[], verses: Verse[]) {
  return crossRefs
    .filter(cr => cr.sourceId === verseId || cr.targetId === verseId)
    .map(cr => {
      const targetId = cr.sourceId === verseId ? cr.targetId : cr.sourceId;
      const verse = verses.find(v => v.id === targetId);
      return verse ? { verse, type: cr.type } : null;
    })
    .filter(Boolean) as Array<{ verse: Verse; type: string }>;
}
