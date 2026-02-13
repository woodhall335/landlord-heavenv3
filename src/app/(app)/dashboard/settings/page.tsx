/**
 * Account Settings Page
 *
 * User profile, password, and subscription management
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  subscription_tier: string | null;
  subscription_status: string | null;
  trial_ends_at: string | null;
  created_at: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Profile form
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      // First check auth with browser Supabase client
      const supabase = getSupabaseBrowserClient();
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

      if (authError || !authUser) {
        router.push('/auth/login');
        return;
      }

      // Then fetch profile data from API
      const response = await fetch('/api/users/me');

      if (response.ok) {
        const data = await response.json();
        setProfile(data.user);
        setFullName(data.user.full_name || '');
        setPhone(data.user.phone || '');
      } else {
        // API failed but user is authenticated - use basic info
        setProfile({
          id: authUser.id,
          email: authUser.email || '',
          full_name: authUser.user_metadata?.full_name || null,
          phone: authUser.user_metadata?.phone || null,
          subscription_tier: null,
          subscription_status: null,
          trial_ends_at: null,
          created_at: authUser.created_at || new Date().toISOString(),
        });
        setFullName(authUser.user_metadata?.full_name || '');
        setPhone(authUser.user_metadata?.phone || '');
      }
    } catch {
      setError('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSaving(true);

    try {
      const response = await fetch('/api/users/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          phone: phone,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Profile updated successfully');
        setProfile(data.user);
      } else {
        setError(data.error || 'Failed to update profile');
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Password changed successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setError(data.error || 'Failed to change password');
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (
      !confirm(
        'Are you sure you want to cancel your HMO Pro subscription? You will lose access at the end of your billing period.'
      )
    ) {
      return;
    }

    try {
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
      });

      if (response.ok) {
        alert('Subscription cancelled successfully');
        fetchProfile();
      } else {
        alert('Failed to cancel subscription');
      }
    } catch {
      alert('Failed to cancel subscription');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/auth/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getTierLabel = (tier: string | null): string => {
    if (!tier) return 'Free';
    const labels: Record<string, string> = {
      starter: 'Starter (1-5 properties)',
      growth: 'Growth (6-10 properties)',
      professional: 'Professional (11-15 properties)',
      enterprise: 'Enterprise (16-20 properties)',
    };
    return labels[tier] || tier;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card padding="large">
          <div className="text-center py-8">
            <h2 className="text-xl font-semibold text-charcoal mb-2">Failed to load profile</h2>
            <Link href="/dashboard">
              <Button variant="primary">Back to Dashboard</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <Container size="large" className="py-6">
          <div>
            <Link
              href="/dashboard"
              className="text-sm text-primary hover:text-primary-dark font-medium mb-2 inline-block"
            >
              ← Back to Dashboard
            </Link>
            <h1 className="text-3xl font-extrabold text-charcoal">Account Settings</h1>
            <p className="text-gray-600 mt-1">Manage your profile and subscription</p>
          </div>
        </Container>
      </div>

      <Container size="medium" className="py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-900">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-900">{success}</p>
          </div>
        )}

        <div className="space-y-6">
          {/* Profile Information */}
          <Card padding="large">
            <h2 className="text-xl font-semibold text-charcoal mb-6">Profile Information</h2>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <Input
                label="Email address"
                type="email"
                value={profile.email}
                onChange={() => {}}
                disabled
                helperText="Email cannot be changed"
              />

              <Input
                label="Full name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Smith"
              />

              <Input
                label="Phone number"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+44 7700 900000"
              />

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  loading={isSaving}
                  disabled={isSaving}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </Card>

          {/* Change Password */}
          <Card padding="large">
            <h2 className="text-xl font-semibold text-charcoal mb-6">Change Password</h2>

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <Input
                label="Current password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                required
              />

              <Input
                label="New password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                required
              />

              <Input
                label="Confirm new password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                required
              />

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  loading={isSaving}
                  disabled={isSaving}
                >
                  Update Password
                </Button>
              </div>
            </form>
          </Card>

          {/* HMO Pro Subscription - Hidden for V1, keeping code for future release
          <Card padding="large">
            <h2 className="text-xl font-semibold text-charcoal mb-6">HMO Pro Subscription</h2>

            {profile.subscription_tier ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-charcoal mb-1">
                      HMO Pro {getTierLabel(profile.subscription_tier)}
                    </div>
                    <div className="text-sm text-gray-600">
                      Status:{' '}
                      <Badge
                        variant={
                          profile.subscription_status === 'active' ? 'success' : 'neutral'
                        }
                        size="small"
                      >
                        {profile.subscription_status}
                      </Badge>
                    </div>
                    {profile.trial_ends_at && (
                      <div className="text-xs text-gray-500 mt-1">
                        Trial ends: {formatDate(profile.trial_ends_at)}
                      </div>
                    )}
                  </div>
                  {profile.subscription_status === 'active' && (
                    <Button
                      variant="outline"
                      size="small"
                      onClick={handleCancelSubscription}
                    >
                      Cancel Subscription
                    </Button>
                  )}
                </div>

                <Link href="/dashboard/hmo">
                  <Button variant="secondary" fullWidth>
                    Go to HMO Pro Dashboard
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">
                  You are not currently subscribed to HMO Pro
                </p>
                <Link href="/pricing">
                  <Button variant="primary">View HMO Pro Plans</Button>
                </Link>
              </div>
            )}
          </Card>
          */}

          {/* Account Actions */}
          <Card padding="large">
            <h2 className="text-xl font-semibold text-charcoal mb-6">Account Actions</h2>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <div className="font-medium text-charcoal mb-1">Member since</div>
                  <div className="text-sm text-gray-600">
                    {formatDate(profile.created_at)}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <div className="font-medium text-charcoal mb-1">Log out</div>
                  <div className="text-sm text-gray-600">
                    Sign out of your account on this device
                  </div>
                </div>
                <Button variant="outline" onClick={handleLogout}>
                  Log Out
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                <div>
                  <div className="font-medium text-red-900 mb-1">Delete account</div>
                  <div className="text-sm text-red-700">
                    Permanently delete your account and all data
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => alert('Please contact support to delete your account')}
                >
                  Delete Account
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </Container>
    </div>
  );
}
