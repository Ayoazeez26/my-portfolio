export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  // Get Google Sheets ID and API key from environment variables
  const sheetId = config.public.googleSheetsId;
  const apiKey = config.public.googleSheetsApiKey;

  // If configuration is missing, return empty array (will fallback to static testimonials)
  if (!sheetId || !apiKey) {
    console.warn(
      "Google Sheets configuration missing. Add GOOGLE_SHEETS_ID and GOOGLE_SHEETS_API_KEY to your environment variables.",
    );
    return [];
  }

  // Cache the response for 5 minutes (300 seconds)
  const cacheKey = "testimonials";
  const cached = await useStorage("cache").getItem(cacheKey);

  if (cached) {
    return cached;
  }

  try {
    // Fetch data from Google Sheets
    // Format: https://sheets.googleapis.com/v4/spreadsheets/{spreadsheetId}/values/{range}
    // Sheet structure:
    // Column A: Timestamp
    // Column B: Your Full Name
    // Column C: Your Position/Title
    // Column D: Company/Organization Name
    // Column E: Overall experience rating
    // Column F: Key qualities
    // Column G: Area of value
    // Column H: Understanding rating
    // Column I: Describe in your own words what it felt like working with me
    // Column J: Please elaborate on the tangible impact
    // Column K: Would you recommend

    const range = "Form Responses 1!A2:K"; // Adjust sheet name and range based on your structure
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;

    const response = await $fetch<{
      values?: string[][];
    }>(url);

    if (!response.values || response.values.length === 0) {
      return [];
    }

    // Transform Google Sheets data to testimonial format
    const testimonials = response.values
      .filter((row) => row && row.length >= 2 && row[1]?.trim()) // At least have a name
      .map((row) => {
        // Map columns based on your form structure
        const timestamp = row[0] || ""; // Column A
        const name = row[1] || ""; // Column B: Your Full Name
        const position = row[2] || ""; // Column C: Your Position/Title
        const company = row[3] || ""; // Column D: Company/Organization Name
        const experienceRating = row[4] || ""; // Column E
        const keyQualities = row[5] || ""; // Column F
        const areaOfValue = row[6] || ""; // Column G
        const understandingRating = row[7] || ""; // Column H
        const workingExperience = row[8] || ""; // Column I: Describe in your own words
        const tangibleImpact = row[9] || ""; // Column J: Please elaborate on the tangible impact
        const recommend = row[10] || ""; // Column K

        // Combine position and company for description
        const description =
          [position, company].filter(Boolean).join(" at ") || "Client";

        // Use the working experience (Column I) as primary quote, fallback to tangible impact (Column J)
        // Combine both if both exist for a richer testimonial
        let quote = workingExperience?.trim() || "";
        if (tangibleImpact?.trim()) {
          if (quote) {
            quote += ` ${tangibleImpact.trim()}`;
          } else {
            quote = tangibleImpact.trim();
          }
        }

        // If no quote available, skip this testimonial
        if (!quote) {
          return null;
        }

        // Generate avatar if not provided (using UI Avatars or similar)
        const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "User")}&background=random&size=128`;

        return {
          quote: quote,
          author: {
            name: name.trim() || "Anonymous",
            description: description || "",
            avatar: {
              src: avatar,
              srcset: `${avatar} 2x`,
            },
          },
        };
      })
      .filter(
        (testimonial): testimonial is NonNullable<typeof testimonial> =>
          testimonial !== null && testimonial.quote.length > 0,
      ); // Only include testimonials with quotes

    // Cache the results for 5 minutes
    await useStorage("cache").setItem(cacheKey, testimonials, {
      ttl: 300, // 5 minutes in seconds
    });

    return testimonials;
  } catch (error: any) {
    console.error("Error fetching testimonials from Google Sheets:", error);

    // Return empty array on error to prevent breaking the page
    return [];
  }
});
