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

  // Allow bypassing cache with ?refresh=true query parameter
  const query = getQuery(event);
  const bypassCache = query.refresh === "true";

  if (!bypassCache) {
    const cached = await useStorage("cache").getItem(cacheKey);
    if (cached) {
      return cached;
    }
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
      console.log("No data found in Google Sheets");
      console.log("API Response:", JSON.stringify(response, null, 2));
      return [];
    }

    console.log(`Fetched ${response.values.length} rows from Google Sheets`);
    console.log("Raw response sample (first row):", response.values[0]);

    // Log each row for debugging
    response.values.forEach((row, index) => {
      console.log(`Row ${index + 2}:`, {
        name: row[1] || "(empty)",
        position: row[2] || "(empty)",
        company: row[3] || "(empty)",
        workingExperience: row[8]?.substring(0, 50) || "(empty)",
        tangibleImpact: row[9]?.substring(0, 50) || "(empty)",
        hasQuote: !!(row[8]?.trim() || row[9]?.trim()),
      });
    });

    // Transform Google Sheets data to testimonial format
    const testimonials = response.values
      .filter((row) => {
        const hasName = row && row.length >= 2 && row[1]?.trim();
        if (!hasName) {
          console.log("Row filtered out: Missing name", row);
        }
        return hasName;
      })
      .map((row, index) => {
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
          console.log(
            `Row ${index + 2} filtered out: No quote text. Name: ${name}, Working Experience: ${workingExperience?.substring(0, 30)}, Tangible Impact: ${tangibleImpact?.substring(0, 30)}`,
          );
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

    console.log(
      `Processed ${testimonials.length} testimonials after filtering`,
    );

    // Cache the results for 5 minutes (or 1 minute in development)
    const cacheTTL = process.env.NODE_ENV === "development" ? 60 : 300;
    await useStorage("cache").setItem(cacheKey, testimonials, {
      ttl: cacheTTL,
    });

    return testimonials;
  } catch (error: any) {
    console.error("Error fetching testimonials from Google Sheets:", error);

    // Return empty array on error to prevent breaking the page
    return [];
  }
});
