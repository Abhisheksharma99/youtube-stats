import type { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';

const youtube = google.youtube('v3');

async function getVideoList(auth: any, channelId: string) {
  try {
    const response = await youtube.search.list({
      part: ['snippet'],
      channelId: channelId,
      maxResults: 50,
      order: 'date',
      auth: auth,
    });

    return response.data.items;
  } catch (error) {
    console.error('Error fetching video list:', error);
    throw new Error('Failed to fetch video list');
  }
}

async function getVideoLikes(auth: any, videoId: string) {
    try {
      const response = await youtube.videos.list({
        part: ['statistics'],
        id: [videoId],
        auth: auth,
      });
  
      const items = response.data.items;
      if (items && items.length > 0) {
        const video = items[0];
        return video?.statistics?.likeCount || '0';
      } else {
        return '0';
      }
    } catch (error) {
      console.error('Error fetching video likes:', error);
      throw new Error('Failed to fetch video likes');
    }
  }
  

  async function getAllVideoLikes(auth: any, channelId: string) {
    try {
      const videos = await getVideoList(auth, channelId);
  
      if (!videos || videos.length === 0) {
        return [];
      }
  
      const videoLikes = await Promise.all(videos.map(async (video: any) => {
        const videoId = video.id.videoId;
        const likes = await getVideoLikes(auth, videoId);
        return {
          title: video.snippet.title,
          likes: likes,
        };
      }));
  
      return videoLikes;
    } catch (error) {
      console.error('Error getting all video likes:', error);
      throw new Error('Failed to get video likes');
    }
  }
  

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { accessToken } = req.body;
    if (!accessToken) {
      return res.status(400).json({ error: 'Missing accessToken' });
    }

    try {
      const oauth2Client = new google.auth.OAuth2(
        process.env.YOUTUBE_CLIENT_ID,
        process.env.YOUTUBE_CLIENT_SECRET,
        'https://youtubeapi-lfyr.vercel.app/api/oauth2callback'
      );

      oauth2Client.setCredentials({ access_token: accessToken });

      const videoLikes = await getAllVideoLikes(oauth2Client, 'UC21qxXsY0bb3jUDPoDBL7Kw');

      res.status(200).json({ videoLikes });
    } catch (error) {
      console.error('Error fetching video likes:', error);
      res.status(500).json({ error: 'Failed to fetch video likes' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
