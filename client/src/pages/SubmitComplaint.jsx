import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, ImagePlus, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createProblem } from '@/lib/api';
import { getCurrentUser } from '@/lib/store';
import { useNavigate } from 'react-router-dom';

const categories = ['Electrical', 'Cleaning', 'Network', 'Plumbing', 'Furniture', 'Other'];
const priorities = ['Low', 'Medium', 'High'];
const departments = ['COMP', 'IT', 'AIML', 'AIDS', 'ENTC', 'IoT', 'MECH', 'MME', 'CSE', 'ECS', 'CIVIL'];

export default function SubmitComplaint() {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(false);
  const [form, setForm] = useState({ title: '', category: '', priority: 'Medium', description: '', location: '' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
      setImageFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Stop repeated clicks while request is in progress or cooldown is active
    if (loading || cooldown) return;

    setLoading(true);
    setCooldown(true);

    try {
      const user = getCurrentUser();
      const department = user?.class;

      if (!department || !departments.includes(department)) {
        throw new Error('Invalid department mapping for current user. Please re-login.');
      }

      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('category', form.category);
      formData.append('priority', form.priority);
      formData.append('description', form.description);
      formData.append('location', form.location);
      formData.append('department', department);
      formData.append('createdBy', user?._id || '');

      if (imageFile) {
        formData.append('image', imageFile);
      }

      const problem = await createProblem(formData);
      setForm({ title: '', category: '', priority: 'Medium', description: '', location: '' });
      setImageFile(null);
      setImagePreview(null);
      setSubmitted(problem.ticketId);
    } catch (err) {
      console.error('Failed to submit:', err.message);
    } finally {
      setLoading(false);

      // Keep button disabled briefly to avoid accidental double submits
      setTimeout(() => {
        setCooldown(false);
      }, 2500);
    }
  };

  if (submitted) {
    return (
      <div className="container max-w-lg py-20 text-center space-y-6">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
          <CheckCircle className="mx-auto h-16 w-16 text-success" />
        </motion.div>
        <h2 className="text-2xl font-bold">Complaint Submitted!</h2>
        <p className="text-muted-foreground">Your ticket ID is</p>
        <p className="text-3xl font-extrabold text-primary">{submitted}</p>
        <p className="text-sm text-muted-foreground">You can track the status from your dashboard.</p>
        <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-8 px-4">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold mb-1">Submit a Complaint</h1>
        <p className="text-muted-foreground text-sm mb-6">Fill in the details below to report an issue on campus.</p>

        <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-border bg-card p-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title *</label>
            <Input
              placeholder="e.g. Fan not working in Room 204"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Category *</label>
              <Select value={form.category} onValueChange={(v) => setForm(f => ({ ...f, category: v }))}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Priority *</label>
              <Select value={form.priority} onValueChange={(v) => setForm(f => ({ ...f, priority: v }))}>
                <SelectTrigger><SelectValue placeholder="Select priority" /></SelectTrigger>
                <SelectContent>
                  {priorities.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Location *</label>
              <Input
                placeholder="e.g. Room 204, Block A"
                value={form.location}
                onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description *</label>
            <Textarea
              placeholder="Describe the issue in detail..."
              rows={4}
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Attach Photo (optional)</label>
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border-2 border-dashed border-border p-4 transition-colors hover:border-primary/50">
              <ImagePlus className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Click to upload</p>
                <p className="text-xs text-muted-foreground">JPG, PNG up to 5MB</p>
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </label>
            {imagePreview && (
              <img src={imagePreview} alt="Preview" className="mt-2 h-32 w-auto rounded-lg object-cover" />
            )}
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={loading || cooldown || !form.title || !form.category || !form.location || !form.description}
          >
            <Send className="mr-2 h-4 w-4" /> {loading ? 'Submitting...' : 'Submit Complaint'}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
