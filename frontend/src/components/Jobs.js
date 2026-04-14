import React, { useState, useEffect } from 'react';
import { getJobs, applyJob, getMyApplications } from '../api';
import { FiBriefcase, FiMapPin, FiClock, FiDollarSign } from 'react-icons/fi';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [activeView, setActiveView] = useState('browse');
  const [selectedJob, setSelectedJob] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadJobs();
    loadApplications();
  }, []);

  const loadJobs = async () => {
    try {
      const response = await getJobs();
      setJobs(response.data);
    } catch (error) {
      console.error('Failed to load jobs:', error);
    }
  };

  const loadApplications = async () => {
    try {
      const response = await getMyApplications();
      setApplications(response.data);
    } catch (error) {
      console.error('Failed to load applications:', error);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (!coverLetter.trim()) {
      alert('Please write a cover letter');
      return;
    }

    setLoading(true);
    try {
      await applyJob(selectedJob.id, { job_id: selectedJob.id, cover_letter: coverLetter, resume_url: '' });
      alert('Application submitted successfully!');
      setSelectedJob(null);
      setCoverLetter('');
      await loadApplications();
    } catch (error) {
      alert(error.response?.data?.detail || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto" data-testid="jobs-module">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Job Portal</h2>

      {/* View Toggle */}
      <div className="flex gap-2 mb-6">
        <button
          data-testid="browse-jobs-tab"
          onClick={() => setActiveView('browse')}
          className={`px-6 py-2 rounded-lg font-semibold transition-all ${
            activeView === 'browse' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'
          }`}
        >
          Browse Jobs
        </button>
        <button
          data-testid="my-applications-tab"
          onClick={() => setActiveView('applications')}
          className={`px-6 py-2 rounded-lg font-semibold transition-all ${
            activeView === 'applications' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'
          }`}
        >
          My Applications ({applications.length})
        </button>
      </div>

      {/* Browse Jobs View */}
      {activeView === 'browse' && (
        <div className="space-y-4">
          {jobs.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl">
              <p className="text-gray-500">No jobs available at the moment</p>
            </div>
          ) : (
            jobs.map((job) => (
              <div key={job.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow" data-testid="job-card">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{job.title}</h3>
                    <p className="text-lg text-gray-700 font-semibold">{job.company}</p>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                    {job.job_type}
                  </span>
                </div>

                <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <FiMapPin />
                    <span>{job.location}</span>
                  </div>
                  {job.salary_range && (
                    <div className="flex items-center gap-2">
                      <FiDollarSign />
                      <span>{job.salary_range}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <FiClock />
                    <span>Posted {new Date(job.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <p className="text-gray-700 mb-4">{job.description}</p>

                {job.requirements && job.requirements.length > 0 && (
                  <div className="mb-4">
                    <p className="font-semibold text-gray-900 mb-2">Requirements:</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      {job.requirements.map((req, idx) => (
                        <li key={idx}>{req}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <button
                  data-testid={`apply-job-button-${job.id}`}
                  onClick={() => setSelectedJob(job)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Apply Now
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* My Applications View */}
      {activeView === 'applications' && (
        <div className="space-y-4">
          {applications.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl">
              <p className="text-gray-500">No applications yet. Start applying to jobs!</p>
            </div>
          ) : (
            applications.map((app) => (
              <div key={app.id} className="bg-white rounded-xl shadow-sm p-6" data-testid="application-card">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{app.job_details?.title}</h3>
                    <p className="text-gray-700">{app.job_details?.company}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    app.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    app.status === 'shortlisted' ? 'bg-green-100 text-green-700' :
                    app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-2">
                  Applied on {new Date(app.created_at).toLocaleDateString()}
                </p>

                <div className="bg-gray-50 rounded-lg p-4 mt-4">
                  <p className="text-sm font-semibold text-gray-900 mb-2">Cover Letter:</p>
                  <p className="text-sm text-gray-700">{app.cover_letter}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Apply Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Apply for {selectedJob.title}</h2>
              <p className="text-gray-700 mb-6">at {selectedJob.company}</p>

              <form onSubmit={handleApply}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cover Letter *
                  </label>
                  <textarea
                    data-testid="cover-letter-input"
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    required
                    rows="8"
                    placeholder="Tell us why you're a great fit for this role..."
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    data-testid="submit-application-button"
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Submitting...' : 'Submit Application'}
                  </button>
                  <button
                    data-testid="cancel-application-button"
                    type="button"
                    onClick={() => {
                      setSelectedJob(null);
                      setCoverLetter('');
                    }}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Jobs;
