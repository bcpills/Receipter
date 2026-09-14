import React from 'react';
import { ReceiptTemplate } from '../types';
import { Receipt, FileText, Sparkles, Building2, AlignLeft } from 'lucide-react';

interface TemplateSelectorProps {
  currentTemplate: ReceiptTemplate;
  onSelectTemplate: (template: ReceiptTemplate) => void;
}

interface TemplateOption {
  id: ReceiptTemplate;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  tag: string;
}

const TEMPLATES: TemplateOption[] = [
  {
    id: 'modern',
    name: 'Modern Studio (Full Graphics)',
    description: 'Crisp contemporary styling with card layout, status badge & rich formatting',
    icon: FileText,
    tag: 'Recommended',
  },
  {
    id: 'boutique',
    name: 'Artisan Boutique',
    description: 'Refined serif typography with warm gold tones for salons & luxury',
    icon: Sparkles,
    tag: 'Elegant',
  },
  {
    id: 'corporate',
    name: 'Corporate Invoice',
    description: 'Formal business slip with navy header and detailed billing tables',
    icon: Building2,
    tag: 'Formal',
  },
  {
    id: 'minimal',
    name: 'Swiss Minimal',
    description: 'High-contrast typography with crisp border rules & understated lines',
    icon: AlignLeft,
    tag: 'Clean',
  },
  {
    id: 'thermal',
    name: 'Thermal Register Slip',
    description: 'Classic grocery & retail POS paper receipt with tear edges & monospace font',
    icon: Receipt,
    tag: 'Retro POS',
  },
];

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  currentTemplate,
  onSelectTemplate,
}) => {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Receipt Template
        </label>
        <span className="text-[11px] text-slate-400">5 styles available</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {TEMPLATES.map((tmpl) => {
          const Icon = tmpl.icon;
          const isSelected = currentTemplate === tmpl.id;
          return (
            <button
              key={tmpl.id}
              type="button"
              onClick={() => onSelectTemplate(tmpl.id)}
              className={`text-left p-3 rounded-xl border transition-all duration-200 relative flex flex-col justify-between ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1.5">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span
                  className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                    isSelected
                      ? 'bg-indigo-200/60 text-indigo-900'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {tmpl.tag}
                </span>
              </div>
              <div>
                <p className={`text-xs font-semibold ${isSelected ? 'text-indigo-950' : 'text-slate-800'}`}>
                  {tmpl.name}
                </p>
                <p className="text-[10px] text-slate-500 line-clamp-2 mt-0.5 leading-snug">
                  {tmpl.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
