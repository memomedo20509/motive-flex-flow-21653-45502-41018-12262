import { useQuery, useMutation } from "@tanstack/react-query";
import { AdminLayout } from "./AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Mail, 
  Phone, 
  Building, 
  Trash2, 
  Eye, 
  Zap,
  Loader2,
  Factory
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import type { TrialSubmission } from "@shared/schema";

interface TrialsResponse {
  trials: TrialSubmission[];
  total: number;
  unreadCount: number;
}

const industryLabels: Record<string, string> = {
  marble: "مصانع الرخام والجرانيت",
  construction: "شركات المقاولات الإنشائية",
  finishing: "شركات التشطيب والترميم",
  design: "شركات التصميم والديكور",
  kitchen: "مصانع المطابخ",
  aluminum: "شركات الألمنيوم",
  other: "أخرى",
};

export default function TrialsList() {
  const { toast } = useToast();

  const { data, isLoading } = useQuery<TrialsResponse>({
    queryKey: ["/api/admin/trials"],
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/admin/trials/${id}/read`, { method: "PATCH" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/trials"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/admin/trials/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      toast({ title: "تم حذف الطلب بنجاح" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/trials"] });
    },
    onError: () => {
      toast({ title: "فشل في حذف الطلب", variant: "destructive" });
    },
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold" data-testid="heading-trials">طلبات التجربة المجانية</h1>
            <p className="text-muted-foreground">
              {data?.unreadCount ? `${data.unreadCount} طلب جديد` : "لا توجد طلبات جديدة"}
            </p>
          </div>
          {data?.unreadCount ? (
            <Badge variant="destructive" className="text-sm">
              {data.unreadCount} جديدة
            </Badge>
          ) : null}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : !data?.trials?.length ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Zap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">لا توجد طلبات</h3>
              <p className="text-muted-foreground">سيتم عرض طلبات التجربة المجانية هنا عند وصولها</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {data.trials.map((trial) => (
              <Card
                key={trial.id}
                className={trial.isRead === "false" ? "border-primary/50 bg-primary/5" : ""}
                data-testid={`card-trial-${trial.id}`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-lg">{trial.fullName}</CardTitle>
                      {trial.isRead === "false" && (
                        <Badge variant="default" className="text-xs">جديد</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(trial.createdAt), { addSuffix: true, locale: ar })}
                    </p>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      <span dir="ltr">{trial.email}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      <span dir="ltr">{trial.phone}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Building className="h-4 w-4" />
                      <span>{trial.company}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Factory className="h-4 w-4" />
                      <span>{industryLabels[trial.industry] || trial.industry}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {trial.isRead === "false" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => markAsReadMutation.mutate(trial.id)}
                        disabled={markAsReadMutation.isPending}
                        data-testid={`button-mark-read-${trial.id}`}
                      >
                        <Eye className="h-4 w-4 ml-1" />
                        تحديد كمقروء
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => deleteMutation.mutate(trial.id)}
                      disabled={deleteMutation.isPending}
                      data-testid={`button-delete-${trial.id}`}
                    >
                      <Trash2 className="h-4 w-4 ml-1" />
                      حذف
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
