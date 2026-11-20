'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useRef, useState } from 'react';
import { Search } from 'lucide-react';

export function MemberFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const debounceTimeout = useRef<NodeJS.Timeout>(null);

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== 'all') {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      const queryString = createQueryString('search', value);
      router.push(`${pathname}${queryString ? `?${queryString}` : ''}`);
    }, 300);
  };

  const handleFilterChange = (name: string, value: string) => {
    const queryString = createQueryString(name, value);
    router.push(`${pathname}${queryString ? `?${queryString}` : ''}`);
  };

  return (
    <div className="bg-white rounded-2xl p-4 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between border border-slate-200/80 shadow-xs">
      {/* Search Input (Stitch Screen Parity) */}
      <div className="relative w-full md:w-96">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search members by name..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-body-md text-slate-800 placeholder:text-slate-400 focus:border-[#7a3fc8] focus:ring-2 focus:ring-[#7a3fc8]/20 transition-all focus:outline-none"
        />
      </div>

      {/* Filter Selects (Stitch Screen Parity) */}
      <div className="flex flex-wrap gap-3 w-full md:w-auto">
        <select
          value={searchParams.get('status') || 'all'}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 hover:border-slate-300 focus:border-[#7a3fc8] focus:ring-2 focus:ring-[#7a3fc8]/20 focus:outline-none cursor-pointer shadow-2xs"
        >
          <option value="all">Status: All</option>
          <option value="active">Status: Active</option>
          <option value="pending">Status: Pending</option>
          <option value="inactive">Status: Inactive</option>
        </select>

        <select
          value={searchParams.get('skill') || 'all'}
          onChange={(e) => handleFilterChange('skill', e.target.value)}
          className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 hover:border-slate-300 focus:border-[#7a3fc8] focus:ring-2 focus:ring-[#7a3fc8]/20 focus:outline-none cursor-pointer shadow-2xs"
        >
          <option value="all">Skill: All Levels</option>
          <option value="beginner">Beginner (2.0–3.0)</option>
          <option value="intermediate">Intermediate (3.5–4.0)</option>
          <option value="advanced">Advanced (4.5+)</option>
          <option value="pro">Pro Player</option>
        </select>

        <select
          value={searchParams.get('role') || 'all'}
          onChange={(e) => handleFilterChange('role', e.target.value)}
          className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 hover:border-slate-300 focus:border-[#7a3fc8] focus:ring-2 focus:ring-[#7a3fc8]/20 focus:outline-none cursor-pointer shadow-2xs"
        >
          <option value="all">Role: All</option>
          <option value="owner">Owner</option>
          <option value="admin">Admin</option>
          <option value="member">Player</option>
        </select>
      </div>
    </div>
  );
}
