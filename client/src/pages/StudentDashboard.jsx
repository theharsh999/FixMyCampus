import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Clock, Loader2, CheckCircle2, MapPin, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getProblems } from '@/lib/api';
import { getCurrentUser } from '@/lib/store';
import { StatusBadge, PriorityBadge } from '@/components/StatusBadge';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

export default function StudentDashboard() {
  const [complaints, setComplaints] = useState([]);
  const navigate = useNavigate();
  const user = getCurrentUser();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getProblems(user ? { createdBy: user.name } : {});
        setComplaints(data);
      } catch (err) {
        console.error('Failed to fetch:', err.message);
      }
    };
    fetchData();
  }, []);

  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === 'Pending').length,
    inProgress: complaints.filter(c => c.status === 'In Progress').length,
    resolved: complaints.filter(c => c.status === 'Resolved').length,
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
          { label: 'Total', value: stats.total, icon: Tag, color: 'text-foreground' },
          { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-warning' },
          { label: 'In Progress', value: stats.inProgress, icon: Loader2, color: 'text-info' },
          { label: 'Resolved', value: stats.resolved, icon: CheckCircle2, color: 'text-success' },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-1">
              <s.icon className={`h-4 w-4 ${s.color}`} />
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* List */}
      {complaints.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-lg font-medium">No complaints yet</p>
          <p className="text-sm mt-1">Submit your first complaint to get started.</p>
          <Button className="mt-4" onClick={() => navigate('/submit')}>Submit Complaint</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {complaints.map((c, i) => (
            <motion.div
              key={c._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-border bg-card p-4 hover:border-primary/30 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono text-muted-foreground">{c.ticketId}</span>
                    <StatusBadge status={c.status} />
                    <PriorityBadge priority={c.priority} />
                  </div>
                  <h3 className="font-semibold">{c.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{c.location}</span>
                    <span>{format(new Date(c.createdAt), 'dd MMM yyyy')}</span>
                  </div>
                </div>
                {c.imageUrl && (
                  <img src={c.imageUrl} alt="" className="h-16 w-16 rounded-lg object-cover flex-shrink-0" />
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
