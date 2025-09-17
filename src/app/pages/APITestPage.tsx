import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { APIIntegrationTest } from "@/components/common/APIIntegrationTest";

const APITestPage = () => {
  const [currentLanguage, setCurrentLanguage] = useState<"th" | "en">("en");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/admin">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Admin
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">API Integration Test</h1>
                <p className="text-muted-foreground">
                  Verify Frontend-Backend connection and API endpoints
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={currentLanguage === "en" ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentLanguage("en")}
              >
                EN
              </Button>
              <Button
                variant={currentLanguage === "th" ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentLanguage("th")}
              >
                TH
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Environment Info */}
          <div className="mb-6 p-4 bg-muted/50 rounded-lg">
            <h2 className="font-semibold mb-2">Testing Configuration</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Backend URL:</strong> 
                <code className="ml-2 px-2 py-1 bg-background rounded">
                  {import.meta.env.VITE_HF_BACKEND_URL || 'Not configured'}
                </code>
              </div>
              <div>
                <strong>Environment:</strong> 
                <code className="ml-2 px-2 py-1 bg-background rounded">
                  {import.meta.env.MODE}
                </code>
              </div>
            </div>
          </div>

          {/* Testing Instructions */}
          <div className="mb-6 p-4 border rounded-lg">
            <h2 className="font-semibold mb-3">Manual Testing Instructions</h2>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Open Developer Tools (F12) and navigate to the <strong>Network</strong> tab</li>
              <li>Click "Run Tests" below to execute API calls</li>
              <li>In the Network tab, filter requests using keywords: <code>Athipan01-PaiNaiDee-Backend</code> or <code>api</code></li>
              <li>Check for requests to: <code>https://Athipan01-PaiNaiDee-Backend.hf.space</code></li>
              <li>Verify Status Codes (should be 200 OK or other 2xx codes)</li>
              <li>Inspect Response Body for actual backend data (JSON format)</li>
              <li>Document any CORS errors or "Failed to fetch" messages</li>
            </ol>
          </div>

          {/* API Integration Test Component */}
          <APIIntegrationTest currentLanguage={currentLanguage} />

          {/* Additional Network Debugging Info */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
            <h3 className="font-semibold mb-2">Network Debugging Tips</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Look for requests to <code>/health</code> endpoint - should return <code>{"{"} "status": "ok" {"}"}</code></li>
              <li>CORS errors will appear as blocked requests in the Network tab</li>
              <li>Failed requests will show red status codes (4xx, 5xx) or no status</li>
              <li>Click on individual requests to see detailed headers and response data</li>
              <li>The Health Check test specifically targets the requirements from the problem statement</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default APITestPage;