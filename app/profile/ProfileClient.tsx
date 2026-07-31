'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface Props {
  userId: string;
  user: any;
  stats: {
    totalWatched: number;
    totalWant: number;
    totalWatching: number;
    avgRating: string;
  };
  recent: any[];
  memberSince: string | null;
}

export default function ProfileClient({ userId, user, stats, recent, memberSince }: Props) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [image, setImage] = useState(user?.image || '');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatDate = (date: Date) => {
    if (!mounted) return '';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, image }),
      });
      if (res.ok) {
        setIsEditing(false);
        router.refresh();
      } else {
        alert('Failed to update profile');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch('/api/user/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setImage(data.imageUrl);
        await handleSave(); // auto-save
      } else {
        alert('Failed to upload image');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div className="bg-surface rounded-2xl border border-border p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-primary shadow-lg">
            <Image
              src={image || '/default-avatar.png'}
              alt="Profile"
              fill
              className="object-cover"
            />
            {isEditing && (
              <label className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs text-center py-1 cursor-pointer hover:bg-black/80 transition">
                {uploading ? 'Uploading...' : 'Change'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
              </label>
            )}
          </div>
          <div className="flex-1 text-center md:text-left">
            {isEditing ? (
              <div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border text-white"
                  placeholder="Your name"
                />
                {/* Image URL input removed */}
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold">{name || 'User'}</h2>
                <p className="text-gray-400 text-sm">
                  Member since {mounted && memberSince ? formatDate(new Date(memberSince)) : 'N/A'}
                </p>
              </>
            )}
          </div>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={loading || uploading}
                  className="btn-primary text-sm"
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="btn-outline text-sm"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button onClick={() => setIsEditing(true)} className="btn-outline text-sm">
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        <StatCard label="Movies Watched" value={stats.totalWatched} color="text-primary" />
        <StatCard label="Want to Watch" value={stats.totalWant} color="text-yellow-400" />
        <StatCard label="Currently Watching" value={stats.totalWatching} color="text-blue-400" />
        <StatCard label="Average Rating" value={stats.avgRating} color="text-green-400" />
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
        <div className="bg-surface rounded-xl border border-border divide-y divide-border">
          {recent.length === 0 ? (
            <div className="p-4 text-gray-400">No activity yet.</div>
          ) : (
            recent.map((entry) => (
              <div key={entry._id} className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-medium">{entry.title}</p>
                  <p className="text-sm text-gray-400">Rating: {entry.rating || 'Not rated'}</p>
                </div>
                <span className="text-xs text-gray-500">
                  {mounted ? formatDate(entry.addedAt) : ''}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="bg-surface rounded-xl border border-border p-5 text-center">
      <div className={`text-3xl font-bold ${color}`}>{value}</div>
      <div className="text-sm text-gray-400 mt-1">{label}</div>
    </div>
  );
}