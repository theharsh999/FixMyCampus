import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getCurrentUser, loginUser } from '@/lib/store';
import { getProblems, getProfile, resolveMediaUrl } from '@/lib/api';

const API_BASE = 'http://localhost:5001/api';

export default function ProfilePage({ onProfileUpdate }) {
  const [user, setUser] = useState(getCurrentUser());
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [activity, setActivity] = useState({ total: 0, pending: 0, resolved: 0 });
  const [profileImgLoaded, setProfileImgLoaded] = useState(false);

  const initials = useMemo(() => {
    const base = (user?.name || '').trim();
    return (base[0] || 'U').toUpperCase();
  }, [user?.name]);

  const studentIdentity = useMemo(() => {
    if (user?.role !== 'student') return '';

    const yearMap = {
      'First Year': 'FE',
      'Second Year': 'SE',
      'Third Year': 'TE',
      'Fourth Year': 'BE',
    };

    const y = yearMap[user.year] || user.year || '-';
    const c = user.class || '-';
    const d = user.div || '-';
    const r = user.rollNo ?? '-';

    return `${y} ${c} ${d} ${r}`;
  }, [user]);

  const updateActivity = async (targetUser) => {
    if (!targetUser?._id || !targetUser?.role) return;

    try {
      const complaints = targetUser.role === 'admin'
        ? await getProblems({
            department: targetUser.department,
            role: 'admin',
            adminDepartment: targetUser.department,
          })
        : await getProblems({
            createdBy: targetUser._id,
            role: 'student',
            studentId: targetUser._id,
          });

      setActivity({
        total: complaints.length,
        pending: complaints.filter((item) => item.status === 'Pending').length,
        resolved: complaints.filter((item) => item.status === 'Resolved').length,
      });
    } catch (err) {
      console.error('Failed to fetch profile activity:', err.message);
    }
  };

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.email || !user?.role) return;

      try {
        const latestUser = await getProfile({ email: user.email, role: user.role });
        setUser(latestUser);
        setForm({ name: latestUser.name || '', email: latestUser.email || '' });
        loginUser(latestUser);
        await updateActivity(latestUser);
      } catch (err) {
        console.error('Failed to fetch profile:', err.message);
      }
    };

    loadProfile();
  }, [user?.email, user?.role]);

  useEffect(() => {
    setProfileImgLoaded(false);
  }, [user?.profileImage?.url]);

  if (!user) {
    return (
      <div className="container py-10 px-4">
        <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
          User not found. Please login again.
        </div>
      </div>
    );
  }

  const isStudent = user.role === 'student';

  const startEdit = () => {
    setForm({ name: user.name || '', email: user.email || '' });
    setError('');
    setSuccess('');
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setForm({ name: user.name || '', email: user.email || '' });
    setError('');
    setSuccess('');
    setIsEditing(false);
  };

  const saveProfile = () => {
    const trimmedName = form.name.trim();
    const trimmedEmail = form.email.trim();

    if (!trimmedName) {
      setError('Name cannot be empty');
      setSuccess('');
      return;
    }

    if (trimmedEmail && !/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
      setError('Please enter a valid email');
      setSuccess('');
      return;
    }

    const updatedUser = {
      ...user,
      name: trimmedName,
      email: trimmedEmail,
    };

    loginUser(updatedUser);
    setUser(updatedUser);
    setIsEditing(false);
    setError('');
    setSuccess('Profile updated successfully');
    onProfileUpdate?.();
  };

  const roleLabel = user.role === 'admin' ? 'Admin' : 'Student';

  const uploadProfilePhoto = async (file) => {
    if (!file || !user?.email || !user?.role) return;

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('email', user.email);
      formData.append('role', user.role);

      const res = await fetch(`${API_BASE}/auth/profile-image`, {
        method: 'PATCH',
        body: formData,
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || 'Failed to upload profile photo');
      }

      const updatedUser = json.data;
      loginUser(updatedUser);
      setUser(updatedUser);
      await updateActivity(updatedUser);
      setSuccess('Profile photo updated successfully');
      onProfileUpdate?.();
    } catch (err) {
      setError(err.message || 'Failed to upload profile photo');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    await uploadProfilePhoto(file);
  };

  return (
    <div className="container py-8 px-4">
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
          <p className="text-sm text-muted-foreground">Manage your account details and activity</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-200 hover:shadow-md">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-center gap-2">
                {user.profileImage?.url ? (
                  <div className="relative h-16 w-16">
                    {!profileImgLoaded && (
                      <div className="absolute inset-0 rounded-full bg-muted animate-pulse" />
                    )}
                    <img
                      src={resolveMediaUrl(user.profileImage.url)}
                      alt="Profile"
                      loading="lazy"
                      onLoad={() => setProfileImgLoaded(true)}
                      className={`h-16 w-16 rounded-full object-cover border border-border shadow-sm transition-all duration-500 ${profileImgLoaded ? 'opacity-100 blur-0' : 'opacity-50 blur-sm'}`}
                    />
                  </div>
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground shadow-sm">
                    {initials}
                  </div>
                )}

                <label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={uploading}
                  />
                  <span
                    className={`inline-flex cursor-pointer items-center rounded-md border px-3 py-1 text-xs font-medium transition-colors ${uploading ? 'cursor-not-allowed border-border text-muted-foreground' : 'border-border hover:bg-muted/60'}`}
                  >
                    {uploading ? 'Uploading...' : 'Change Photo'}
                  </span>
                </label>
              </div>
              <div className="space-y-1">
                <p className="text-xl font-bold leading-tight">{user.name}</p>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                    {roleLabel}
                  </span>
                  {isStudent && (
                    <span className="text-xs font-medium text-muted-foreground">{studentIdentity}</span>
                  )}
                </div>
              </div>
            </div>

            {!isEditing ? (
              <Button
                onClick={startEdit}
                className="w-full sm:w-auto transition-transform duration-150 hover:-translate-y-0.5"
              >
                Edit Profile
              </Button>
            ) : (
              <div className="flex w-full gap-2 sm:w-auto">
                <Button
                  onClick={saveProfile}
                  className="flex-1 sm:flex-none transition-transform duration-150 hover:-translate-y-0.5"
                >
                  Save Changes
                </Button>
                <Button
                  variant="outline"
                  onClick={cancelEdit}
                  className="flex-1 sm:flex-none"
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                value={isEditing ? form.name : user.name || ''}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                disabled={!isEditing}
                placeholder="Enter your name"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={isEditing ? form.email : user.email || ''}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                disabled={!isEditing}
                placeholder="Enter your email"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <Input value={roleLabel} disabled />
            </div>

            {user.role === 'admin' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Department</label>
                <Input value={user.department || ''} disabled />
              </div>
            )}

            {isStudent && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Class</label>
                  <Input value={user.class || ''} disabled />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Division</label>
                  <Input value={user.div || ''} disabled />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Year</label>
                  <Input value={user.year || ''} disabled />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Roll No</label>
                  <Input value={user.rollNo ?? ''} disabled />
                </div>
              </>
            )}
          </div>

          {error && <p className="mt-4 text-sm font-medium text-destructive">{error}</p>}
          {success && <p className="mt-4 text-sm font-medium text-green-600">{success}</p>}

          {selectedFile && !uploading && (
            <p className="mt-2 text-xs text-muted-foreground">Selected: {selectedFile.name}</p>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-200 hover:shadow-md">
          <h2 className="text-lg font-semibold">My Activity</h2>
          <p className="mt-1 text-xs text-muted-foreground">Quick summary of your complaint activity</p>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-background p-4 transition-colors hover:bg-muted/40">
              <p className="text-xs text-muted-foreground">Total Complaints</p>
              <p className="mt-1 text-2xl font-bold">{activity.total}</p>
            </div>
            <div className="rounded-xl border border-border bg-background p-4 transition-colors hover:bg-muted/40">
              <p className="text-xs text-muted-foreground">Pending</p>
              <p className="mt-1 text-2xl font-bold text-amber-600">{activity.pending}</p>
            </div>
            <div className="rounded-xl border border-border bg-background p-4 transition-colors hover:bg-muted/40">
              <p className="text-xs text-muted-foreground">Resolved</p>
              <p className="mt-1 text-2xl font-bold text-emerald-600">{activity.resolved}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}