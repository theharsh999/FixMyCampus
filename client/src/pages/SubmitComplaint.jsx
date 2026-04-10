import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Send, ImagePlus, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createProblem } from '@/lib/api';
import { getCurrentUser } from '@/lib/store';
import { useNavigate } from 'react-router-dom';
import profanityFilter from 'leo-profanity';

const categories = ['Electrical', 'Cleaning', 'Network', 'Plumbing', 'Furniture', 'Other'];
const priorities = ['Low', 'Medium', 'High'];
const departments = ['COMP', 'IT', 'AIML', 'AIDS', 'ENTC', 'IoT', 'MECH', 'MME', 'CSE', 'ECS', 'CIVIL'];

const advancedAbuseRoots = ['lodu', 'lund', 'lavd', 'lavda'];

export default function SubmitComplaint() {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(false);
  const [hasAbuse, setHasAbuse] = useState(false);
  const [showAbusePopup, setShowAbusePopup] = useState(false);
  const [errors, setErrors] = useState({
    title: '',
    description: '',
    location: '',
  });
  const [form, setForm] = useState({ title: '', category: '', priority: 'Medium', description: '', location: '' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  function normalizeText(text) {
    return text
      .toLowerCase()
      .replace(/[@4]/g, 'a')
      .replace(/[!1]/g, 'i')
      .replace(/0/g, 'o')
      .replace(/\s+/g, '');
  }

  function containsAbuse(text) {
    const normalized = normalizeText(text);

    return advancedAbuseRoots.some((word) => normalized.includes(word));
  }

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

    if (loading || cooldown) return;

    const trimmedTitle = form.title.trim();
    const trimmedDescription = form.description.trim();
    const trimmedLocation = form.location.trim();

    const newErrors = {
      title: '',
      description: '',
      location: '',
    };

    if (!trimmedTitle) {
      newErrors.title = 'Title cannot be empty';
    }

    if (!trimmedDescription) {
      newErrors.description = 'Description cannot be empty';
    }

    if (!trimmedLocation) {
      newErrors.location = 'Location cannot be empty';
    }

    setErrors(newErrors);

    if (newErrors.title || newErrors.description || newErrors.location) {
      return;
    }

    const fullText = `${form.title} ${form.description}`;
    if (!fullText.trim()) {
      setHasAbuse(false);
      setShowAbusePopup(false);
      return;
    }

    if (profanityFilter.check(fullText) || containsAbuse(fullText)) {
      setHasAbuse(true);
      setShowAbusePopup(true);
      return;
    }

    setErrors({ title: '', description: '', location: '' });
    setHasAbuse(false);
    setShowAbusePopup(false);
    setLoading(true);
    setCooldown(true);

    try {
      const user = getCurrentUser();
      const department = user?.class || user?.department;

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
      setTimeout(() => {
        setCooldown(false);
      }, 2500);
    }
  };

  if (submitted) {
    return (
      <div className="container max-w-lg py-20 space-y-6 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
          <CheckCircle className="w-16 h-16 mx-auto text-success" />
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
    <div className="container max-w-2xl px-4 py-8">
      {showAbusePopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-sm p-6 mx-4 space-y-4 text-center border border-red-500 shadow-xl bg-card rounded-xl"
          >
            <p className="text-lg font-bold text-red-500">Note:</p>
            <p className="text-muted-foreground">Please remove inappropriate words from your complaint</p>
            <Button
              onClick={() => setShowAbusePopup(false)}
              variant="destructive"
              className="w-full"
            >
              OK
            </Button>
          </motion.div>
        </div>
      )}

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="mb-1 text-2xl font-bold">Submit a Complaint</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Fill in the details below to report an issue on campus.
        </p>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 border rounded-xl border-border bg-card">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title *</label>
            <Input
              className={errors.title ? 'border-red-500 focus-visible:ring-red-500' : ''}
              placeholder="e.g. Fan not working in Room 204"
              value={form.title}
              onChange={(e) => {
                setForm((f) => ({ ...f, title: e.target.value }));
                setErrors((prev) => ({ ...prev, title: '' }));
              }}
              required
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Category *</label>
              <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Priority *</label>
              <Select value={form.priority} onValueChange={(v) => setForm((f) => ({ ...f, priority: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Location *</label>
              <Input
                className={errors.location ? 'border-red-500 focus-visible:ring-red-500' : ''}
                placeholder="e.g. Room 204, Block A"
                value={form.location}
                onChange={(e) => {
                  setForm((f) => ({ ...f, location: e.target.value }));
                  setErrors((prev) => ({ ...prev, location: '' }));
                }}
                required
              />
              {errors.location && (
                <p className="text-sm text-red-500">{errors.location}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description *</label>
            <Textarea
              className={hasAbuse || errors.description ? 'border-red-500 focus-visible:ring-red-500' : ''}
              placeholder="Describe the issue in detail..."
              rows={4}
              value={form.description}
              onChange={(e) => {
                setForm((f) => ({ ...f, description: e.target.value }));
                setErrors((prev) => ({ ...prev, description: '' }));
              }}
              required
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Attach Photo (optional)</label>
            <label className="flex items-center gap-3 p-4 transition-colors border-2 border-dashed rounded-lg cursor-pointer border-border hover:border-primary/50">
              <ImagePlus className="w-8 h-8 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Click to upload</p>
                <p className="text-xs text-muted-foreground">JPG, PNG up to 5MB</p>
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </label>

            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                className="object-cover w-auto h-32 mt-2 rounded-lg"
              />
            )}
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={loading || cooldown || !form.title || !form.category || !form.location || !form.description}
          >
            <Send className="w-4 h-4 mr-2" /> {loading ? 'Submitting...' : 'Submit Complaint'}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
