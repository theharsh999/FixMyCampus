import { motion } from 'framer-motion';
import { Wrench, ArrowRight, Shield, Eye, Zap, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '@/components/ThemeToggle';

const features = [
  { icon: Zap, title: 'Quick Reporting', desc: 'Submit complaints in under a minute with categories and photo proof.' },
  { icon: Eye, title: 'Full Transparency', desc: 'Track your ticket status in real-time. No hidden processes.' },
  { icon: Shield, title: 'Accountability', desc: 'Every complaint is tracked with ticket IDs and assigned staff.' },
  { icon: BarChart3, title: 'Smart Priority', desc: 'Urgent issues like leaks or shocks are auto-flagged for faster response.' },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="container relative py-20 md:py-32 px-4 text-center space-y-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/25">
              <Wrench className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
              Fix<span className="text-gradient">My</span>Campus
            </h1>
            <p className="mx-auto max-w-xl text-lg text-muted-foreground">
              A smarter way to report campus issues, track maintenance, and hold the system accountable. No more ignored complaints.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" onClick={() => navigate('/register')} className="text-base">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/login')} className="text-base">
                Login
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Problem */}
      <section className="container py-16 px-4">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mx-auto max-w-3xl text-center space-y-4">
          <h2 className="text-2xl md:text-3xl font-bold">The Problem</h2>
          <p className="text-muted-foreground">
            Students report issues via WhatsApp or verbally. There's no tracking, no accountability, no priority system. 
            Complaints get lost, ignored, or delayed — leading to a poor campus experience.
          </p>
        </motion.div>
      </section>

      {/* Features */}
      <section className="container py-16 px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">How It Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-xl border border-border bg-card p-6 space-y-3 hover:border-primary/30 transition-colors"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                <f.icon className="h-5 w-5 text-accent-foreground" />
              </div>
              <h3 className="font-semibold">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container py-20 px-4 text-center">
        <div className="mx-auto max-w-lg rounded-2xl border border-border bg-card p-8 space-y-4">
          <h2 className="text-xl font-bold">Ready to improve your campus?</h2>
          <p className="text-sm text-muted-foreground">Start reporting issues today and make your campus a better place.</p>
          <Button size="lg" onClick={() => navigate('/register')}>
            Launch FixMyCampus <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} FixMyCampus — Smart Complaint & Maintenance System
      </footer>
    </div>
  );
}
