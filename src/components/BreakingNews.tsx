import { useState, memo, useMemo, useCallback } from "react";
import { Megaphone } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { djangoAPI } from "@/lib/django-api";

interface BreakingNewsData {
  title?: string;
  content?: string;
  is_active?: boolean;
}

// Skeleton loader component
const BreakingNewsSkeleton = memo(() => (
  <div className="bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900 py-3 overflow-hidden relative shadow-md animate-pulse">
    <div className="flex items-center">
      <div className="bg-gray-700 rounded-full px-4 py-2 mr-4 flex items-center shadow-lg border-2 border-gray-600 flex-shrink-0">
        <div className="h-4 w-4 mr-2 bg-gray-600 rounded"></div>
        <div className="h-4 w-24 bg-gray-600 rounded"></div>
      </div>
      <div className="flex-1">
        <div className="h-4 w-3/4 bg-gray-700 rounded"></div>
      </div>
    </div>
  </div>
));

BreakingNewsSkeleton.displayName = 'BreakingNewsSkeleton';

// Optimized data fetching function
const fetchBreakingNews = async (): Promise<BreakingNewsData | null> => {
  const item = await djangoAPI.getBreakingNews();
  if (!item) return null;
  return {
    title: item.title,
    content: item.content,
    is_active: item.is_active,
  };
};

const BreakingNews = memo(() => {
  // Performance: Removed excessive console logging
  // Use React Query for caching and optimized data fetching
  const { data: newsData, isLoading, error } = useQuery({
    queryKey: ['breaking-news'],
    queryFn: fetchBreakingNews,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 2
  });

  // Query state tracking

  // Memoized display text
  const displayText = useMemo(() => newsData?.title || newsData?.content || '', [newsData]);

  // Show skeleton loader while loading
  if (isLoading) {
    return <BreakingNewsSkeleton />;
  }

  // Show error state for debugging
  if (error) {
    console.error('❌ Breaking news error:', error);
    return (
      <div className="bg-red-500 text-white py-3 px-4">
        <span>Error loading breaking news: {error.message}</span>
      </div>
    );
  }

  // Show no data state for debugging
  if (!newsData || !displayText) {
    // No breaking news data available
    return (
      <div className="bg-gray-500 text-white py-3 px-4">
        <span>No breaking news available</span>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900 py-3 overflow-hidden relative shadow-md">
      <div className="flex items-center">
        {/* Curved box with BREAKING NEWS text and speaker icon */}
        <div className="bg-black rounded-full px-4 py-2 mr-4 flex items-center shadow-lg border-2 border-gray-700 flex-shrink-0">
          <Megaphone className="h-4 w-4 mr-2 text-white" />
          <span className="text-white font-bold text-sm whitespace-nowrap uppercase tracking-wide">
            BREAKING NEWS
          </span>
        </div>
        
        {/* Scrolling news content */}
        <div className="flex-1 overflow-hidden">
          <div className="animate-scroll whitespace-nowrap">
            <span className="inline-block font-medium">{displayText}</span>
          </div>
        </div>
      </div>
    </div>
  );
});

BreakingNews.displayName = 'BreakingNews';

export default BreakingNews;
