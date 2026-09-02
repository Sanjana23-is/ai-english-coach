import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  Coffee,
  Briefcase,
  Building2,
  GraduationCap,
  Plane,
  ShoppingBag,
  Theater,
  Scale,
  Presentation,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { mockConversationModes } from '../lib/mockData';
import type { DifficultyLevel, ModeCategory } from '../types/practice';

export function PracticePage() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<ModeCategory>('all');
  const [selectedLevel, setSelectedLevel] = useState<DifficultyLevel>('Intermediate');

  const levels: DifficultyLevel[] = [
    'Beginner',
    'Elementary',
    'Intermediate',
    'Upper Intermediate',
    'Advanced',
  ];

  const categories: { id: ModeCategory; label: string }[] = [
    { id: 'all', label: 'All Scenarios' },
    { id: 'everyday', label: 'Everyday & Travel' },
    { id: 'professional', label: 'Workplace & Career' },
    { id: 'academic', label: 'Ideas & Logic' },
    { id: 'creative', label: 'Creative & Spontaneous' },
    { id: 'challenge', label: 'Debates & Challenges' },
  ];

  const getModeIcon = (iconName: string) => {
    switch (iconName) {
      case 'Coffee':
        return <Coffee className="w-5 h-5 text-amber-300" />;
      case 'Briefcase':
        return <Briefcase className="w-5 h-5 text-amber-300" />;
      case 'Building2':
        return <Building2 className="w-5 h-5 text-amber-300" />;
      case 'GraduationCap':
        return <GraduationCap className="w-5 h-5 text-amber-300" />;
      case 'Plane':
        return <Plane className="w-5 h-5 text-amber-300" />;
      case 'ShoppingBag':
        return <ShoppingBag className="w-5 h-5 text-amber-300" />;
      case 'Theater':
        return <Theater className="w-5 h-5 text-amber-300" />;
      case 'Scale':
        return <Scale className="w-5 h-5 text-amber-300" />;
      case 'Presentation':
        return <Presentation className="w-5 h-5 text-amber-300" />;
      case 'Sparkles':
        return <Sparkles className="w-5 h-5 text-amber-300" />;
      default:
        return <MessageSquare className="w-5 h-5 text-amber-300" />;
    }
  };

  const filteredModes = mockConversationModes.filter((mode) => {
    if (mode.isUnstructured) return false;
    if (selectedCategory === 'all') return true;
    return mode.category === selectedCategory;
  });

  const unstructuredMode = mockConversationModes.find((m) => m.isUnstructured);

  return (
    <div className="space-y-9 animate-in fade-in duration-200">
      {/* Header & Level Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="text-xs text-amber-400 font-medium mb-1">Practice Catalog</div>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-zinc-100 tracking-tight">
            Speaking Scenarios
          </h1>
          <p className="text-sm text-zinc-400 mt-1 max-w-xl">
            Choose an everyday context to immerse yourself in, or speak freely without any topic
            boundaries.
          </p>
        </div>

        {/* Level Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 p-1.5 rounded-2xl bg-[#141416] border border-zinc-800/80">
          <span className="text-xs text-zinc-400 px-3">Target:</span>
          <div className="flex flex-wrap gap-1">
            {levels.map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setSelectedLevel(lvl)}
                className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer ${
                  selectedLevel === lvl
                    ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Freeform Conversation Hero (Human & Warm) */}
      {unstructuredMode && (
        <div className="p-7 rounded-3xl bg-gradient-to-b from-[#18181b] to-[#141416] border border-zinc-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="text-xs text-amber-400 font-medium flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Freeform Dialogue</span>
            </div>
            <h2 className="font-serif text-2xl font-normal text-zinc-100">
              {unstructuredMode.name}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              {unstructuredMode.fullDescription}
            </p>
          </div>

          <Button
            size="lg"
            variant="primary"
            onClick={() =>
              navigate(`/conversation/new?mode=${unstructuredMode.id}&level=${selectedLevel}`)
            }
            className="bg-amber-400 hover:bg-amber-300 text-zinc-950 font-semibold px-8 py-3.5 whitespace-nowrap rounded-2xl"
          >
            Start Open Chat
          </Button>
        </div>
      )}

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-zinc-800/40 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat.id)}
            className={`text-xs px-3.5 py-1.5 rounded-full transition-colors cursor-pointer whitespace-nowrap ${
              selectedCategory === cat.id
                ? 'bg-zinc-800 text-zinc-100 font-medium'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Scenarios Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredModes.map((mode) => (
          <div
            key={mode.id}
            onClick={() => navigate(`/conversation/new?mode=${mode.id}&level=${selectedLevel}`)}
            className="p-6 rounded-3xl bg-[#141416]/60 border border-zinc-800/60 hover:border-zinc-700 hover:bg-[#18181b]/60 transition-all cursor-pointer flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                {getModeIcon(mode.iconName)}
              </div>

              <div>
                <h3 className="font-serif text-lg font-medium text-zinc-100">{mode.name}</h3>
                <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed line-clamp-2">
                  {mode.shortDescription}
                </p>
              </div>

              <p className="text-xs text-zinc-400 italic line-clamp-2 pt-1 border-t border-zinc-800/40">
                "{mode.starterPrompt}"
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs text-amber-400/90 font-medium group">
              <span>Begin conversation</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
