// convex/search.ts
import { action } from "./_generated/server";
import { v } from "convex/values";

// Define a consistent interface for our search results
interface SearchResult {
  title: string;
  link: string;
  content: string; // Tavily provides full content, not just a snippet
  score: number;
}

export const performTavilySearch = action({
  args: {
    query: v.string(),
  },
  handler: async (ctx, { query }): Promise<SearchResult[]> => {
    const apiKey = process.env.TAVILY_API_KEY;

    if (!apiKey) {
      throw new Error("Tavily API key is not configured in Convex environment variables.");
    }

    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: apiKey,
        query: query,
        search_depth: "advanced", // Use "advanced" for more thorough results
        include_answer: false, // We just want the search results, not a summarized answer
        max_results: 5, // Get the top 5 results
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Tavily Search API request failed:", errorBody);
      throw new Error("Failed to fetch search results from Tavily.");
    }

    const data = await response.json();

    if (!data.results) {
      return [];
    }

    // Map the Tavily results to our consistent SearchResult interface
    return data.results.map((item: any): SearchResult => ({
      title: item.title,
      link: item.url, // Note: Tavily uses 'url' instead of 'link'
      content: item.content,
      score: item.score,
    }));
  },
});