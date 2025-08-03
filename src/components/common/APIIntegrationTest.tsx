import { useState, useEffect } from "react";
import { CheckCircle, XCircle, AlertCircle, Loader2, Globe, Database, Image, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { attractionAPI } from "@/shared/utils/attractionAPI";

interface TestResult {
  name: string;
  status: "success" | "error" | "warning" | "loading";
  message: string;
  details?: string;
  data?: any;
}

interface APIIntegrationTestProps {
  currentLanguage: "th" | "en";
}

export const APIIntegrationTest: React.FC<APIIntegrationTestProps> = ({ currentLanguage }) => {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [overallStatus, setOverallStatus] = useState<"success" | "error" | "warning">("warning");

  const content = {
    th: {
      title: "การทดสอบการเชื่อมต่อ API",
      description: "ตรวจสอบการทำงานของ Frontend กับ Backend API",
      runTests: "เรียกใช้การทดสอบ",
      running: "กำลังทดสอบ...",
      overallStatus: "สถานะรวม",
      testResults: "ผลการทดสอบ",
      recommendations: "คำแนะนำ"
    },
    en: {
      title: "API Integration Test",
      description: "Verify Frontend-Backend API Integration",  
      runTests: "Run Tests",
      running: "Running Tests...",
      overallStatus: "Overall Status",
      testResults: "Test Results",
      recommendations: "Recommendations"
    }
  };

  const t = content[currentLanguage];

  const runTests = async () => {
    setIsRunning(true);
    setTests([]);
    
    const testResults: TestResult[] = [];

    // Test 1: Basic API Connection
    try {
      testResults.push({
        name: currentLanguage === "th" ? "การเชื่อมต่อ API พื้นฐาน" : "Basic API Connection",
        status: "loading",
        message: currentLanguage === "th" ? "กำลังทดสอบ..." : "Testing...",
      });
      setTests([...testResults]);

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/attractions`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const data = await response.json();
        testResults[0] = {
          name: currentLanguage === "th" ? "การเชื่อมต่อ API พื้นฐาน" : "Basic API Connection",
          status: "success",
          message: currentLanguage === "th" ? "เชื่อมต่อสำเร็จ" : "Connection successful",
          details: `Status: ${response.status}`,
          data: data
        };
      } else {
        testResults[0] = {
          name: currentLanguage === "th" ? "การเชื่อมต่อ API พื้นฐาน" : "Basic API Connection",
          status: "error",
          message: currentLanguage === "th" ? "การเชื่อมต่อล้มเหลว" : "Connection failed",
          details: `HTTP ${response.status}: ${response.statusText}`,
        };
      }
    } catch (error) {
      testResults[0] = {
        name: currentLanguage === "th" ? "การเชื่อมต่อ API พื้นฐาน" : "Basic API Connection",
        status: "error",
        message: currentLanguage === "th" ? "ไม่สามารถเชื่อมต่อได้" : "Unable to connect",
        details: error instanceof Error ? error.message : String(error),
      };
    }

    // Test 2: Attractions List API
    try {
      testResults.push({
        name: currentLanguage === "th" ? "API รายการสถานที่" : "Attractions List API",
        status: "loading",
        message: currentLanguage === "th" ? "กำลังทดสอบ..." : "Testing...",
      });
      setTests([...testResults]);

      const attractionsData = await attractionAPI.getAttractions();
      
      testResults[1] = {
        name: currentLanguage === "th" ? "API รายการสถานที่" : "Attractions List API",
        status: "success",
        message: currentLanguage === "th" ? `พบข้อมูล ${attractionsData.attractions.length} รายการ` : `Found ${attractionsData.attractions.length} attractions`,
        details: `Total: ${attractionsData.total}, Page: ${attractionsData.page}`,
        data: attractionsData
      };
    } catch (error) {
      testResults[1] = {
        name: currentLanguage === "th" ? "API รายการสถานที่" : "Attractions List API",
        status: "warning",
        message: currentLanguage === "th" ? "ใช้ข้อมูลจำลอง" : "Using mock data",
        details: error instanceof Error ? error.message : String(error),
      };
    }

    // Test 3: Single Attraction Detail API
    try {
      testResults.push({
        name: currentLanguage === "th" ? "API รายละเอียดสถานที่" : "Attraction Detail API",
        status: "loading",
        message: currentLanguage === "th" ? "กำลังทดสอบ..." : "Testing...",
      });
      setTests([...testResults]);

      const detailData = await attractionAPI.getAttractionDetail("1");
      
      testResults[2] = {
        name: currentLanguage === "th" ? "API รายละเอียดสถานที่" : "Attraction Detail API",
        status: "success",
        message: currentLanguage === "th" ? "โหลดรายละเอียดสำเร็จ" : "Detail loaded successfully",
        details: `Name: ${detailData.name}, Images: ${detailData.images.length}`,
        data: detailData
      };
    } catch (error) {
      testResults[2] = {
        name: currentLanguage === "th" ? "API รายละเอียดสถานที่" : "Attraction Detail API",
        status: "warning",
        message: currentLanguage === "th" ? "ใช้ข้อมูลจำลอง" : "Using mock data",
        details: error instanceof Error ? error.message : String(error),
      };
    }

    // Test 4: Image Loading Test
    try {
      testResults.push({
        name: currentLanguage === "th" ? "การโหลดรูปภาพ" : "Image Loading",
        status: "loading",
        message: currentLanguage === "th" ? "กำลังทดสอบ..." : "Testing...",
      });
      setTests([...testResults]);

      const attractionData = await attractionAPI.getAttractionDetail("1");
      const imageUrl = attractionData.images[0];
      
      // Test if image URL is accessible  
      await new Promise<void>((resolve, reject) => {
        const img = document.createElement('img');
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Image failed to load"));
        img.src = imageUrl;
      });

      testResults[3] = {
        name: currentLanguage === "th" ? "การโหลดรูปภาพ" : "Image Loading",
        status: "success",
        message: currentLanguage === "th" ? "รูปภาพโหลดได้" : "Images load successfully",
        details: `URL: ${imageUrl}`,
      };
    } catch (error) {
      testResults[3] = {
        name: currentLanguage === "th" ? "การโหลดรูปภาพ" : "Image Loading",
        status: "warning",
        message: currentLanguage === "th" ? "ใช้รูปภาพสำรอง" : "Using fallback images",
        details: error instanceof Error ? error.message : String(error),
      };
    }

    setTests(testResults);

    // Determine overall status
    const hasErrors = testResults.some(test => test.status === "error");
    const hasWarnings = testResults.some(test => test.status === "warning");
    
    if (hasErrors) {
      setOverallStatus("error");
    } else if (hasWarnings) {
      setOverallStatus("warning");
    } else {
      setOverallStatus("success");
    }

    setIsRunning(false);
  };

  useEffect(() => {
    // Auto-run tests on component mount
    runTests();
  }, []);

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "error":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case "loading":
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
    }
  };

  const getStatusBadge = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-100 text-green-800">Success</Badge>;
      case "error":
        return <Badge className="bg-red-100 text-red-800">Error</Badge>;
      case "warning":
        return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      case "loading":
        return <Badge className="bg-blue-100 text-blue-800">Loading</Badge>;
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          {t.title}
        </CardTitle>
        <CardDescription>{t.description}</CardDescription>
        
        <div className="flex items-center justify-between pt-4">
          <Button onClick={runTests} disabled={isRunning} className="flex items-center gap-2">
            {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
            {isRunning ? t.running : t.runTests}
          </Button>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{t.overallStatus}:</span>
            {getStatusBadge(overallStatus)}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <h3 className="text-lg font-semibold">{t.testResults}</h3>
        
        <div className="space-y-3">
          {tests.map((test, index) => (
            <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
              {getStatusIcon(test.status)}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{test.name}</h4>
                  {getStatusBadge(test.status)}
                </div>
                <p className="text-sm text-muted-foreground mt-1">{test.message}</p>
                {test.details && (
                  <p className="text-xs text-muted-foreground mt-1">{test.details}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Recommendations */}
        {tests.length > 0 && (
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Users className="w-4 h-4" />
              {t.recommendations}
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              {tests.some(t => t.status === "error") && (
                <li>• {currentLanguage === "th" ? "เซิร์ฟเวอร์ Backend อาจไม่ทำงาน กรุณาตรวจสอบ localhost:5000" : "Backend server may not be running. Check localhost:5000"}</li>
              )}
              {tests.some(t => t.status === "warning") && (
                <li>• {currentLanguage === "th" ? "แอปใช้ข้อมูลจำลองเมื่อ Backend ไม่พร้อมใช้งาน" : "App falls back to mock data when Backend is unavailable"}</li>
              )}
              {tests.some(t => t.status === "success") && (
                <li>• {currentLanguage === "th" ? "การแสดงข้อมูลและรูปภาพทำงานได้ปกติ" : "Data display and image loading work correctly"}</li>
              )}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default APIIntegrationTest;