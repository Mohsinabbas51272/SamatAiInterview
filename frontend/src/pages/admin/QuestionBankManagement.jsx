import React, { useState, useEffect } from 'react';
import { useApp } from '../../store/AppContext';
import questionService from '../../services/questionService';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { Modal } from '../../components/UI/Modal';
import { Database, Plus, Trash2, Edit3, Search, Filter, HelpCircle, Loader2 } from 'lucide-react';

export default function QuestionBankManagement() {
  const { extractData, addToast } = useApp();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  
  // Search & Filters state
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  
  // Form values
  const [formText, setFormText] = useState('');
  const [formCategory, setFormCategory] = useState('TECHNICAL');
  const [formDifficulty, setFormDifficulty] = useState('MEDIUM');
  const [formExpectedAnswer, setFormExpectedAnswer] = useState('');
  const [formTimeLimit, setFormTimeLimit] = useState(120);
  const [submitting, setSubmitting] = useState(false);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search.trim()) params.search = search;
      if (categoryFilter) params.category = categoryFilter;
      if (difficultyFilter) params.difficulty = difficultyFilter;

      const res = await questionService.getAll(params);
      const data = extractData(res) || [];
      setQuestions(data);
    } catch (err) {
      console.warn('Failed to load questions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, [search, categoryFilter, difficultyFilter]);

  const openCreateModal = () => {
    setSelectedQuestion(null);
    setFormText('');
    setFormCategory('TECHNICAL');
    setFormDifficulty('MEDIUM');
    setFormExpectedAnswer('');
    setFormTimeLimit(120);
    setIsModalOpen(true);
  };

  const openEditModal = (q) => {
    setSelectedQuestion(q);
    setFormText(q.text);
    setFormCategory(q.category);
    setFormDifficulty(q.difficulty);
    setFormExpectedAnswer(q.expectedAnswer || '');
    setFormTimeLimit(q.timeLimit || 120);
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formText.trim()) {
      addToast('Please fill out the question text.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        text: formText,
        category: formCategory,
        difficulty: formDifficulty,
        expectedAnswer: formExpectedAnswer,
        timeLimit: parseInt(formTimeLimit, 10),
      };

      if (selectedQuestion) {
        await questionService.update(selectedQuestion.id, payload);
        addToast('Question updated successfully!', 'success');
      } else {
        await questionService.create(payload);
        addToast('Question added to database successfully!', 'success');
      }
      setIsModalOpen(false);
      loadQuestions();
    } catch (err) {
      console.error('Failed to save question:', err);
      addToast(err.response?.data?.message || 'Failed to save question bank item.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this question from the bank?')) {
      return;
    }
    try {
      await questionService.delete(id);
      addToast('Question removed successfully!', 'success');
      loadQuestions();
    } catch (err) {
      addToast('Failed to delete question.', 'error');
    }
  };

  if (loading && questions.length === 0) {
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
          <h1 className="text-3xl font-extrabold tracking-tight">Question Bank</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Configure screening questions categorized by technical expertise and difficulty parameters.
          </p>
        </div>

        <Button onClick={openCreateModal} variant="primary" icon={<Plus className="w-4 h-4" />}>
          Add Question
        </Button>
      </div>

      {/* Filters Toolbar */}
      <Card className="p-4 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-grow w-full md:w-auto">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions text..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-205 dark:border-slate-800 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-slate-950 text-xs"
          />
        </div>

        <div className="flex gap-4 w-full md:w-auto items-center">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-205 dark:border-slate-800 focus:outline-none bg-white dark:bg-slate-950 text-xs font-semibold text-slate-550 w-full md:w-40"
          >
            <option value="">All Categories</option>
            <option value="TECHNICAL">Technical & Coding</option>
            <option value="BEHAVIORAL">Behavioral</option>
            <option value="SITUATIONAL">Situational</option>
            <option value="COMMUNICATION">Linguistic</option>
            <option value="APTITUDE">Reasoning</option>
          </select>

          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-205 dark:border-slate-800 focus:outline-none bg-white dark:bg-slate-950 text-xs font-semibold text-slate-550 w-full md:w-40"
          >
            <option value="">All Difficulties</option>
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>
        </div>
      </Card>

      {/* Table Listing */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-850 bg-slate-50 dark:bg-slate-900/50 text-slate-450 uppercase font-bold tracking-wider">
                <th className="p-4 w-7/12">Question Text</th>
                <th className="p-4">Category</th>
                <th className="p-4">Difficulty</th>
                <th className="p-4">Time Limit</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
              {questions.map((q) => (
                <tr key={q.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                  <td className="p-4 font-semibold text-slate-800 dark:text-slate-250 leading-relaxed max-w-sm md:max-w-md">
                    {q.text}
                  </td>
                  <td className="p-4">
                    <span className="font-semibold text-slate-500 uppercase tracking-wide">{q.category}</span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      q.difficulty === 'EASY' ? 'bg-emerald-500/10 text-emerald-600' :
                      q.difficulty === 'MEDIUM' ? 'bg-blue-500/10 text-blue-600' : 'bg-rose-500/10 text-rose-650'
                    }`}>
                      {q.difficulty}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500 font-mono">{q.timeLimit}s</td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEditModal(q)} className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500">
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(q.id)} className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-850 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {questions.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center p-12 text-slate-400">
                    No questions matched the parameters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Editor Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedQuestion ? 'Edit Question' : 'Add Question'}>
        <form onSubmit={handleSave} className="space-y-4 text-left">
          
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Question Text</label>
            <textarea
              required
              rows={3}
              value={formText}
              onChange={(e) => setFormText(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm focus:outline-none bg-white dark:bg-slate-950 text-slate-800 dark:text-white"
              placeholder="e.g. What is the difference between SQL and NoSQL?"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Category</label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs focus:outline-none bg-white dark:bg-slate-950 text-slate-800 dark:text-white"
              >
                <option value="TECHNICAL">TECHNICAL</option>
                <option value="BEHAVIORAL">BEHAVIORAL</option>
                <option value="SITUATIONAL">SITUATIONAL</option>
                <option value="COMMUNICATION">COMMUNICATION</option>
                <option value="APTITUDE">APTITUDE</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Difficulty</label>
              <select
                value={formDifficulty}
                onChange={(e) => setFormDifficulty(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs focus:outline-none bg-white dark:bg-slate-950 text-slate-800 dark:text-white"
              >
                <option value="EASY">EASY</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HARD">HARD</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Time Limit (seconds)</label>
              <input
                type="number"
                min="30"
                max="600"
                required
                value={formTimeLimit}
                onChange={(e) => setFormTimeLimit(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-sm focus:outline-none bg-white dark:bg-slate-950 text-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Expected Answer Bullets (Optional)</label>
            <textarea
              rows={3}
              value={formExpectedAnswer}
              onChange={(e) => setFormExpectedAnswer(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs focus:outline-none bg-white dark:bg-slate-950 text-slate-800 dark:text-white"
              placeholder="e.g. Scalability constraints, schemas vs dynamic fields..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Question'}
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
