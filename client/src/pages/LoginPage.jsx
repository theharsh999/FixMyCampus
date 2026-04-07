import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wrench, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { loginUser } from '@/lib/store';
import { Link } from 'react-router-dom';

const API_BASE = "http://localhost:5001/api";

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setLoading(true);
    try {
      // Call student or admin login API based on role
      const endpoint = role === 'student'
        ? `${API_BASE}/auth/student/login`
        : `${API_BASE}/auth/admin/login`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const json = await res.json();

      if (!res.ok) {
        alert(json.message || "Login failed");
        return;
      }

      // Save user data to localStorage (includes name, role, email, department)
      loginUser(json.data);
      onLogin();
    } catch (err) {
      alert("Server error. Please try again.");
      console.error("Login error:", err.message);
    } finally {
      setLoading(false);
    }
  };

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
            Report issues. Track progress. Improve campus life.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <Input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Login as</label>
            <div className="grid grid-cols-2 gap-3">
              {['student', 'admin'].map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`rounded-lg border-2 p-3 text-sm font-semibold capitalize transition-all ${
                    role === r
                      ? 'border-primary bg-accent text-accent-foreground'
                      : 'border-border bg-card text-muted-foreground hover:border-primary/50'
                  }`}
                >
                  {r === 'student' ? ' Student' : ' Admin'}
                </button>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={!email.trim() || !password.trim() || loading}>
            {loading ? 'Logging in...' : 'Continue'} <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-medium hover:underline">
              Register here
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}

