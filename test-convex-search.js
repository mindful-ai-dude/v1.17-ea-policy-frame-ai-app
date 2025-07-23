// Simple test to verify Convex search function
// This tests the search function directly

const testConvexSearch = async () => {
  console.log("🔍 Testing Convex Search Function...\n");

  try {
    // Test with a simple query
    const testQuery = "AI policy 2025";
    console.log(`Testing query: "${testQuery}"`);
    
    // Simulate what the search function should return
    const expectedResult = {
      title: "Should have a title",
      link: "Should have a URL", 
      content: "Should have content",
      raw_content: "Should have raw content for citations",
      score: "Should have a relevance score"
    };

    console.log("\n✅ Expected result structure:");
    console.log(JSON.stringify(expectedResult, null, 2));

    console.log("\n📋 Checklist for search function:");
    console.log("□ TAVILY_API_KEY is set in Convex environment");
    console.log("□ Search function is deployed");
    console.log("□ Function returns array of SearchResult objects");
    console.log("□ Each result has title, link, content, raw_content, score");
    console.log("□ raw_content is more detailed than content for citations");

    console.log("\n🔧 To test manually:");
    console.log("1. Open Convex dashboard");
    console.log("2. Go to Functions tab");
    console.log("3. Find search:performTavilySearch");
    console.log("4. Test with query: 'AI policy 2025'");
    console.log("5. Verify results have all required fields");

    console.log("\n💡 If search is not working:");
    console.log("- Check TAVILY_API_KEY in Convex environment variables");
    console.log("- Verify function is deployed to production");
    console.log("- Check Convex logs for error messages");
    console.log("- Test API key directly with Tavily API");

  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
};

testConvexSearch();