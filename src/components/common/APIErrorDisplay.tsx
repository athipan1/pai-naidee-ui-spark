import { AlertTriangle, Wifi, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLanguage } from "@/shared/contexts/LanguageProvider";

interface APIErrorDisplayProps {
  error: Error | null;
  isLoading?: boolean;
  onRetry?: () => void;
  showRetryButton?: boolean;
  fallbackMessage?: string;
}

const getErrorType = (error: Error | null): "network" | "server" | "not_found" | "generic" => {
  if (!error) return "generic";
  
  const message = error.message.toLowerCase();
  
  if (message.includes("fetch") || message.includes("network") || message.includes("connection")) {
    return "network";
  }
  if (message.includes("not found") || message.includes("404")) {
    return "not_found";
  }
  if (message.includes("500") || message.includes("server")) {
    return "server";
  }
  
  return "generic";
};

const getErrorMessages = (errorType: string, language: "th" | "en" = "en") => {
  const messages = {
    network: {
      th: {
        title: "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้",
        description: "กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตของคุณ หรือลองใหม่อีกครั้ง",
        fallback: "กำลังแสดงข้อมูลตัवอย่างแทน"
      },
      en: {
        title: "Unable to connect to server",
        description: "Please check your internet connection or try again later",
        fallback: "Showing sample data instead"
      }
    },
    server: {
      th: {
        title: "เซิร์ฟเวอร์กำลังมีปัญหา",
        description: "เซิร์ฟเวอร์กำลังประสบปัญหาชั่วคราว กรุณาลองใหม่อีกครั้ง",
        fallback: "กำลังแสดงข้อมูลตัวอย่างแทน"
      },
      en: {
        title: "Server is experiencing issues",
        description: "The server is temporarily experiencing problems. Please try again",
        fallback: "Showing sample data instead"
      }
    },
    not_found: {
      th: {
        title: "ไม่พบข้อมูลที่คุณต้องการ",
        description: "ข้อมูลที่คุณกำลังมองหา อาจถูกลบหรือย้ายที่แล้ว",
        fallback: "กำลังแสดงข้อมูลตัวอย่างแทน"
      },
      en: {
        title: "Data not found",
        description: "The information you're looking for may have been removed or moved",
        fallback: "Showing sample data instead"
      }
    },
    generic: {
      th: {
        title: "เกิดข้อผิดพลาด",
        description: "เกิดข้อผิดพลาดในการโหลดข้อมูล กรุณาลองใหม่อีกครั้ง",
        fallback: "กำลังแสดงข้อมูลตัวอย่างแทน"
      },
      en: {
        title: "Something went wrong",
        description: "An error occurred while loading data. Please try again",
        fallback: "Showing sample data instead"
      }
    }
  };

  return messages[errorType as keyof typeof messages] || messages.generic;
};

export const APIErrorDisplay: React.FC<APIErrorDisplayProps> = ({
  error,
  isLoading = false,
  onRetry,
  showRetryButton = true,
  fallbackMessage,
}) => {
  const { language } = useLanguage();
  if (!error && !fallbackMessage) return null;
  
  const errorType = getErrorType(error);
  const messages = getErrorMessages(errorType, language);
  
  const getIcon = () => {
    switch (errorType) {
      case "network":
        return <Wifi className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <Alert className="mb-4 border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
      <div className="flex items-start gap-3">
        {getIcon()}
        <div className="flex-1">
          <AlertDescription className="mb-3">
            <div className="font-medium text-orange-800 dark:text-orange-200 mb-1">
              {error ? messages[language].title : (language === "th" ? "ใช้ข้อมูลตัวอย่าง" : "Using Sample Data")}
            </div>
            <div className="text-sm text-orange-700 dark:text-orange-300">
              {error ? messages[language].description : (fallbackMessage || messages[language].fallback)}
            </div>
          </AlertDescription>
          
          {error && showRetryButton && onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              disabled={isLoading}
              className="border-orange-300 text-orange-800 hover:bg-orange-100 dark:border-orange-700 dark:text-orange-200 dark:hover:bg-orange-900"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
                  {language === "th" ? "กำลังลองใหม่..." : "Retrying..."}
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-3 w-3" />
                  {language === "th" ? "ลองใหม่" : "Try Again"}
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </Alert>
  );
};

export default APIErrorDisplay;