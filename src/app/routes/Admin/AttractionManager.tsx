import { useState } from "react";
import { Video, CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAttractionsForAdmin, updateAttractionStatus } from "@/services/admin.service";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/shared/hooks/use-toast";
import { Link } from "react-router-dom";

interface AttractionManagerProps {
  currentLanguage: "th" | "en";
}

const AttractionManager = ({ currentLanguage }: AttractionManagerProps) => {
  const [statusFilter, setStatusFilter] = useState("all");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: attractions, isLoading, isError, error } = useQuery({
    queryKey: ['admin-attractions'],
    queryFn: getAttractionsForAdmin,
  });

  const { mutate: updateStatus, isPending: isUpdatingStatus } = useMutation({
    mutationFn: ({ id, status }: { id: number; status: "approved" | "rejected" }) =>
      updateAttractionStatus(id, status),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-attractions'] });
      toast({
        title: "Status Updated",
        description: `Attraction "${data.name}" has been ${data.status}.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update status: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const content = {
    th: {
      title: "จัดการสถานที่",
      subtitle: "ตรวจสอบและจัดการสถานที่ที่ส่งเข้ามา",
      all: "ทั้งหมด",
      pending: "รอดำเนินการ",
      approved: "อนุมัติแล้ว",
      rejected: "ปฏิเสธ",
      approve: "อนุมัติ",
      reject: "ปฏิเสธ",
      submittedAt: "ส่งเมื่อ",
      noItems: "ไม่มีสถานที่ตรงกับตัวกรองนี้",
      error: "ไม่สามารถโหลดข้อมูลสถานที่ได้",
      viewOnSite: "ดูบนเว็บไซต์",
    },
    en: {
      title: "Attraction Management",
      subtitle: "Review and manage submitted attractions",
      all: "All",
      pending: "Pending",
      approved: "Approved",
      rejected: "Rejected",
      approve: "Approve",
      reject: "Reject",
      submittedAt: "Submitted at",
      noItems: "No attractions match this filter",
      error: "Failed to load attraction data",
      viewOnSite: "View on Site",
    },
  };

  const t = content[currentLanguage];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="w-4 h-4 text-yellow-600" />;
      case "approved": return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "rejected": return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "approved": return "bg-green-100 text-green-800";
      case "rejected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const filteredAttractions =
    attractions?.filter(
      (attraction) => statusFilter === "all" || attraction.status === statusFilter
    ) || [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(currentLanguage === "th" ? "th-TH" : "en-US", {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  };

  const renderSkeleton = () => (
    Array.from({ length: 3 }).map((_, i) => (
      <Card key={i}>
        <CardContent className="p-4">
          <div className="flex items-start space-x-4">
            <Skeleton className="w-24 h-16 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex items-center space-x-2 pt-2">
                <Skeleton className="h-8 w-20 rounded-md" />
                <Skeleton className="h-8 w-20 rounded-md" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    ))
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">{t.title}</h2>
        <p className="text-muted-foreground">{t.subtitle}</p>
      </div>

      <Tabs value={statusFilter} onValueChange={setStatusFilter}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">{t.all}</TabsTrigger>
          <TabsTrigger value="pending">{t.pending}</TabsTrigger>
          <TabsTrigger value="approved">{t.approved}</TabsTrigger>
          <TabsTrigger value="rejected">{t.rejected}</TabsTrigger>
        </TabsList>

        <TabsContent value={statusFilter} className="mt-4 space-y-4">
          {isLoading ? (
            renderSkeleton()
          ) : isError ? (
            <Card className="bg-destructive/10 border-destructive">
              <CardHeader className="flex flex-row items-center gap-4">
                <AlertTriangle className="w-8 h-8 text-destructive" />
                <div>
                  <CardTitle>{t.error}</CardTitle>
                  <CardDescription className="text-destructive-foreground">
                    {error?.message || "An unknown error occurred"}
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>
          ) : filteredAttractions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Video className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">{t.noItems}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredAttractions.map((attraction) => (
                <Card key={attraction.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      <img
                        src={attraction.cover_image_url || 'https://placehold.co/400x300/e2e8f0/adb5bd?text=No+Image'}
                        alt={attraction.name}
                        className="w-24 h-16 bg-muted rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold truncate">{attraction.name}</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {t.submittedAt}: {formatDate(attraction.created_at)}
                            </p>
                          </div>
                          <Badge className={getStatusColor(attraction.status)}>
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(attraction.status)}
                              <span>{t[attraction.status as keyof typeof t] || attraction.status}</span>
                            </div>
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2 mt-3">
                          {attraction.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                disabled={isUpdatingStatus}
                                onClick={() => updateStatus({ id: attraction.id, status: 'approved' })}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                {t.approve}
                              </Button>
                              <Button
                                size="sm"
                                disabled={isUpdatingStatus}
                                variant="destructive"
                                onClick={() => updateStatus({ id: attraction.id, status: 'rejected' })}
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                {t.reject}
                              </Button>
                            </>
                          )}
                          <Button size="sm" variant="outline" asChild>
                            <Link to={`/attraction/${attraction.id}`} target="_blank" rel="noopener noreferrer">
                              {t.viewOnSite}
                            </Link>
                          </Button>
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

export default AttractionManager;