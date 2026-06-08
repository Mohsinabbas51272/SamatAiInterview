import React, { useState, useEffect } from 'react';
import { useApp } from '../../store/AppContext';
import auditLogService from '../../services/auditLogService';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { Modal } from '../../components/UI/Modal';
import { ScrollText, Search, ShieldAlert, Clock, Loader2, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';

export default function AuditLogs() {
  const { extractData, addToast } = useApp();
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  
  // Search & Filters state
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [limit] = useState(10);
  const [offset, setOffset] = useState(0);

  // Inspector modal
  const [selectedLog, setSelectedLog] = useState(null);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const params = {
        limit,
        offset,
      };
      if (search.trim()) params.search = search;
      if (actionFilter) params.action = actionFilter;

      const res = await auditLogService.getAll(params);
      const data = extractData(res) || [];
      setLogs(data);
    } catch (err) {
      console.warn('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [search, actionFilter, offset]);

  const handleNextPage = () => {
    if (logs.length === limit) {
      setOffset((prev) => prev + limit);
    }
  };

  const handlePrevPage = () => {
    setOffset((prev) => Math.max(0, prev - limit));
  };

  if (loading && logs.length === 0) {
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
          <h1 className="text-3xl font-extrabold tracking-tight">System Audit Logs</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Browse through system modifications, admin operations, and compliance telemetry.
          </p>
        </div>

        <Button onClick={loadLogs} variant="secondary" icon={<RefreshCw className="w-4.5 h-4.5" />}>
          Reload Logs
        </Button>
      </div>

      {/* Filters Toolbar */}
      <Card className="p-4 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-grow w-full md:w-auto">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setOffset(0);
            }}
            placeholder="Search by entity, actor ID, details..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-205 dark:border-slate-800 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-slate-950 text-xs"
          />
        </div>

        <div className="w-full md:w-48">
          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setOffset(0);
            }}
            className="w-full px-3 py-2 rounded-xl border border-slate-205 dark:border-slate-800 focus:outline-none bg-white dark:bg-slate-950 text-xs font-semibold text-slate-550"
          >
            <option value="">All Actions</option>
            <option value="UPDATE">UPDATE</option>
            <option value="CREATE">CREATE</option>
            <option value="DELETE">DELETE</option>
            <option value="LOGIN">LOGIN</option>
          </select>
        </div>
      </Card>

      {/* Table Listing */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-850 bg-slate-50 dark:bg-slate-900/50 text-slate-450 uppercase font-bold tracking-wider">
                <th className="p-4">Timestamp</th>
                <th className="p-4">Action</th>
                <th className="p-4">Entity</th>
                <th className="p-4">Entity ID</th>
                <th className="p-4">Actor ID</th>
                <th className="p-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                  <td className="p-4 font-mono text-slate-500 flex items-center gap-1.5 whitespace-nowrap">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      log.action.includes('DELETE') ? 'bg-rose-500/10 text-rose-650' :
                      log.action.includes('CREATE') ? 'bg-emerald-500/10 text-emerald-600' : 'bg-blue-500/10 text-blue-600'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="p-4 font-semibold text-slate-700 dark:text-slate-350">{log.entity}</td>
                  <td className="p-4 font-mono text-slate-450">{log.entityId}</td>
                  <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">
                    {log.User ? log.User.email : `User #${log.userId}`}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="text-xs font-semibold text-blue-500 hover:text-blue-600"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}

              {logs.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center p-12 text-slate-400">
                    No compliance records listed.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Toolbar */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-900/10 flex justify-between items-center">
          <Button onClick={handlePrevPage} disabled={offset === 0} variant="secondary" size="sm" icon={<ChevronLeft className="w-4 h-4" />}>
            Previous
          </Button>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Page Offset: {offset}
          </span>
          <Button onClick={handleNextPage} disabled={logs.length < limit} variant="secondary" size="sm" icon={<ChevronRight className="w-4 h-4" />}>
            Next
          </Button>
        </div>
      </Card>

      {/* Inspector Modal */}
      <Modal isOpen={!!selectedLog} onClose={() => setSelectedLog(null)} title="Audit Record Inspector">
        {selectedLog && (
          <div className="space-y-4 text-left">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="font-bold text-slate-400 block uppercase">Action Category</span>
                <span className="text-sm font-semibold">{selectedLog.action}</span>
              </div>
              <div>
                <span className="font-bold text-slate-400 block uppercase">Logged Timestamp</span>
                <span className="text-sm font-semibold">{new Date(selectedLog.createdAt).toLocaleString()}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs pt-2">
              <div>
                <span className="font-bold text-slate-400 block uppercase">Affected Entity</span>
                <span className="text-sm font-semibold">{selectedLog.entity}</span>
              </div>
              <div>
                <span className="font-bold text-slate-400 block uppercase font-mono">Entity ID</span>
                <span className="text-sm font-semibold font-mono">{selectedLog.entityId}</span>
              </div>
            </div>

            {selectedLog.oldValue && (
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Previous State</span>
                <pre className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-205 dark:border-slate-800 text-xs font-mono text-slate-700 dark:text-slate-400 overflow-x-auto whitespace-pre-wrap">
                  {selectedLog.oldValue}
                </pre>
              </div>
            )}

            {selectedLog.newValue && (
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">New State</span>
                <pre className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-205 dark:border-slate-800 text-xs font-mono text-slate-700 dark:text-slate-400 overflow-x-auto whitespace-pre-wrap">
                  {selectedLog.newValue}
                </pre>
              </div>
            )}

            {selectedLog.metadata && (
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Operations Metadata</span>
                <pre className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-205 dark:border-slate-800 text-[10px] font-mono text-slate-700 dark:text-slate-400 overflow-x-auto">
                  {JSON.stringify(selectedLog.metadata, null, 2)}
                </pre>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button onClick={() => setSelectedLog(null)} variant="primary">Close Audit Inspector</Button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}
