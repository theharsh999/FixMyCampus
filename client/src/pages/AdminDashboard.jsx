import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, UserPlus, CheckCircle, Clock, Loader2, AlertTriangle, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { getProblems, updateProblem } from '@/lib/api';
import { getCurrentUser } from '@/lib/store';
import { StatusBadge, PriorityBadge } from '@/components/StatusBadge';
import { format } from 'date-fns';

export default function AdminDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [filter, setFilter] = useState('All');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [assignName, setAssignName] = useState('');
  const user = getCurrentUser();

  const refresh = async () => {
    try {
      const data = await getProblems(user?.department ? { department: user.department } : {});
      setComplaints(data);
    } catch (err) {
      console.error('Failed to fetch:', err.message);
    }
  };
  useEffect(() => { refresh(); }, []);

  const filtered = filter === 'All' ? complaints : complaints.filter(c => c.status === filter);

  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === 'Pending').length,
    inProgress: complaints.filter(c => c.status === 'In Progress').length,
    resolved: complaints.filter(c => c.status === 'Resolved').length,
    urgent: complaints.filter(c => c.priority === 'High').length,
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateProblem(id, { status });
      refresh();
    } catch (err) {
      console.error('Failed to update:', err.message);
    }
  };

  const handleAssign = async () => {
    if (selectedComplaint && assignName.trim()) {
      try {
        await updateProblem(selectedComplaint._id, { assignedTo: assignName.trim(), status: 'In Progress' });
        setSelectedComplaint(null);
        setAssignName('');
        refresh();
      } catch (err) {
        console.error('Failed to assign:', err.message);
      }
    }
  };

  return (
    <div className="container py-8 px-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground text-sm">Manage all campus complaints</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Total', value: stats.total, icon: Tag, color: 'text-foreground' },
          { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-warning' },
          { label: 'In Progress', value: stats.inProgress, icon: Loader2, color: 'text-info' },
          { label: 'Resolved', value: stats.resolved, icon: CheckCircle, color: 'text-success' },
          { label: 'Urgent', value: stats.urgent, icon: AlertTriangle, color: 'text-destructive' },
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

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {['All', 'Pending', 'In Progress', 'Resolved'].map(f => (
          <Button
            key={f}
            variant={filter === f ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(f)}
          >
            {f}
          </Button>
        ))}
      </div>

      {/* Table for desktop */}
      <div className="hidden md:block rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Ticket</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Title</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Category</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Location</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Priority</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Assigned</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c._id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs">{c.ticketId}</td>
                <td className="px-4 py-3 font-medium max-w-[200px] truncate">{c.title}</td>
                <td className="px-4 py-3">{c.category}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.location}</td>
                <td className="px-4 py-3"><PriorityBadge priority={c.priority} /></td>
                <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                <td className="px-4 py-3 text-muted-foreground">{c.assignedTo || '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    {c.status !== 'Resolved' && (
                      <>
                        <Button size="sm" variant="outline" onClick={() => { setSelectedComplaint(c); setAssignName(c.assignedTo || ''); }}>
                          <UserPlus className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleStatusChange(c._id, 'Resolved')}>
                          <CheckCircle className="h-3 w-3" />
                        </Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {filtered.map((c, i) => (
          <motion.div
            key={c._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl border border-border bg-card p-4 space-y-3"
          >
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono text-muted-foreground">{c.ticketId}</span>
              <StatusBadge status={c.status} />
              <PriorityBadge priority={c.priority} />
            </div>
            <h3 className="font-semibold">{c.title}</h3>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{c.location}</span>
              <span>{c.category}</span>
            </div>
            {c.assignedTo && <p className="text-xs text-muted-foreground">Assigned: {c.assignedTo}</p>}
            {c.status !== 'Resolved' && (
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => { setSelectedComplaint(c); setAssignName(c.assignedTo || ''); }}>
                  <UserPlus className="mr-1 h-3 w-3" /> Assign
                </Button>
                <Button size="sm" variant="outline" className="flex-1" onClick={() => handleStatusChange(c._id, 'Resolved')}>
                  <CheckCircle className="mr-1 h-3 w-3" /> Resolve
                </Button>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Assign dialog */}
      <Dialog open={!!selectedComplaint} onOpenChange={() => setSelectedComplaint(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Staff</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Assign a staff member to <strong>{selectedComplaint?.ticketId}</strong></p>
          <Input placeholder="Staff name" value={assignName} onChange={e => setAssignName(e.target.value)} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedComplaint(null)}>Cancel</Button>
            <Button onClick={handleAssign} disabled={!assignName.trim()}>Assign & Start</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
