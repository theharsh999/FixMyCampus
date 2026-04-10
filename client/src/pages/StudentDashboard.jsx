import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Clock, Loader, CheckCircle2, MapPin, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getProblems } from '@/lib/api';
import { getCurrentUser } from '@/lib/store';
import { StatusBadge, PriorityBadge } from '@/components/StatusBadge';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

export default function StudentDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();
  const user = getCurrentUser();

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProblem(null);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const department = user?.class || user?.department;
        const data = await getProblems(department ? { department } : {});
        setComplaints(data);
      } catch (err) {
        console.error('Failed to fetch:', err.message);
      }
    };
    fetchData();
  }, [user?.class, user?.department]);

  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === 'Pending').length,
    inProgress: complaints.filter(c => c.status === 'In Progress').length,
    resolved: complaints.filter(c => c.status === 'Resolved').length,
  };

  const filteredComplaints = complaints.filter((item) => {
    if (filter === 'all') return true;
    return item.status === filter;
  });

  const getSubmittedByText = (createdBy) => {
    if (!createdBy) return 'Unknown';
    if (typeof createdBy === 'object') {
      const yearMap = {
        'First Year': 'FE',
        'Second Year': 'SE',
        'Third Year': 'TE',
        'Fourth Year': 'BE',
      };
      if (createdBy.year || createdBy.class || createdBy.div || createdBy.rollNo) {
        return `${yearMap[createdBy.year] || createdBy.year || '-'} ${createdBy.class || '-'} ${createdBy.div || '-'} ${createdBy.rollNo ?? '-'}`;
      }
      return createdBy.name || 'Unknown';
    }
    return 'Unknown';
  };

  return (
    <div className="container py-8 px-4 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">My Complaints</h1>
          <p className="text-muted-foreground text-sm">Track your submitted issues</p>
        </div>
        <Button onClick={() => navigate('/submit')}>
          <Plus className="mr-2 h-4 w-4" /> New Complaint
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: stats.total, icon: Tag, color: 'text-foreground', key: 'all' },
          { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-warning', key: 'Pending' },
          { label: 'In Progress', value: stats.inProgress, icon: Loader, color: 'text-blue-500', key: 'In Progress' },
          { label: 'Resolved', value: stats.resolved, icon: CheckCircle2, color: 'text-success', key: 'Resolved' },
        ].map(s => (
          <button
            key={s.label}
            type="button"
            onClick={() => setFilter(s.key)}
            className={`rounded-xl border bg-card p-4 text-left transition-all ${filter === s.key ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'}`}
          >
            <div className="flex items-center gap-2 mb-1">
              <s.icon className={`h-4 w-4 ${s.color}`} />
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </button>
        ))}
      </div>

      {/* List */}
      {filteredComplaints.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-lg font-medium">
            {filter === 'Pending' && 'No pending complaints'}
            {filter === 'In Progress' && 'No complaints in progress'}
            {filter === 'Resolved' && 'No resolved complaints'}
            {filter === 'all' && 'No complaints found'}
          </p>
          <p className="text-sm mt-1">Try another filter or submit a new complaint.</p>
          {filter === 'all' && (
            <Button className="mt-4" onClick={() => navigate('/submit')}>Submit Complaint</Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredComplaints.map((c, i) => (
            <motion.div
              key={c._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-border bg-card p-4 min-h-[110px] hover:border-primary/30 hover:shadow-md hover:scale-[1.01] transition-all duration-200 cursor-pointer"
              onClick={() => {
                setSelectedProblem(c);
                setIsModalOpen(true);
              }}
            >
              <div className="flex gap-4 items-start">
                {c.issueImage?.url ? (
                  <img
                    src={c.issueImage.url}
                    alt="Issue"
                    className="h-20 w-20 rounded-lg object-cover border border-border flex-shrink-0"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-lg border border-border bg-muted flex-shrink-0" />
                )}

                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono text-muted-foreground">{c.ticketId}</span>
                    <StatusBadge status={c.status} />
                    <PriorityBadge priority={c.priority} />
                  </div>

                  <h3 className="font-semibold text-base leading-tight">{c.title}</h3>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{c.location}</span>
                    <span>{format(new Date(c.createdAt), 'dd MMM yyyy')}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {isModalOpen && selectedProblem && (
        <div
          className="fixed inset-0 z-50 bg-black/30 dark:bg-black/60 flex items-center justify-center px-4"
          onClick={closeModal}
        >
          <div
            className="relative bg-white text-black dark:bg-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl p-6 w-[90%] max-w-xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="absolute top-3 right-3 text-xl leading-none text-gray-700 dark:text-gray-300 hover:opacity-80"
              onClick={closeModal}
              aria-label="Close"
            >
              ❌
            </button>

            <h2 className="text-xl font-bold mb-4 pr-8">{selectedProblem.title}</h2>

            {selectedProblem.issueImage?.url && (
              <img
                src={selectedProblem.issueImage.url}
                alt="Issue"
                className="rounded-lg mb-4 max-h-60 w-full object-cover"
              />
            )}

            <div className="space-y-3 text-sm text-gray-800 dark:text-gray-200">
              <p><span className="font-semibold">Description:</span> {selectedProblem.description}</p>
              <p><span className="font-semibold">Submitted by:</span> {getSubmittedByText(selectedProblem.createdBy)}</p>
              <p><span className="font-semibold">Ticket ID:</span> {selectedProblem.ticketId}</p>
              <p><span className="font-semibold">Location:</span> {selectedProblem.location}</p>
              <p><span className="font-semibold">Date:</span> {format(new Date(selectedProblem.createdAt), 'dd MMM yyyy')}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold">Status:</span>
                <StatusBadge status={selectedProblem.status} />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold">Priority:</span>
                <PriorityBadge priority={selectedProblem.priority} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
