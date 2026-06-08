import React from 'react';
import { useForm } from 'react-hook-form';
import { useApp } from '../../store/AppContext';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { Settings, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function AIConfiguration() {
  const { aiConfig, setAiConfig, addToast } = useApp();
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: aiConfig
  });

  const onSubmit = (data) => {
    const totalWeight = parseInt(data.screeningWeight) + parseInt(data.interviewWeight);
    if (totalWeight !== 100) {
      addToast('Screening and Interview weights must sum to exactly 100%.', 'error');
      return;
    }

    setAiConfig(data);
    addToast('AI Configuration weights updated successfully!', 'success');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold font-display text-slate-800 dark:text-white">AI Configuration</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Configure weights, prompts, and model properties for simulated evaluations</p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Model select */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">AI Assessment Model</label>
              <select
                {...register('model')}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:border-blue-500 text-sm"
              >
                <option value="gemini-1.5-pro">Gemini 1.5 Pro (Analytical/Reasoning)</option>
                <option value="gemini-1.5-flash">Gemini 1.5 Flash (Low-Latency)</option>
                <option value="gemini-2.0-flash">Gemini 2.0 Flash (Advanced Multimodal)</option>
              </select>
            </div>

            {/* Temperature Slider */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Temperature (Creativity/Randomness)</label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  {...register('temperature')}
                  className="flex-grow h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer focus:outline-none"
                />
                <span className="text-xs font-bold bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded text-slate-700 dark:text-slate-300">
                  {aiConfig.temperature}
                </span>
              </div>
            </div>

            {/* CV Match Weight */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">CV screening Weight %</label>
              <input
                type="number"
                min="0"
                max="100"
                {...register('screeningWeight', { required: 'Weight is required' })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:border-blue-500 text-sm"
              />
            </div>

            {/* Interview Assessment Weight */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Technical Interview Weight %</label>
              <input
                type="number"
                min="0"
                max="100"
                {...register('interviewWeight', { required: 'Weight is required' })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:border-blue-500 text-sm"
              />
            </div>
          </div>

          {/* System Prompt */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">System AI Evaluator Prompt</label>
            <textarea
              rows="4"
              {...register('systemPrompt', { required: 'System prompt is required' })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:border-blue-500 text-sm resize-none"
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" variant="primary" size="md">
              <CheckCircle2 className="w-4 h-4 mr-1.5" /> Save Configuration
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
