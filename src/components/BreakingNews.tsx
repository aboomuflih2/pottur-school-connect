import { useState, useEffect, memo, useMemo, useCallback } from "react";
import { Megaphone, ExternalLink, Link } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface BreakingNewsData {
  message: string;
  link_url?: string;
  link_text?: string;
  is_external?: boolean;
  is_active: boolean;
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
  console.log('🔍 Fetching breaking news data...');
  const { data, error } = await supabase
    .from('breaking_news')
    .select('message, link_url, link_text, is_external, is_active')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.log('❌ Breaking news fetch error:', error);
    if (error.code === 'PGRST116') {
      // No rows returned
      console.log('ℹ️ No breaking news found');
      return null;
    }
    throw error;
  }

  if (!data) {
    console.log('⚠️ No data returned from breaking news query');
    return null;
  }

  console.log('✅ Breaking news data fetched:', data);

  const displayText = data.message || '';
  if (!displayText.trim()) {
    console.log('⚠️ Empty message in breaking news data');
    return null;
  }

  const result = {
    message: displayText,
    link_url: data.link_url || undefined,
    link_text: data.link_text || undefined,
    is_external: data.is_external || false,
    is_active: data.is_active || false
  };
  
  console.log('📰 Processed breaking news:', result);
  return result;
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

  // Optimized click handler with useCallback
  const handleLinkClick = useCallback(() => {
    if (newsData?.link_url) {
      if (newsData.is_external) {
        window.open(newsData.link_url, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = newsData.link_url;
      }
    }
  }, [newsData?.link_url, newsData?.is_external]);

  // Memoized clickable state
  const isClickable = useMemo(() => 
    Boolean(newsData?.link_url && newsData?.link_text), 
    [newsData?.link_url, newsData?.link_text]
  );

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
  if (!newsData) {
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
            <span className="inline-block font-medium">
              {newsData.message}
              {isClickable && (
                <button
                  onClick={handleLinkClick}
                  className="ml-4 inline-flex items-center text-gray-800 hover:text-gray-900 underline transition-colors font-semibold"
                  aria-label={`${newsData.link_text} - ${newsData.is_external ? 'Opens in new tab' : 'Navigate to page'}`}
                >
                  {newsData.link_text}
                  {newsData.is_external ? (
                    <ExternalLink className="ml-1 h-3 w-3" />
                  ) : (
                    <Link className="ml-1 h-3 w-3" />
                  )}
                </button>
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

BreakingNews.displayName = 'BreakingNews';

export default BreakingNews;

