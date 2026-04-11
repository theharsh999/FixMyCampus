import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, CheckCircle, Clock, Loader2, AlertTriangle, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getProblems, getStaffByDepartment, resolveMediaUrl, updateProblem } from '@/lib/api';
import { getCurrentUser } from '@/lib/store';
import { StatusBadge, PriorityBadge } from '@/components/StatusBadge';
import { format } from 'date-fns';

export default function AdminDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [filter, setFilter] = useState('All');
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [assignMode, setAssignMode] = useState(false);
  const [assignedName, setAssignedName] = useState('');
  const [assignError, setAssignError] = useState('');
  const [staffList, setStaffList] = useState([]);
  const [selectedStaffEmail, setSelectedStaffEmail] = useState('');
  const [priorityEditMode, setPriorityEditMode] = useState(false);
  const [newPriority, setNewPriority] = useState('Medium');
  const [loadedImages, setLoadedImages] = useState({});
  const user = getCurrentUser();

  const getStaffDepartmentKey = (department) => {
    const departmentMap = {
      COMP: 'COMPS',
      CSE: 'COMPS',
      ECS: 'COMPS',
      AIDS: 'AI&DS',
      AIML: 'AI&ML',
      ENTC: 'EXTC',
    };

    return departmentMap[department] || department;
  };

  const markImageLoaded = (key) => {
    setLoadedImages((prev) => (prev[key] ? prev : { ...prev, [key]: true }));
  };

  const openModal = (problem) => {
    setSelectedProblem(problem);
    setIsModalOpen(true);
    setAssignMode(false);
    setAssignedName(problem.assignedTo || '');
    setAssignError('');
    setStaffList([]);
    setSelectedStaffEmail('');
    setPriorityEditMode(false);
    setNewPriority(problem.priority || 'Medium');
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProblem(null);
    setAssignMode(false);
    setAssignedName('');
    setAssignError('');
    setStaffList([]);
    setSelectedStaffEmail('');
    setPriorityEditMode(false);
    setNewPriority('Medium');
  };

  useEffect(() => {
    let cancelled = false;

    const loadStaffForComplaint = async () => {
      if (!isModalOpen || !selectedProblem?.department) {
        setStaffList([]);
        setSelectedStaffEmail('');
        return;
      }

      try {
        const departmentKey = getStaffDepartmentKey(selectedProblem.department);
        const staff = await getStaffByDepartment(departmentKey);

        if (cancelled) return;

        setStaffList(staff);

        const existingAssignee = staff.find(
          (member) =>
            member.name === selectedProblem.assignedTo || member.email === selectedProblem.assignedTo
        );

        setSelectedStaffEmail(existingAssignee?.email || '');
      } catch (err) {
        if (cancelled) return;
        setStaffList([]);
        setSelectedStaffEmail('');
        console.error('Failed to fetch staff:', err.message);
      }
    };

    loadStaffForComplaint();

    return () => {
      cancelled = true;
    };
  }, [isModalOpen, selectedProblem]);

  const formatYearShort = (year) => {
    const map = {
      'First Year': 'FE',
      'Second Year': 'SE',
      'Third Year': 'TE',
      'Fourth Year': 'BE',
    };
    return map[year] || year || '-';
  };

  const getStudentIdentity = (student) => {
    if (!student || typeof student !== 'object') {
      return 'Student info not available';
    }

    const year = formatYearShort(student.year);
    const studentClass = student.class || '-';
    const div = student.div || '-';
    const rollNo = student.rollNo ?? '-';

    return `${year} ${studentClass} ${div} ${rollNo}`;
  };

  const refresh = async () => {
    try {
      const data = await getProblems(user?.department ? { department: user.department } : {});
      setComplaints(data);
    } catch (err) {
      console.error('Failed to fetch:', err.message);
    }
  };
  useEffect(() => { refresh(); }, [user?.department]);

  const STATUS_SORT = { 'Pending': 1, 'In Progress': 2, 'Resolved': 3 };

  const sorted = [...complaints].sort((a, b) => {
    // 1) Unassigned & not resolved → top
    // 2) Assigned (In Progress) → middle
    // 3) Resolved → bottom
    const groupOf = (c) => {
      if (c.status === 'Resolved') return 3;
      if (c.assignedTo) return 2;
      return 1;
    };

    const groupDiff = groupOf(a) - groupOf(b);
    if (groupDiff !== 0) return groupDiff;

    // Within same group: highest priority first, then newest first
    const PRIO = { 'High': 1, 'Medium': 2, 'Low': 3 };
    const prioDiff = (PRIO[a.priority] || 4) - (PRIO[b.priority] || 4);
    if (prioDiff !== 0) return prioDiff;

    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const activeComplaints = sorted.filter(c => c.status !== 'Resolved');
  const filtered = filter === 'All' ? activeComplaints : sorted.filter(c => c.status === filter);

  const stats = {
    total: activeComplaints.length,
    pending: complaints.filter(c => c.status === 'Pending').length,
    inProgress: complaints.filter(c => c.status === 'In Progress').length,
    resolved: complaints.filter(c => c.status === 'Resolved').length,
    urgent: activeComplaints.filter(c => c.priority === 'High').length,
  };

  const renderImpactBadge = (complaint) => {
    const dupes = Number(complaint?.duplicateCount || 0);
    const reportedCount = dupes + 1;

    if (reportedCount < 2) return null;

    const isHighImpact = reportedCount > 5;

    return (
      <span
        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${
          isHighImpact
            ? 'bg-rose-500/15 text-rose-400'
            : 'bg-amber-500/10 text-amber-400'
        }`}
      >
         {reportedCount} reported
      </span>
    );
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateProblem(id, { status });
      refresh();
    } catch (err) {
      console.error('Failed to update:', err.message);
    }
  };

  const handleAssignSave = async () => {
    if (!selectedProblem) return;

    const selectedStaff = staffList.find((staff) => staff.email === selectedStaffEmail);
    const name = selectedStaff?.name || assignedName.trim();

    if (!name) {
      setAssignError('Please select a staff member');
      return;
    }

    try {
      setAssignError('');

      await updateProblem(selectedProblem._id, { assignedTo: name });

      // Update popup data immediately
      setSelectedProblem((prev) => ({
        ...prev,
        assignedTo: name,
      }));

      // Update list data immediately (backend also sets status to In Progress)
      setComplaints((prev) =>
        prev.map((item) =>
          item._id === selectedProblem._id
            ? { ...item, assignedTo: name, status: 'In Progress' }
            : item
        )
      );

      setSelectedProblem((prev) => ({
        ...prev,
        status: 'In Progress',
      }));

      setAssignMode(false);
      setAssignedName(name);
      setSelectedStaffEmail(selectedStaff?.email || '');
    } catch (err) {
      console.error('Assign failed', err);
    }
  };

  const handleResolveFromModal = async () => {
    if (!selectedProblem) return;

    try {
      await updateProblem(selectedProblem._id, { status: 'Resolved' });
      closeModal();
      refresh();
    } catch (err) {
      console.error('Failed to resolve:', err.message);
    }
  };

  const handlePrioritySave = async () => {
    if (!selectedProblem) return;

    try {
      await updateProblem(selectedProblem._id, {
        priority: newPriority,
      });

      // Update popup instantly
      setSelectedProblem((prev) => ({
        ...prev,
        priority: newPriority,
      }));

      // Update list instantly
      setComplaints((prev) =>
        prev.map((item) =>
          item._id === selectedProblem._id
            ? { ...item, priority: newPriority }
            : item
        )
      );

      setPriorityEditMode(false);
    } catch (err) {
      console.error('Priority update failed', err);
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
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Image</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Category</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Location</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Priority</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Impact</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr
                key={c._id}
                className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                onClick={() => openModal(c)}
              >
                <td className="px-4 py-3 font-mono text-xs">{c.ticketId}</td>
                <td className="px-4 py-3 font-medium max-w-[200px] truncate">{c.title}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{format(new Date(c.createdAt), 'dd MMM yyyy')}</td>
                <td className="px-4 py-3">
                  {c.issueImage?.url ? (
                    <div className="relative h-12 w-12">
                      {!loadedImages[`table-${c._id}`] && (
                        <div className="absolute inset-0 rounded-md bg-muted animate-pulse" />
                      )}
                      <img
                        src={resolveMediaUrl(c.issueImage.url)}
                        alt="Issue"
                        loading="lazy"
                        onLoad={() => markImageLoaded(`table-${c._id}`)}
                        className={`h-12 w-12 rounded-md object-cover border border-border transition-all duration-500 ${loadedImages[`table-${c._id}`] ? 'opacity-100 blur-0' : 'opacity-50 blur-sm'}`}
                      />
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">No image</span>
                  )}
                </td>
                <td className="px-4 py-3">{c.category}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.location}</td>
                <td className="px-4 py-3"><PriorityBadge priority={c.priority} /></td>
                <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                <td className="px-4 py-3">
                  {renderImpactBadge(c) || <span className="text-xs text-muted-foreground">-</span>}
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
            className="rounded-xl border border-border bg-card p-4 space-y-3 cursor-pointer"
            onClick={() => openModal(c)}
          >
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono text-muted-foreground">{c.ticketId}</span>
              <StatusBadge status={c.status} />
              <PriorityBadge priority={c.priority} />
            </div>
            <h3 className="font-semibold">{c.title}</h3>
            {renderImpactBadge(c)}
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{c.location}</span>
              <span>{c.category}</span>
              <span>{format(new Date(c.createdAt), 'dd MMM yyyy')}</span>
            </div>
            {c.issueImage?.url && (
              <div className="relative h-20 w-20">
                {!loadedImages[`mobile-${c._id}`] && (
                  <div className="absolute inset-0 rounded-md bg-muted animate-pulse" />
                )}
                <img
                  src={resolveMediaUrl(c.issueImage.url)}
                  alt="Issue"
                  loading="lazy"
                  onLoad={() => markImageLoaded(`mobile-${c._id}`)}
                  className={`h-20 w-20 rounded-md object-cover border border-border transition-all duration-500 ${loadedImages[`mobile-${c._id}`] ? 'opacity-100 blur-0' : 'opacity-50 blur-sm'}`}
                />
              </div>
            )}
            {c.assignedTo && <p className="text-xs text-muted-foreground">Assigned: {c.assignedTo}</p>}
          </motion.div>
        ))}
      </div>

      {isModalOpen && selectedProblem && (
        <div
          className="fixed inset-0 z-50 bg-black/30 dark:bg-black/60 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-border bg-card text-foreground p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="absolute top-3 right-3 text-lg hover:opacity-80"
              onClick={closeModal}
              aria-label="Close"
            >
              ❌
            </button>

            <h2 className="text-2xl font-bold pr-8 mb-4">{selectedProblem.title}</h2>

            {selectedProblem.issueImage?.url ? (
              <div className="relative w-full max-h-72 rounded-lg border border-border mb-4 overflow-hidden">
                {!loadedImages[`modal-${selectedProblem._id}`] && (
                  <div className="absolute inset-0 bg-muted animate-pulse" />
                )}
                <img
                  src={resolveMediaUrl(selectedProblem.issueImage.url)}
                  alt="Issue"
                  loading="lazy"
                  onLoad={() => markImageLoaded(`modal-${selectedProblem._id}`)}
                  className={`w-full max-h-72 object-cover rounded-lg transition-all duration-500 ${loadedImages[`modal-${selectedProblem._id}`] ? 'opacity-100 blur-0' : 'opacity-50 blur-sm'}`}
                />
              </div>
            ) : (
              <div className="w-full h-40 rounded-lg border border-border bg-muted mb-4 flex items-center justify-center text-sm text-muted-foreground">
                No image uploaded
              </div>
            )}

            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold">Submitted by:</p>
                <p className="text-sm text-muted-foreground">{getStudentIdentity(selectedProblem.createdBy)}</p>
              </div>

              <div>
                <p className="text-sm font-semibold">Description:</p>
                <p className="text-sm text-muted-foreground">{selectedProblem.description}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <p><span className="font-semibold">Ticket:</span> {selectedProblem.ticketId}</p>
                <p><span className="font-semibold">Location:</span> {selectedProblem.location}</p>
                <p><span className="font-semibold">Date:</span> {format(new Date(selectedProblem.createdAt), 'dd MMM yyyy')}</p>
              </div>

              <p className="text-sm">
                <span className="font-semibold">Assigned to:</span> {selectedProblem.assignedTo || 'Not assigned'}
              </p>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold">Status:</span>
                <StatusBadge status={selectedProblem.status} />
                <span className="text-sm font-semibold ml-2">Priority:</span>
                <PriorityBadge priority={selectedProblem.priority} />
                {renderImpactBadge(selectedProblem)}
              </div>

              <div className="pt-2 flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  onClick={() => {
                    setAssignMode(true);
                    setAssignedName(selectedProblem.assignedTo || '');
                    setAssignError('');
                  }}
                >
                  {selectedProblem.assignedTo ? 'Reassign' : 'Assign'}
                </Button>
                <Button onClick={handleResolveFromModal} disabled={selectedProblem.status === 'Resolved'}>
                  Mark as Resolved
                </Button>
                <Button
                  variant={priorityEditMode ? 'default' : 'outline'}
                  onClick={() => {
                    setPriorityEditMode(true);
                    setNewPriority(selectedProblem.priority || 'Medium');
                  }}
                >
                  Change Priority
                </Button>
              </div>

              {priorityEditMode && (
                <div className="mt-3 rounded-xl border border-border/80 bg-muted/30 p-3 sm:p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold">Update Complaint Priority</p>
                    <PriorityBadge priority={newPriority} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-2">
                    <Select value={newPriority} onValueChange={setNewPriority}>
                      <SelectTrigger className="bg-background/90">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button variant="outline" onClick={handlePrioritySave}>
                      Save Priority
                    </Button>
                    <Button variant="ghost" onClick={() => setPriorityEditMode(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {assignMode && (
                <div className="mt-2">
                  <div className="flex gap-2 flex-wrap">
                    <select
                      value={selectedStaffEmail}
                      onChange={(e) => {
                        const selectedEmail = e.target.value;
                        const selectedStaff = staffList.find((staff) => staff.email === selectedEmail);

                        setSelectedStaffEmail(selectedEmail);
                        setAssignedName(selectedStaff?.name || '');
                        setAssignError('');
                      }}
                      className="border border-border rounded-md px-2 py-1 w-full bg-background"
                    >
                      <option value="">
                        {staffList.length ? 'Select Staff' : 'No staff available for this department'}
                      </option>
                      {staffList.map((staff) => (
                        <option key={staff.email} value={staff.email}>
                          {staff.name}
                        </option>
                      ))}
                    </select>
                    <Button variant="outline" onClick={handleAssignSave}>Save</Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setAssignMode(false);
                        setSelectedStaffEmail('');
                        setAssignError('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                  {selectedStaffEmail && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {staffList.find((staff) => staff.email === selectedStaffEmail)?.email}
                    </p>
                  )}
                  {assignError && (
                    <p className="text-xs text-red-500 mt-1">{assignError}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
