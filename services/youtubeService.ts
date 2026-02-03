import { Beat, GENRES } from '../types';

interface YouTubeConfig {
  channelId: string; // Can be ID or URL
}

const STORAGE_KEY_YT = 'neonflow_yt_config';

export const saveYouTubeConfig = (config: YouTubeConfig) => {
  localStorage.setItem(STORAGE_KEY_YT, JSON.stringify(config));
};

export const getYouTubeConfig = (): YouTubeConfig | null => {
  const stored = localStorage.getItem(STORAGE_KEY_YT);
  return stored ? JSON.parse(stored) : null;
};

// Helper to extract BPM from text
const extractBPM = (text: string): number => {
  const match = text.match(/\b(\d{2,3})\s*BPM\b/i);
  return match ? parseInt(match[1]) : 130; 
};

// Helper to guess genre from text
const extractGenre = (text: string): string => {
  const lowerText = text.toLowerCase();
  for (const genre of GENRES) {
    if (genre !== 'All' && lowerText.includes(genre.toLowerCase())) {
      return genre;
    }
  }
  return 'Trap'; 
};

// Async Channel Resolver to support Handles and URLs
const resolveChannelId = async (input: string): Promise<string> => {
  let cleanInput = input.trim();
  
  // 1. Check if it's already a clean ID (starts with UC, 24 chars)
  if (/^UC[\w-]{22}$/.test(cleanInput)) return cleanInput;
  
  // 2. Check for standard /channel/ URL
  const channelMatch = cleanInput.match(/channel\/(UC[\w-]{22})/);
  if (channelMatch) return channelMatch[1];

  // 3. For Handles (@user) or Custom URLs, we need to fetch the page via proxy
  let url = cleanInput;
  // Ensure protocol
  if (!url.startsWith('http')) {
    if (url.startsWith('@')) {
       url = `https://www.youtube.com/${url}`;
    } else {
       url = `https://www.youtube.com/${url}`;
    }
  }

  // Remove query params to increase cache hit rate and cleanliness
  try {
    const urlObj = new URL(url);
    url = urlObj.origin + urlObj.pathname;
  } catch(e) { 
    // If URL parsing fails, continue with original string
  }

  try {
    // Use AllOrigins proxy to fetch the HTML content
    // We disable cache to ensure we get the latest ID mapping if it changed.
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl);
    const data = await response.json();
    
    if (!data.contents) throw new Error('Proxy returned empty content');
    const html = data.contents;

    // Search patterns for Channel ID in the HTML
    const patterns = [
      /itemprop="channelId" content="(UC[\w-]{22})"/, // Schema.org
      /channel_id=(UC[\w-]{22})/, // RSS link
      /"externalId":"(UC[\w-]{22})"/, // JSON blob
      /data-channel-external-id="(UC[\w-]{22})"/ // Data attribute
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match) return match[1];
    }

    throw new Error('Channel ID not found in page source');

  } catch (error) {
    console.error('Failed to resolve Channel ID:', error);
    // If proxy fails or ID not found, we can't proceed with RSS feed for handles.
    throw new Error(`Could not resolve Channel ID from URL: ${cleanInput}. Please ensure the URL is correct and public.`);
  }
};

export const fetchChannelUploads = async (channelInput: string, limit: number = 15): Promise<Beat[]> => {
  try {
    // Resolve the input (ID, URL, or Handle) to a raw Channel ID
    const channelId = await resolveChannelId(channelInput);
    
    // Use rss2json with the resolved ID
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;
    
    const res = await fetch(apiUrl);
    const data = await res.json();

    if (data.status !== 'ok' || !data.items) {
      throw new Error('Failed to fetch videos from RSS feed.');
    }

    // Limit the number of items processed
    const latestItems = data.items.slice(0, limit);

    return latestItems.map((item: any) => {
      const videoId = item.guid.split(':').pop();
      const title = item.title;
      const description = item.description || '';
      
      return {
        id: videoId,
        title: title,
        genre: extractGenre(title + ' ' + description),
        bpm: extractBPM(title + ' ' + description),
        date: item.pubDate,
        coverImage: item.thumbnail,
        downloadLink: '', 
        adLink1: 'https://google.com',
        adLink2: 'https://google.com',
        youtubeId: videoId,
      };
    });
  } catch (error) {
    console.error('Error in fetchChannelUploads:', error);
    throw error;
  }
};

// Fetch details for a specific video URL using noembed (CORS friendly)
export const getVideoDetails = async (videoUrl: string): Promise<Beat | null> => {
  try {
     // Check if it is a valid YouTube URL
     if (!videoUrl.includes('youtube.com') && !videoUrl.includes('youtu.be')) return null;

     const res = await fetch(`https://noembed.com/embed?url=${videoUrl}`);
     const data = await res.json();
     
     if (data.error || !data.title) return null;

     // Extract ID
     let videoId = '';
     try {
       const urlObj = new URL(videoUrl);
       if(urlObj.hostname.includes('youtu.be')) {
         videoId = urlObj.pathname.slice(1);
       } else {
         videoId = urlObj.searchParams.get('v') || '';
       }
     } catch(e) { return null; }

     if (!videoId) return null;

     return {
        id: videoId,
        youtubeId: videoId,
        title: data.title,
        // Replace hqdefault with maxresdefault for better quality if possible, otherwise keep provider default
        coverImage: data.thumbnail_url?.replace('hqdefault', 'maxresdefault') || data.thumbnail_url,
        date: new Date().toISOString(), 
        bpm: extractBPM(data.title), 
        genre: extractGenre(data.title),
        downloadLink: '',
        adLink1: 'https://google.com',
        adLink2: 'https://google.com'
     };
  } catch (error) {
    console.error('Error fetching video details:', error);
    return null;
  }
};