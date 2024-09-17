import type { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';

// Define scopes for Google Sheets and Drive access
const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive'
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { accessToken, stats } = req.body;
    if (!accessToken || !stats) {
      return res.status(400).json({ error: 'Missing accessToken or stats' });
    }

    try {
      const oauth2Client = new google.auth.OAuth2(
        process.env.YOUTUBE_CLIENT_ID,
        process.env.YOUTUBE_CLIENT_SECRET,
        'https://youtubeapi-lfyr.vercel.app/api/oauth2callback'
      );

      oauth2Client.setCredentials({
        access_token: accessToken
      });

      // Verify that the token has the correct scopes
      const tokenInfo = await oauth2Client.getTokenInfo(accessToken);
      console.log(tokenInfo);
      const hasRequiredScopes = SCOPES.every(scope => tokenInfo.scopes.includes(scope));

      if (!hasRequiredScopes) {
        return res.status(403).json({ error: 'Access token does not have the required scopes' });
      }

      // Create a Sheets client
      const sheetsClient = google.sheets({ version: 'v4', auth: oauth2Client });

      // Define the range and values to update
      const range = 'Sheet1!A1:B2'; // Update this range based on your sheet layout
      const values = [
        ['Hours Watched', stats.hoursWatched],
        ['Likes', stats.likes],
      ];

      // Update the Google Sheet
      await sheetsClient.spreadsheets.values.update({
        spreadsheetId: process.env.GOOGLE_SHEET_ID as string,
        range: range,
        valueInputOption: 'RAW',
        requestBody: {
          values: values,
        },
      });

      res.status(200).json({ message: 'Sheet updated successfully' });
    } catch (error) {
      console.error('Error updating Google Sheet:', error);
      res.status(500).json({ error: 'Failed to update Google Sheet' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
