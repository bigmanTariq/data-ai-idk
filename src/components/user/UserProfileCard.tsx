'use client';

import React, { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';

interface UserProfile {
  id: string;
  userId: string;
  level: number;
  xp: number;
  currentModuleId: string | null;
}

export default function UserProfileCard() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/user/profile');
        if (response.ok) {
          const data = await response.json();
          setProfile(data);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchProfile();
    }
  }, [session]);

  if (!session) {
    return null;
  }

  // Calculate XP progress to next level
  const xpForCurrentLevel = profile ? (profile.level - 1) * 100 : 0;
  const xpForNextLevel = profile ? profile.level * 100 : 100;
  const currentLevelXp = profile ? profile.xp - xpForCurrentLevel : 0;
  const xpNeededForNextLevel = xpForNextLevel - xpForCurrentLevel;
  const progressPercentage = Math.min(
    100,
    Math.round((currentLevelXp / xpNeededForNextLevel) * 100)
  );

  return (
    <div className="flex items-center space-x-4">
      <div className="relative">
        {session.user?.image ? (
          <Image
            src={session.user.image}
            alt={session.user.name || 'User'}
            width={40}
            height={40}
            className="rounded-full"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center transition-colors duration-200">
            <span className="text-indigo-800 dark:text-indigo-300 font-medium">
              {session.user?.name?.charAt(0) || 'U'}
            </span>
          </div>
        )}
        {!loading && profile && (
          <div className="absolute -bottom-1 -right-1 bg-indigo-600 dark:bg-indigo-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center transition-colors duration-200">
            {profile.level}
          </div>
        )}
      </div>
      <div>
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">
          {session.user?.name || 'User'}
        </div>
        {!loading && profile && (
          <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-1 transition-colors duration-200">
            <div
              className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-colors duration-200"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        )}
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-200">
          {!loading && profile
            ? `XP: ${profile.xp} / Next: ${xpForNextLevel}`
            : 'Loading...'}
        </div>
      </div>
      <div className="relative group">
        <button className="text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors duration-150">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10 hidden group-hover:block transition-colors duration-200">
          <Link
            href="/profile"
            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
          >
            Your Profile
          </Link>
          <Link
            href="/settings"
            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
          >
            Settings
          </Link>
          {session.user.isAdmin && (
            <Link
              href="/admin"
              className="block px-4 py-2 text-sm text-indigo-700 dark:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
            >
              Admin Dashboard
            </Link>
          )}
          <button
            onClick={() => signOut()}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
