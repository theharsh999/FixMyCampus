import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wrench, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getCurrentUser, loginUser } from '@/lib/store';
import { useNavigate, Link } from 'react-router-dom';

const API_BASE = "http://localhost:5001/api";
const departments = ['COMP', 'IT', 'AIML', 'AIDS', 'ENTC', 'IoT', 'MECH', 'MME', 'CSE', 'ECS', 'CIVIL'];

export default function RegisterPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    class: '',
    rollNo: '',
    div: '',
    year: '',
    department: '',
  });

  const rollNoError = (() => {
    if (role !== 'student') return '';
    if (form.rollNo === '') return 'Roll number is required';

    const roll = Number(form.rollNo);
    if (Number.isNaN(roll) || roll < 1) return 'Invalid roll number';
    if (roll > 80) return 'Roll number cannot exceed 80';

    return '';
  })();

  const update = (field) => (e) => {
    setErrorMessage('');
    setSuccessMessage('');
    setForm(f => ({ ...f, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (role === 'student' && rollNoError) {
      setErrorMessage(rollNoError);
      return;
    }

    setLoading(true);

    try {
      // Build request body based on role
      const body = role === 'student'
        ? {
            name: form.name,
            email: form.email,
            password: form.password,
            class: form.class,
            rollNo: Number(form.rollNo),
            div: form.div,
            year: form.year,
          }
        : { name: form.name, email: form.email, password: form.password, department: form.department };

      const endpoint = role === 'student'
        ? `${API_BASE}/auth/student/register`
        : `${API_BASE}/auth/admin/register`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await res.json();

      if (!res.ok) {
        setErrorMessage(json.message || 'Registration failed');
        return;
      }

      const userData = json.data;
      loginUser(userData);
      console.log('Saved user:', getCurrentUser());

      if (userData?.role === 'admin') {
        window.location.href = '/admin';
      } else {
        window.location.href = '/dashboard';
      }
    } catch (err) {
      setErrorMessage('Server error. Please try again.');
      console.error("Register error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  // Check if form is valid based on role
  const isValid = role === 'student'
    ? form.name && form.email && form.password && form.class && form.rollNo !== '' && form.div && form.year && !rollNoError
    : form.name && form.email && form.password && form.department;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8"
      >
        {/* Logo */}
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/25">
            <Wrench className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Fix<span className="text-gradient">My</span>Campus
          </h1>
          <p className="text-muted-foreground text-sm">
            Create your account to get started.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-border bg-card p-6 shadow-sm">
          {/* Role Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Register as</label>
            <div className="grid grid-cols-2 gap-3">
              {['student', 'admin'].map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    setErrorMessage('');
                    setSuccessMessage('');
                    setRole(r);
                  }}
                  className={`rounded-lg border-2 p-3 text-sm font-semibold capitalize transition-all ${
                    role === r
                      ? 'border-primary bg-accent text-accent-foreground'
                      : 'border-border bg-card text-muted-foreground hover:border-primary/50'
                  }`}
                >
                  {r === 'student' ? 'Student' : 'Admin'}
                </button>
              ))}
            </div>
          </div>

          {/* Common Fields */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Full Name</label>
            <Input
              placeholder="Enter your name"
              value={form.name}
              onChange={update('name')}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={update('email')}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <Input
              type="password"
              placeholder="Create a password"
              value={form.password}
              onChange={update('password')}
              required
            />
          </div>

          {/* Student-Specific Fields */}
          {role === 'student' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Class</label>
                  <Select value={form.class} onValueChange={(value) => {
                    setErrorMessage('');
                    setSuccessMessage('');
                    setForm(f => ({ ...f, class: value }));
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Roll Number</label>
                  <Input
                    type="number"
                    min="1"
                    max="80"
                    placeholder="e.g. 12"
                    value={form.rollNo}
                    onChange={update('rollNo')}
                    required
                  />
                  {rollNoError && <p className="text-xs text-destructive">{rollNoError}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Division</label>
                  <Input
                    placeholder="e.g. A"
                    value={form.div}
                    onChange={update('div')}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Year</label>
                  <select
                    value={form.year}
                    onChange={update('year')}
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">Select year</option>
                    <option value="First Year">First Year</option>
                    <option value="Second Year">Second Year</option>
                    <option value="Third Year">Third Year</option>
                    <option value="Fourth Year">Fourth Year</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Admin-Specific Fields */}
          {role === 'admin' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Department</label>
              <Select value={form.department} onValueChange={(value) => {
                setErrorMessage('');
                setSuccessMessage('');
                setForm(f => ({ ...f, department: value }));
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {errorMessage && (
            <p className="text-sm text-red-500">{errorMessage}</p>
          )}

          {successMessage && (
            <p className="text-sm text-green-500">{successMessage}</p>
          )}

          <Button type="submit" className="w-full" size="lg" disabled={!isValid || loading}>
            {loading ? 'Registering...' : 'Register'} <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Login here
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
