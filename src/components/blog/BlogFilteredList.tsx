'use client';

import { useState, useMemo } from 'react';
import { BlogCard } from './BlogCard';
import { Search, Filter, X } from 'lucide-react';

interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  readTime: string;
  category: string;
  heroImage: string;
  heroImageAlt: string;
}

interface BlogFilteredListProps {
  posts: BlogPost[];
  categories: string[];
}

export function BlogFilteredList({ posts, categories }: BlogFilteredListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesSearch =
        searchQuery === '' ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === '' || post.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [posts, searchQuery, selectedCategory]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
  };

  const hasActiveFilters = searchQuery !== '' || selectedCategory !== '';

  return (
    <div className="rounded-3xl border border-[#e5d7ff] bg-[#f8f1ff] p-5 shadow-[0_12px_35px_rgba(105,46,212,0.08)] md:p-6">
      {/* Search and Filter Bar */}
      <div className="mb-8 space-y-4 rounded-2xl border border-[#e8ddfb] bg-white p-4 md:p-5">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search guides..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-[#dfd2f8] bg-white py-3 pl-10 pr-4 transition-colors focus:border-[#692ed4] focus:outline-none focus:ring-2 focus:ring-[#692ed4] focus:ring-offset-1"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#692ed4] focus-visible:ring-offset-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="relative sm:w-64">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full cursor-pointer appearance-none rounded-xl border border-[#dfd2f8] bg-white py-3 pl-10 pr-4 transition-colors focus:border-[#692ed4] focus:outline-none focus:ring-2 focus:ring-[#692ed4] focus:ring-offset-1"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Active Filters & Results Count */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold">{filteredPosts.length}</span> of{' '}
            <span className="font-semibold">{posts.length}</span> guides
          </p>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1 rounded-full bg-[#f8f1ff] px-3 py-1.5 text-sm font-medium text-[#692ed4] hover:bg-[#efe1ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#692ed4] focus-visible:ring-offset-2"
            >
              <X className="w-4 h-4" />
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Results Grid */}
      {filteredPosts.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.map((post) => (
            <BlogCard
              key={post.slug}
              slug={post.slug}
              title={post.title}
              description={post.description}
              date={post.date}
              readTime={post.readTime}
              category={post.category}
              heroImage={post.heroImage}
              heroImageAlt={post.heroImageAlt}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No guides found</h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search or filter to find what you&apos;re looking for.
          </p>
          <button
            onClick={clearFilters}
            className="text-primary hover:text-primary/80 font-medium"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
