import React, { useState, useEffect } from 'react';
import { useApp } from '../../store/AppContext';
import promptService from '../../services/promptService';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { Modal } from '../../components/UI/Modal';
import { Sliders, Terminal, Plus, Trash2, CheckCircle2, Award, Sparkles, Loader2, Edit3 } from 'lucide-react';

export default function PromptManagement() {
  const { extractData, addToast } = useApp();
  const [loading, setLoading] = useState(true);
  const [prompts, setPrompts] = useState([]);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  
  // Form fields
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('TECHNICAL');
  const [formTemplate, setFormTemplate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadPrompts = async () => {
    try {
      setLoading(true);
      const res = await promptService.getAll();
      const data = extractData(res) || [];
      setPrompts(data);
    } catch (err) {
      console.warn('Failed to load prompt templates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrompts();
  }, []);

  const openCreateModal = () => {
    setSelectedPrompt(null);
    setFormName('');
    setFormCategory('TECHNICAL');
    setFormTemplate('');
    setIsModalOpen(true);
  };

  const openEditModal = (p) => {
    setSelectedPrompt(p);
    setFormName(p.name);
    setFormCategory(p.category);
    setFormTemplate(p.template);
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formName.trim() || !formTemplate.trim()) {
      addToast('Please fill out all required fields.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      if (selectedPrompt) {
        // Edit existing prompt
        await promptService.update(selectedPrompt.id, {
          name: formName,
          category: formCategory,
          template: formTemplate,
        });
        addToast('Prompt template updated successfully!', 'success');
      } else {
        // Create new prompt
        await promptService.create({
          name: formName,
          category: formCategory,
          template: formTemplate,
        });
        addToast('Prompt template created successfully!', 'success');
      }
      setIsModalOpen(false);
      loadPrompts();
    } catch (err) {
      console.error('Failed to save prompt:', err);
      addToast(err.response?.data?.message || 'Failed to save prompt template.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleActivate = async (id) => {
    try {
      await promptService.activate(id);
      addToast('Prompt template activated successfully!', 'success');
      loadPrompts();
    } catch (err) {
      addToast('Failed to activate prompt template.', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this prompt template? This action cannot be undone.')) {
      return;
    }

    try {
      await promptService.delete(id);
      addToast('Prompt template deleted successfully!', 'success');
      loadPrompts();
    } catch (err) {
      addToast('Failed to delete prompt template.', 'error');
    }
  };

  if (loading && prompts.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">AI Prompt Management</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Manage system instructions for Aria technical evaluation vectors.
          </p>
        </div>

        <Button onClick={openCreateModal} variant="primary" icon={<Plus className="w-4 h-4" />}>
          Create Template
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {prompts.map((p) => (
          <Card key={p.id} className="p-6 flex flex-col justify-between h-80 relative overflow-hidden">
            <div className="space-y-4">
              <div className="flex justify-between items-start gap-3">
                <div>
                  <h4 className="font-bold text-sm text-slate-850 dark:text-slate-100 group-hover:text-blue-500 line-clamp-1">
                    {p.name}
                  </h4>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1 block">
                    Category: {p.category.toLowerCase()}
                  </span>
                </div>

                {p.isActive && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 border border-emerald-100 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-bold dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-450 shrink-0">
                    <CheckCircle2 className="w-3 h-3" /> Active
                  </span>
                )}
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-850 text-xs text-slate-550 dark:text-slate-400 font-mono line-clamp-5 whitespace-pre-wrap leading-relaxed">
                {p.template}
              </div>
            </div>

            {/* Bottom Actions toolbar */}
            <div className="border-t border-slate-100 dark:border-slate-850 pt-4 mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button onClick={() => openEditModal(p)} variant="secondary" size="sm" className="px-2">
                  <Edit3 className="w-3.5 h-3.5" />
                </Button>
                {!p.isActive && (
                  <Button onClick={() => handleDelete(p.id)} variant="danger" size="sm" className="px-2">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
              
              {!p.isActive && (
                <Button onClick={() => handleActivate(p.id)} variant="primary" size="sm">
                  Activate
                </Button>
              )}
            </div>
          </Card>
        ))}

        {prompts.length === 0 && (
          <div className="col-span-full text-center py-20 text-slate-400 border border-dashed border-slate-350 dark:border-slate-850 rounded-3xl flex flex-col justify-center items-center gap-3">
            <Terminal className="w-12 h-12 opacity-30" />
            <h4 className="font-bold text-base">No Prompt Templates</h4>
            <p className="text-sm max-w-xs mx-auto">Create a template to seed system instructions for the evaluation engine.</p>
          </div>
        )}
      </div>

      {/* Editor Modal Popup */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedPrompt ? 'Edit Prompt Template' : 'New Prompt Template'}>
        <form onSubmit={handleSave} className="space-y-4 text-left">
          
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Template Title</label>
            <input
              type="text"
              required
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm focus:outline-none bg-white dark:bg-slate-950 text-slate-800 dark:text-white"
              placeholder="e.g. Senior Frontend Specialist"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Question Category</label>
            <select
              value={formCategory}
              onChange={(e) => setFormCategory(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm focus:outline-none bg-white dark:bg-slate-950 text-slate-800 dark:text-white"
            >
              <option value="TECHNICAL">TECHNICAL</option>
              <option value="BEHAVIORAL">BEHAVIORAL</option>
              <option value="SITUATIONAL">SITUATIONAL</option>
              <option value="COMMUNICATION">COMMUNICATION</option>
              <option value="APTITUDE">APTITUDE</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System Template Prompt</label>
            <textarea
              required
              rows={8}
              value={formTemplate}
              onChange={(e) => setFormTemplate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-mono focus:outline-none bg-white dark:bg-slate-950 text-slate-800 dark:text-white"
              placeholder="You are Aria, a senior staff interviewer..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Template'}
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
