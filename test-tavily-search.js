// Test script to verify Tavily search functionality
// Run with: node test-tavily-search.js

const testTavilySearch = async () => {
  console.log("🔍 Testing Tavily Search Configuration...\n");

  // Test 1: Direct API call to Tavily
  console.log("1. Testing direct Tavily API call...");
  
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    console.error("❌ TAVILY_API_KEY not found in environment variables");
    return;
  }

  try {
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: apiKey,
        query: "AI policy framework 2025",
        search_depth: "advanced",
        include_answer: false,
        include_raw_content: true,
        include_images: false,
        max_results: 3,
      }),
    });

    if (!response.ok) {
      console.error("❌ Tavily API request failed:", response.status, response.statusText);
      return;
    }

    const data = await response.json();
    console.log("✅ Direct API call successful");
    console.log(`📊 Found ${data.results?.length || 0} results`);
    
    if (data.results && data.results.length > 0) {
      const firstResult = data.results[0];
      console.log("\n📄 First result sample:");
      console.log(`   Title: ${firstResult.title}`);
      console.log(`   URL: ${firstResult.url}`);
      console.log(`   Content length: ${firstResult.content?.length || 0} chars`);
      console.log(`   Raw content length: ${firstResult.raw_content?.length || 0} chars`);
      console.log(`   Score: ${firstResult.score}`);
      
      // Check for citation-worthy content
      if (firstResult.raw_content && firstResult.raw_content.length > firstResult.content.length) {
        console.log("✅ Raw content is more detailed than summary content");
      } else {
        console.log("⚠️  Raw content may not be significantly different from summary");
      }
    }

  } catch (error) {
    console.error("❌ Error testing direct API:", error.message);
    return;
  }

  console.log("\n" + "=".repeat(60) + "\n");

  // Test 2: Test citation formatting
  console.log("2. Testing citation formatting...");
  
  const mockResults = [
    {
      title: "Key AI Regulations in 2025: What Enterprises Need to Know",
      url: "https://www.credo.ai/blog/key-ai-regulations-in-2025-what-enterprises-need-to-know",
      content: "South Korea enacted the Framework Act on AI...",
      raw_content: "South Korea enacted the _Framework Act on the Development of AI and Establishment of a Foundation of Trust_, a comprehensive AI law sharing common elements with the EU AI Act, on January 10th, 2025.",
      score: 0.82
    },
    {
      title: "AI Policy Alert: White House AI Action Plan",
      url: "https://www.healthlawadvisor.com/ai-policy-alert-what-to-know-before-the-white-house-releases-its-ai-action-plan",
      content: "President Trump directed federal officials to develop an Action Plan...",
      raw_content: "In Executive Order 14179 of January 23, 2025—entitled \"Removing Barriers to American Leadership in Artificial Intelligence\"—President Donald Trump directed federal officials to develop an Action Plan to achieve the policies of sustaining and enhancing America's dominance in global AI.",
      score: 0.78
    }
  ];

  console.log("✅ Mock results created for citation testing");
  
  // Test citation format
  console.log("\n📝 Testing citation formats:");
  mockResults.forEach((result, index) => {
    console.log(`\n[Source ${index + 1}: ${result.title}]`);
    console.log(`URL: ${result.url}`);
    console.log(`Content: ${result.raw_content.substring(0, 100)}...`);
    console.log(`Score: ${result.score}`);
  });

  console.log("\n📚 Sources section format:");
  console.log("## Sources");
  mockResults.forEach((result, index) => {
    console.log(`${index + 1}. [${result.title}](${result.url})`);
  });

  console.log("\n✅ Citation formatting test complete");
  
  console.log("\n" + "=".repeat(60) + "\n");
  console.log("🎉 All tests completed!");
  console.log("\n💡 Recommendations:");
  console.log("   - Ensure raw_content is being used for detailed citations");
  console.log("   - Verify that Sources section is being added to generated content");
  console.log("   - Check that citation links are properly formatted as [Title](URL)");
};

// Run the test
testTavilySearch().catch(console.error);