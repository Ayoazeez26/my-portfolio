# Google Sheets Testimonials Setup Guide

This guide will help you set up dynamic testimonials that automatically sync from a Google Form to your portfolio.

## Step 1: Create a Google Form

1. Go to [Google Forms](https://forms.google.com)
2. Create a new form with the following fields:
   - **Name** (Short answer, required)
   - **Role/Company** (Short answer, required) - e.g., "Product Director at Bloom Finance"
   - **Testimonial/Quote** (Paragraph, required)
   - **Avatar URL** (Short answer, optional) - Optional image URL for the person's photo

3. Click the **Responses** tab and create a new Google Sheet to store responses
4. Note the **Sheet ID** from the URL: `https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit`

## Step 2: Set Up Google Sheets API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google Sheets API**:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click "Enable"

4. Create an API Key:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the API key
   - (Optional) Restrict the API key to only allow Google Sheets API access

5. Make your Google Sheet publicly readable:
   - Open your Google Sheet (not the form, but the linked spreadsheet)
   - Click "Share" button
   - In the sharing dialog, find the **"Editor view"** section (or "General access")
   - Change it from "Restricted" to **"Anyone with the link"**
   - Set the permission to **"Viewer"** (read-only access)
   - Click "Done"

   **Note:** The "Responder view" is for your Google Form and can stay as is. You need to change the **Editor/Viewer access** for the **Google Sheet** itself so the API can read the data.

## Step 3: Configure Your Sheet Format

Your Google Sheet should have the following structure:

| Name              | Role/Company                      | Quote                                                              | Avatar URL (optional)           |
| ----------------- | --------------------------------- | ------------------------------------------------------------------ | ------------------------------- |
| Sarah Chen        | Product Director at Bloom Finance | Emma's approach to UX design completely transformed our product... | https://images.unsplash.com/... |
| Michael Rodriguez | Co-founder of Wavelength Music    | Working with Emma was the best decision...                         |                                 |

**Important:**

- The first row should be headers (Name, Role/Company, Quote, Avatar URL)
- Data starts from row 2
- The sheet name should be "Sheet1" (default) or update the range in `server/api/testimonials.get.ts`

## Step 4: Add Environment Variables

1. Copy `.env.example` to `.env`:

   ```bash
   cp .env.example .env
   ```

2. Add your credentials to `.env`:

   ```
   GOOGLE_SHEETS_ID=your_sheet_id_here
   GOOGLE_SHEETS_API_KEY=your_api_key_here
   ```

3. For production (Vercel, Netlify, etc.), add these as environment variables in your hosting platform's dashboard.

## Step 5: Test the Integration

1. Start your development server:

   ```bash
   pnpm dev
   ```

2. Submit a test response through your Google Form

3. Wait a few minutes (cache refreshes every 5 minutes) or clear the cache

4. Check your portfolio - the new testimonial should appear automatically!

## How It Works

- The `/api/testimonials` endpoint fetches data from your Google Sheet
- Responses are cached for 5 minutes to improve performance
- New form submissions automatically appear after cache refresh
- If the API fails, it falls back to static testimonials from `content/index.yml`

## Troubleshooting

### Testimonials not appearing?

1. Check that your Google Sheet is publicly accessible
2. Verify the Sheet ID and API Key are correct in `.env`
3. Check the browser console and server logs for errors
4. Ensure your sheet has the correct column structure

### API errors?

1. Verify the Google Sheets API is enabled in Google Cloud Console
2. Check that your API key has the correct permissions
3. Ensure your sheet is shared publicly (viewer access)

### Need to change cache duration?

Edit `server/api/testimonials.get.ts` and change the `ttl` value (currently 300 seconds = 5 minutes)

## Security Notes

- The API key is exposed in the client-side code (it's in `runtimeConfig.public`)
- This is safe for read-only access to public sheets
- Consider restricting your API key to only allow Google Sheets API access
- Never use this approach for sensitive data
