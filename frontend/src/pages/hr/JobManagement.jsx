import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useApp } from '../../store/AppContext';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { Modal } from '../../components/UI/Modal';
import { Briefcase, MapPin, Plus, Trash2, Edit3, CheckCircle, ShieldAlert, Loader2 } from 'lucide-react';
import jobService from '../../services/jobService';

export default function JobManagement() {
  const { user, extractData, addToast } = useApp();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const fetchJobs = async () => {
    if (!user) return;
    try {
      setLoading(true);
      // Fetch ACTIVE, DRAFT, and INACTIVE jobs in parallel to get full list
      const [activeRes, draftRes, inactiveRes] = await Promise.all([
        jobService.getAll({ status: 'ACTIVE' }),
        jobService.getAll({ status: 'DRAFT' }),
        jobService.getAll({ status: 'INACTIVE' })
      ]);

      const combined = [
        ...(extractData(activeRes) || []),
        ...(extractData(draftRes) || []),
        ...(extractData(inactiveRes) || [])
      ];

      // Filter to only those created by the current recruiter
      const hrJobs = combined.filter(j => j.createdById === user.id);
      
      // Deduplicate by ID
      const uniqueJobs = Array.from(new Map(hrJobs.map(item => [item.id, item])).values());
      setJobs(uniqueJobs);
    } catch (err) {
      console.error('Failed to fetch HR jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [user]);

  const handleOpenAdd = () => {
    setEditingJob(null);
    reset({
      title: '',
      department: '',
      location: '',
      type: 'Full-time',
      status: 'ACTIVE',
      description: '',
      requirements: ''
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (job) => {
    setEditingJob(job);
    reset({
      title: job.title,
      department: job.department,
      location: job.location,
      type: job.type,
      status: job.status,
      description: job.description,
      requirements: job.requirements?.join(', ') || ''
    });
    setModalOpen(true);
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const reqList = data.requirements
        ? data.requirements.split(',').map((r) => r.trim()).filter(Boolean)
        : [];
      
      const jobData = {
        title: data.title,
        department: data.department,
        location: data.location,
        type: data.type,
        status: data.status, // 'ACTIVE', 'DRAFT', 'INACTIVE'
        description: data.description || '',
        requirements: reqList,
        skills: reqList // Use requirements as skills for parsing matching
      };

      if (editingJob) {
        await jobService.update(editingJob.id, jobData);
        addToast('Job position updated successfully!', 'success');
      } else {
        await jobService.create(jobData);
        addToast('Job position created successfully!', 'success');
      }
      setModalOpen(false);
      fetchJobs();
    } catch (err) {
      console.error('Failed to save job:', err);
      addToast(err.response?.data?.message || 'Failed to save job posting.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job offer? All applications under it will be lost.")) return;
    try {
      setLoading(true);
      await jobService.remove(jobId);
      addToast('Job position deleted successfully.', 'info');
      fetchJobs();
    } catch (err) {
      console.error('Failed to delete job:', err);
      addToast('Failed to delete job position.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading && jobs.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-slate-800 dark:text-white">Job Position Management</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Add, update, and manage job openings and applicant requirements</p>
        </div>
        <Button onClick={handleOpenAdd} variant="primary" size="sm" className="w-fit font-bold">
          <Plus className="w-4 h-4 mr-1.5" /> Create Job Posting
        </Button>
      </div>

      {/* Grid List */}
      {jobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.map((job) => (
            <Card key={job.id} className="p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    {job.department}
                  </span>
                  <span className={`px-2 py-0.5 border rounded-full text-[9px] font-bold ${
                    job.status === 'ACTIVE' 
                      ? 'bg-emerald-50 border-emerald-100 text-emerald-600' 
                      : job.status === 'DRAFT'
                        ? 'bg-amber-50 border-amber-100 text-amber-600'
                        : 'bg-slate-50 border-slate-100 text-slate-500'
                  }`}>
                    {job.status.toLowerCase()}
                  </span>
                </div>
                
                <h4 className="font-bold text-base text-slate-800 dark:text-white">{job.title}</h4>
                
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 font-semibold">
                  <span className="flex items-center gap-1 text-slate-500"><MapPin className="w-3.5 h-3.5" /> {job.location}</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-500">{job.type}</span>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 pt-1">
                  {job.description}
                </p>

                {job.requirements && job.requirements.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1.5">
                    {job.requirements.map((req, i) => (
                      <span key={i} className="text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-300 px-2 py-0.5 rounded">
                        {req}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Applicants: <span className="text-blue-500 dark:text-blue-400 font-extrabold">{job._count?.applications || 0}</span></span>
                
                <div className="flex gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(job)}
                    className="p-2 rounded-xl text-slate-400 hover:text-blue-500 hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent hover:border-slate-100 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(job.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 border border-transparent hover:border-slate-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center text-slate-400 max-w-md mx-auto space-y-3">
          <Briefcase className="w-12 h-12 mx-auto text-slate-350 dark:text-slate-650" />
          <h4 className="font-bold text-base text-slate-850 dark:text-slate-200">No Job Postings</h4>
          <p className="text-xs">Create your first job listing vacancy to open up candidate screening pipelines.</p>
          <Button onClick={handleOpenAdd} size="sm">Create Vacancy</Button>
        </Card>
      )}

      {/* CRUD Modal Form */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingJob ? "Edit Job Posting" : "New Job Posting"}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Job Title</label>
              <input
                type="text"
                placeholder="Staff Backend Engineer"
                {...register('title', { required: 'Job title is required' })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:outline-none focus:border-blue-500 text-sm"
              />
              {errors.title && <p className="text-xs text-rose-500 mt-1 flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> {errors.title.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Department</label>
              <input
                type="text"
                placeholder="Product Engineering"
                {...register('department', { required: 'Department is required' })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:outline-none focus:border-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Location</label>
              <input
                type="text"
                placeholder="Remote (US/Europe)"
                {...register('location', { required: 'Location is required' })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:outline-none focus:border-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Type</label>
              <select
                {...register('type')}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:outline-none focus:border-blue-500 text-sm"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Status</label>
              <select
                {...register('status')}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:outline-none focus:border-blue-500 text-sm"
              >
                <option value="ACTIVE">Active</option>
                <option value="DRAFT">Draft</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Requirements (Comma Separated)</label>
              <input
                type="text"
                placeholder="Node.js, Express, AWS Lambda, PostgreSQL"
                {...register('requirements', { required: 'Requirements are required' })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:outline-none focus:border-blue-500 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description</label>
            <textarea
              rows="3"
              placeholder="Provide a short description of the core responsibilities..."
              {...register('description')}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:outline-none focus:border-blue-500 text-sm resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={submitting}>
              {submitting ? (
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
              ) : null}
              {editingJob ? 'Update Position' : 'Create Position'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
