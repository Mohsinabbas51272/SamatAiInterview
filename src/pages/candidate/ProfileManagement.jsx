import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useApp } from '../../store/AppContext';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { User, Mail, Phone, MapPin, Briefcase, FileText, CheckCircle2, ShieldAlert, Link, ExternalLink, Globe, Loader2 } from 'lucide-react';

export default function ProfileManagement() {
  const { user, profile, updateProfile } = useApp();
  const [submitting, setSubmitting] = useState(false);

  const defaultValues = {
    firstName: profile?.firstName || '',
    lastName: profile?.lastName || '',
    title: profile?.title || '',
    phone: profile?.phone || '',
    location: profile?.location || '',
    skills: profile?.skills?.join(', ') || '',
    bio: profile?.bio || '',
    yearsOfExperience: profile?.yearsOfExperience || 0,
    linkedinUrl: profile?.linkedinUrl || '',
    githubUrl: profile?.githubUrl || '',
    portfolioUrl: profile?.portfolioUrl || '',
  };

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues
  });

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const skillsArray = data.skills
        ? data.skills.split(',').map(s => s.trim()).filter(Boolean)
        : [];
      
      const payload = {
        ...data,
        skills: skillsArray,
        yearsOfExperience: parseInt(data.yearsOfExperience, 10) || 0,
      };

      await updateProfile(payload);
    } finally {
      setSubmitting(false);
    }
  };

  const fullName = profile ? `${profile.firstName} ${profile.lastName}` : (user?.name || user?.email || 'Candidate');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold font-display text-slate-800 dark:text-white">Profile Management</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your professional contact details and bio data</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Avatar Card */}
        <Card className="p-6 flex flex-col items-center justify-center text-center space-y-4 h-fit">
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-3xl font-display uppercase shadow-lg shadow-blue-500/20">
              {fullName.charAt(0)}
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-4 border-white dark:border-slate-900" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-base text-slate-800 dark:text-white">{fullName}</h4>
            <p className="text-xs text-slate-500 font-semibold">{profile?.title || 'Job Seeker'}</p>
            <p className="text-xs text-slate-400">{profile?.location || 'Location not specified'}</p>
          </div>
          {profile?.skills && profile.skills.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 justify-center pt-2">
              {profile.skills.map((skill, idx) => (
                <span key={idx} className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-full border border-blue-100 dark:border-blue-900/30">
                  {skill.trim()}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">No skills listed yet.</p>
          )}
        </Card>

        {/* Right Form Card */}
        <Card className="p-6 lg:col-span-2">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* First Name */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">First Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    {...register('firstName', { required: 'First name is required' })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none transition-colors text-sm"
                  />
                </div>
                {errors.firstName && (
                  <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3" /> {errors.firstName.message}
                  </p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Last Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    {...register('lastName', { required: 'Last name is required' })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none transition-colors text-sm"
                  />
                </div>
                {errors.lastName && (
                  <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3" /> {errors.lastName.message}
                  </p>
                )}
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Professional Title</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Briefcase className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    {...register('title', { required: 'Title is required' })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none transition-colors text-sm"
                  />
                </div>
                {errors.title && (
                  <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3" /> {errors.title.message}
                  </p>
                )}
              </div>

              {/* Email (Read Only) */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Email Address (Primary)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-900 focus:outline-none text-sm text-slate-400 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Phone Number</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Phone className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    {...register('phone')}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none transition-colors text-sm"
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Location</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <MapPin className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    {...register('location')}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none transition-colors text-sm"
                  />
                </div>
              </div>

              {/* Experience */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Years of Experience</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Briefcase className="w-4 h-4" />
                  </span>
                  <input
                    type="number"
                    {...register('yearsOfExperience', { min: 0 })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none transition-colors text-sm"
                  />
                </div>
              </div>

              {/* Skills Tags */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Key Skills (Comma Separated)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <FileText className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    {...register('skills')}
                    placeholder="React, TypeScript, CSS Grid"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none transition-colors text-sm"
                  />
                </div>
              </div>

              {/* LinkedIn */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">LinkedIn URL</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Link className="w-4 h-4" />
                  </span>
                  <input
                    type="url"
                    {...register('linkedinUrl')}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none transition-colors text-sm"
                  />
                </div>
              </div>

              {/* GitHub */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">GitHub URL</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <ExternalLink className="w-4 h-4" />
                  </span>
                  <input
                    type="url"
                    {...register('githubUrl')}
                    placeholder="https://github.com/username"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none transition-colors text-sm"
                  />
                </div>
              </div>

              {/* Portfolio */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Portfolio Website</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Globe className="w-4 h-4" />
                  </span>
                  <input
                    type="url"
                    {...register('portfolioUrl')}
                    placeholder="https://yourwebsite.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none transition-colors text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Biography / Short Summary</label>
              <textarea
                rows="4"
                {...register('bio')}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none transition-colors text-sm resize-none"
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" variant="primary" size="md" disabled={submitting}>
                {submitting ? (
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 mr-1.5" />
                )}
                Save Changes
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
