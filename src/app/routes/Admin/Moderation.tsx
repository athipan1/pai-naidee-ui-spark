import { useState } from "react";
import { Shield, AlertTriangle, User, MessageSquare, Flag, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/shared/contexts/LanguageProvider";

interface ModerationItem {
  id: string;
  type: "content" | "user" | "comment";
  title: string;
  description: string;
  reportedBy: string;
  reportedAt: string;
  status: "pending" | "reviewing" | "resolved" | "dismissed";
  severity: "low" | "medium" | "high" | "critical";
  category: string;
}

const Moderation = () => {
  const { language } = useLanguage();
  const [selectedTab, setSelectedTab] = useState("all");

  const content = {
    th: {
      title: "การควบคุมเนื้อหา",
      subtitle: "จัดการรายงานและการควบคุมเนื้อหา",
      all: "ทั้งหมด",
      pending: "รอดำเนินการ",
      reviewing: "กำลังตรวจสอบ",
      resolved: "แก้ไขแล้ว",
      dismissed: "ปิดเรื่อง",
      severity: "ระดับความรุนแรง",
      low: "ต่ำ",
      medium: "ปานกลาง", 
      high: "สูง",
      critical: "วิกฤต",
      reportedBy: "รายงานโดย",
      category: "หมวดหมู่",
      actions: "การดำเนินการ",
      review: "ตรวจสอบ",
      resolve: "แก้ไข",
      dismiss: "ปิดเรื่อง",
      viewDetails: "ดูรายละเอียด",
      noReports: "ไม่มีรายงาน",
      content: "เนื้อหา",
      user: "ผู้ใช้",
      comment: "ความคิดเห็น"
    },
    en: {
      title: "Content Moderation",
      subtitle: "Manage reports and content moderation",
      all: "All",
      pending: "Pending",
      reviewing: "Reviewing",
      resolved: "Resolved",
      dismissed: "Dismissed",
      severity: "Severity",
      low: "Low",
      medium: "Medium",
      high: "High", 
      critical: "Critical",
      reportedBy: "Reported by",
      category: "Category",
      actions: "Actions",
      review: "Review",
      resolve: "Resolve",
      dismiss: "Dismiss",
      viewDetails: "View Details",
      noReports: "No reports",
      content: "Content",
      user: "User",
      comment: "Comment"
    }
  };

  const t = content[language];

  // Mock data - in real app this would come from API
  const moderationItems: ModerationItem[] = [
    {
      id: "1",
      type: "content",
      title: "Inappropriate content in video",
      description: "Video contains inappropriate content that violates community guidelines",
      reportedBy: "user123",
      reportedAt: "2024-01-15T10:30:00Z",
      status: "pending",
      severity: "high",
      category: "Inappropriate Content"
    },
    {
      id: "2", 
      type: "user",
      title: "Spam account activity",
      description: "User posting multiple spam comments and content",
      reportedBy: "moderator",
      reportedAt: "2024-01-15T09:15:00Z",
      status: "reviewing",
      severity: "medium",
      category: "Spam"
    },
    {
      id: "3",
      type: "comment",
      title: "Harassment in comments",
      description: "User posting harassing comments towards other users",
      reportedBy: "user456",
      reportedAt: "2024-01-14T16:45:00Z", 
      status: "resolved",
      severity: "high",
      category: "Harassment"
    },
    {
      id: "4",
      type: "content",
      title: "Copyright violation",
      description: "Content appears to violate copyright laws",
      reportedBy: "copyright_holder",
      reportedAt: "2024-01-14T14:20:00Z",
      status: "dismissed",
      severity: "low",
      category: "Copyright"
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "low":
        return "bg-blue-100 text-blue-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "critical":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "reviewing":
        return "bg-blue-100 text-blue-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      case "dismissed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "content":
        return <Flag className="w-4 h-4" />;
      case "user":
        return <User className="w-4 h-4" />;
      case "comment":
        return <MessageSquare className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const filteredItems = selectedTab === "all" 
    ? moderationItems 
    : moderationItems.filter(item => item.status === selectedTab);

  const handleReview = (id: string) => {
    // TODO: Implement review functionality
    console.log("Reviewing item:", id);
  };

  const handleResolve = (id: string) => {
    // TODO: Implement resolve functionality
    console.log("Resolving item:", id);
  };

  const handleDismiss = (id: string) => {
    // TODO: Implement dismiss functionality  
    console.log("Dismissing item:", id);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(
      language === "th" ? "th-TH" : "en-US",
      { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold">{t.title}</h2>
        <p className="text-muted-foreground">{t.subtitle}</p>
      </div>

      {/* Status Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">{t.all}</TabsTrigger>
          <TabsTrigger value="pending">{t.pending}</TabsTrigger>
          <TabsTrigger value="reviewing">{t.reviewing}</TabsTrigger>
          <TabsTrigger value="resolved">{t.resolved}</TabsTrigger>
          <TabsTrigger value="dismissed">{t.dismissed}</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="space-y-4">
          {filteredItems.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Shield className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">{t.noReports}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredItems.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      {/* Type Icon */}
                      <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                        {getTypeIcon(item.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold">{item.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {item.description}
                            </p>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-2">
                              <span>{t.reportedBy}: {item.reportedBy}</span>
                              <span>{t.category}: {item.category}</span>
                              <span>{formatDate(item.reportedAt)}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 ml-4">
                            <Badge className={getSeverityColor(item.severity)}>
                              {t[item.severity as keyof typeof t] || item.severity}
                            </Badge>
                            <Badge className={getStatusColor(item.status)}>
                              {t[item.status as keyof typeof t] || item.status}
                            </Badge>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2 mt-3">
                          <Badge variant="outline" className="flex items-center space-x-1">
                            {getTypeIcon(item.type)}
                            <span>{t[item.type as keyof typeof t] || item.type}</span>
                          </Badge>

                          <div className="flex items-center space-x-2 ml-auto">
                            {item.status === "pending" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleReview(item.id)}
                                className="flex items-center space-x-1"
                              >
                                <Shield className="w-3 h-3" />
                                <span>{t.review}</span>
                              </Button>
                            )}

                            {(item.status === "pending" || item.status === "reviewing") && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleResolve(item.id)}
                                  className="flex items-center space-x-1 bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="w-3 h-3" />
                                  <span>{t.resolve}</span>
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDismiss(item.id)}
                                  className="flex items-center space-x-1"
                                >
                                  <XCircle className="w-3 h-3" />
                                  <span>{t.dismiss}</span>
                                </Button>
                              </>
                            )}

                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => console.log("View details:", item.id)}
                              className="flex items-center space-x-1"
                            >
                              <AlertTriangle className="w-3 h-3" />
                              <span>{t.viewDetails}</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Moderation;