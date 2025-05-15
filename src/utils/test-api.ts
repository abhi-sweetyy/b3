// Test script to verify API connectivity
const testApiConnection = async () => {
    try {
      console.log("Testing OpenRouter API connection...");
      
      // Get the API key from environment variables
      const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
      
      if (!apiKey) {
        console.error("❌ API key not configured");
        return {
          success: false,
          error: "API_KEY_MISSING",
          message: "API key not configured in environment variables"
        };
      }
      
      // Check if the API key format is valid
      if (!apiKey.startsWith('sk-or-v1-')) {
        console.error("❌ Invalid API key format");
        return {
          success: false,
          error: "API_KEY_INVALID_FORMAT",
          message: "API key doesn't match the required format (should start with 'sk-or-v1-')"
        };
      }
      
      // Make a simple request to verify the API works
      try {
        const response = await fetch('https://openrouter.ai/api/v1/auth/key', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': window.location.origin
          }
        });
        
        if (!response.ok) {
          const statusCode = response.status;
          
          if (statusCode === 401) {
            console.error("❌ API authentication failed (401) - Invalid API key");
            return {
              success: false,
              error: "API_KEY_INVALID",
              message: "Authentication failed - your API key is invalid or expired"
            };
          } else if (statusCode === 429) {
            console.error("❌ API rate limit exceeded (429)");
            return {
              success: false,
              error: "API_RATE_LIMIT",
              message: "Rate limit exceeded - please try again later"
            };
          } else {
            console.error(`❌ API request failed with status ${statusCode}`);
            return {
              success: false,
              error: "API_ERROR",
              message: `API request failed with status code ${statusCode}`
            };
          }
        }
        
        const data = await response.json();
        console.log("✅ API connection successful:", data);
        
        return {
          success: true,
          data,
          message: "API connection successful"
        };
      } catch (fetchError) {
        console.error("❌ Network error testing API connection:", fetchError);
        return {
          success: false,
          error: "NETWORK_ERROR",
          message: "Network error - please check your internet connection"
        };
      }
    } catch (error) {
      console.error("❌ Unexpected error testing API connection:", error);
      return {
        success: false,
        error: "UNKNOWN_ERROR",
        message: "An unexpected error occurred"
      };
    }
  };
  
  // Function to be called from the dashboard to verify the API connection
  export const verifyApiConnection = async () => {
    const result = await testApiConnection();
    
    return {
      success: result.success,
      message: result.message,
      error: result.error || null
    };
  };
  
  // Helper function to check if the API key is valid before making requests
  export const isApiKeyValid = () => {
    const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
    return Boolean(apiKey && apiKey.startsWith('sk-or-v1-'));
  };
  
  export default testApiConnection; 