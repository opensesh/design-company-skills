import { google, calendar_v3, gmail_v1, Auth } from 'googleapis';
import { cached } from '../cache.js';
import { getEnv } from '../config.js';

// Google OAuth is more complex - requires OAuth flow
// For now, this service will be a placeholder that checks for credentials
// and returns appropriate error messages when not configured

let oauth2Client: Auth.OAuth2Client | null = null;
let calendarClient: calendar_v3.Calendar | null = null;
let gmailClient: gmail_v1.Gmail | null = null;

function getOAuth2Client(): Auth.OAuth2Client {
  if (!oauth2Client) {
    const clientId = getEnv('GOOGLE_CLIENT_ID');
    const clientSecret = getEnv('GOOGLE_CLIENT_SECRET');
    const refreshToken = getEnv('GOOGLE_REFRESH_TOKEN');

    if (!clientId || !clientSecret) {
      throw new Error('GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET not set');
    }

    oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      'http://localhost:3847/auth/google/callback'
    );

    if (refreshToken) {
      oauth2Client.setCredentials({ refresh_token: refreshToken });
    }
  }

  return oauth2Client;
}

function getCalendarClient(): calendar_v3.Calendar {
  if (!calendarClient) {
    const auth = getOAuth2Client();
    calendarClient = google.calendar({ version: 'v3', auth });
  }
  return calendarClient;
}

function getGmailClient(): gmail_v1.Gmail {
  if (!gmailClient) {
    const auth = getOAuth2Client();
    gmailClient = google.gmail({ version: 'v1', auth });
  }
  return gmailClient;
}

export interface CalendarEvent {
  id: string;
  summary: string;
  start: string;
  end: string;
  location?: string;
  attendees: number;
  htmlLink?: string;
}

export interface Email {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  date: string;
  snippet: string;
  labelIds: string[];
}

export async function getTodaysEvents(): Promise<CalendarEvent[]> {
  return cached(
    'google:calendar:today',
    async () => {
      const calendar = getCalendarClient();

      const now = new Date();
      const startOfDay = new Date(now);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);

      const response = await calendar.events.list({
        calendarId: 'primary',
        timeMin: startOfDay.toISOString(),
        timeMax: endOfDay.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
      });

      const events = response.data.items || [];

      return events.map(event => ({
        id: event.id || '',
        summary: event.summary || 'No title',
        start: event.start?.dateTime || event.start?.date || '',
        end: event.end?.dateTime || event.end?.date || '',
        location: event.location || undefined,
        attendees: event.attendees?.length || 0,
        htmlLink: event.htmlLink || undefined,
      }));
    },
    { ttl: 300 }
  );
}

export async function getUpcomingEvents(days = 7): Promise<CalendarEvent[]> {
  return cached(
    `google:calendar:upcoming:${days}`,
    async () => {
      const calendar = getCalendarClient();

      const now = new Date();
      const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

      const response = await calendar.events.list({
        calendarId: 'primary',
        timeMin: now.toISOString(),
        timeMax: future.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
        maxResults: 50,
      });

      const events = response.data.items || [];

      return events.map(event => ({
        id: event.id || '',
        summary: event.summary || 'No title',
        start: event.start?.dateTime || event.start?.date || '',
        end: event.end?.dateTime || event.end?.date || '',
        location: event.location || undefined,
        attendees: event.attendees?.length || 0,
        htmlLink: event.htmlLink || undefined,
      }));
    },
    { ttl: 300 }
  );
}

export async function getUnreadEmails(limit = 20): Promise<Email[]> {
  return cached(
    `google:gmail:unread:${limit}`,
    async () => {
      const gmail = getGmailClient();

      const response = await gmail.users.messages.list({
        userId: 'me',
        q: 'is:unread is:important',
        maxResults: limit,
      });

      const messages = response.data.messages || [];
      const emails: Email[] = [];

      for (const msg of messages.slice(0, 10)) {
        // Limit API calls
        const detail = await gmail.users.messages.get({
          userId: 'me',
          id: msg.id!,
          format: 'metadata',
          metadataHeaders: ['Subject', 'From', 'Date'],
        });

        const headers = detail.data.payload?.headers || [];
        const getHeader = (name: string) =>
          headers.find(h => h.name?.toLowerCase() === name.toLowerCase())?.value || '';

        emails.push({
          id: msg.id!,
          threadId: msg.threadId || '',
          subject: getHeader('Subject'),
          from: getHeader('From'),
          date: getHeader('Date'),
          snippet: detail.data.snippet || '',
          labelIds: detail.data.labelIds || [],
        });
      }

      return emails;
    },
    { ttl: 300 }
  );
}

export async function getActivity() {
  try {
    const [todaysEvents, emails] = await Promise.all([
      getTodaysEvents(),
      getUnreadEmails(10),
    ]);

    return {
      calendar: {
        today: todaysEvents,
        events_today: todaysEvents.length,
      },
      email: {
        unread_important: emails,
        unread_count: emails.length,
      },
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes('not set')) {
      return {
        error: 'Google services not configured',
        setup_required: true,
        message: 'Run Google OAuth setup to enable calendar and email features',
      };
    }
    throw error;
  }
}

export function isConfigured(): boolean {
  return !!(
    getEnv('GOOGLE_CLIENT_ID') &&
    getEnv('GOOGLE_CLIENT_SECRET') &&
    getEnv('GOOGLE_REFRESH_TOKEN')
  );
}

export function getAuthUrl(): string {
  const client = getOAuth2Client();
  return client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/gmail.readonly',
    ],
    prompt: 'consent',
  });
}

export async function exchangeCodeForTokens(code: string) {
  const client = getOAuth2Client();
  const { tokens } = await client.getToken(code);
  return tokens;
}
