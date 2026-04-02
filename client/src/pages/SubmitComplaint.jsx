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

export default function SubmitComplaint() {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(null);
  const [form, setForm] = useState({ title: '', category: '', description: '', location: '', imageUrl: '' });
  const [imagePreview, setImagePreview] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
      setForm(f => ({ ...f, imageUrl: url }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = getCurrentUser();
      const problem = await createProblem({
        ...form,
        createdBy: user?.name || 'Student',
      });
      setSubmitted(problem.ticketId);
    } catch (err) {
      console.error('Failed to submit:', err.message);
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          <Button type="submit" size="lg" className="w-full" disabled={!form.title || !form.category || !form.location || !form.description}>
            <Send className="mr-2 h-4 w-4" /> Submit Complaint
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
