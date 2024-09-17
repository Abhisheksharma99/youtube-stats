import type { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { accessToken } = req.query;

  if (typeof accessToken !== 'string') {
    return res.status(400).json({ error: 'Invalid access token' });
  }

  const youtube = google.youtube('v3');
  const oauth2Client = new google.auth.OAuth2(
    process.env.YOUTUBE_CLIENT_ID,
    process.env.YOUTUBE_CLIENT_SECRET,
    'https://youtubeapi-lfyr.vercel.app/api/oauth2callback' // Ensure this matches your redirect URI
  );

  oauth2Client.setCredentials({ access_token: accessToken });

  // Function to get the list of videos
  async function getVideoList(auth: any) {
    try {
      const response = await youtube.search.list({
        part: ['snippet'],
        channelId: 'UC21qxXsY0bb3jUDPoDBL7Kw', // Replace with your channel ID
        maxResults: 50, // Adjust as needed
        order: 'date', // Order by date or any other criteria
        auth: auth,
      });

      return response.data.items;
    } catch (error) {
      console.error('Error fetching video list:', error);
      throw new Error('Failed to fetch video list');
    }
  }

  // Function to get likes and views for a video
  async function getVideoStats(auth: any, videoIds: string[]) {
    try {
      const response = await youtube.videos.list({
        part: ['statistics'],
        id: [videoIds.join(',')], // Join video IDs with comma
        auth: auth,
      });
  
      const items = response.data.items || [];
  
      // Aggregate views and likes
      const totalStats = items.reduce((acc, item) => {
        acc.totalViews += parseInt(item.statistics?.viewCount || '0', 10);
        acc.totalLikes += parseInt(item.statistics?.likeCount || '0', 10);
        return acc;
      }, { totalViews: 0, totalLikes: 0 });
  
      return totalStats;
    } catch (error) {
      console.error('Error fetching video stats:', error);
      throw new Error('Failed to fetch video stats');
    }
  }
  

  try {
    // Fetch the list of videos
    const videoList = await getVideoList(oauth2Client);
    if (!videoList || videoList.length === 0) {
      return res.status(404).json({ error: 'No videos found' });
    }

    // Extract video IDs
    const videoIds = videoList.map((video: any) => video.id.videoId).filter((id: string) => id);

    if (videoIds.length === 0) {
      return res.status(404).json({ error: 'No valid video IDs found' });
    }

    // Fetch stats for each video
    const videoStats = await getVideoStats(oauth2Client, videoIds);

    res.status(200).json(videoStats);
  } catch (error) {
    console.error('Error fetching YouTube stats:', error);
    res.status(500).json({ error: 'Failed to fetch YouTube stats' });
  }
}
