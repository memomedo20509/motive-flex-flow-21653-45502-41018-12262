import { useMutation, useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import {
  Bot,
  Building2,
  Eye,
  Loader2,
  Phone,
  Sparkles,
  Trash2,
} from "lucide-react";
import type { AssistantLead } from "@shared/schema";
import { AdminLayout } from "./AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AssistantTrialsResponse {
  trials: AssistantLead[];
  total: number;
  unreadCount: number;
}

const sectorLabels: Record<string, string> = {
  marble: "مصانع الرخام والجرانيت",
  construction: "شركات المقاولات",
  finishing: "شركات التشطيب والترميم",
  design: "التصميم والديكور",
  "advertising-production": "الدعاية والإنتاج الإعلاني",
  kitchen: "مصانع المطابخ والأثاث",
  aluminum: "الألمنيوم",
  blacksmith: "الحدادة",
  glass: "الزجاج والسيكوريت",
  elevators: "المصاعد",
  prefab: "البيوت الجاهزة",
  nurseries: "تنسيق الحدائق",
  "pest-control": "مكافحة الحشرات",
};

export default function AssistantTrialsList() {
  const { toast } = useToast();
  const trialsQuery = useQuery<AssistantTrialsResponse>({
    queryKey: ["/api/admin/assistant/trials"],
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/admin/assistant/trials/${id}/read`, { method: "PATCH" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/admin/assistant/trials"] }),
    onError: (error: Error) => toast({ title: error.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/admin/assistant/trials/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/assistant/trials"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/assistant/analytics"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/assistant/leads"] });
      toast({ title: "تم حذف الطلب" });
    },
    onError: (error: Error) => toast({ title: error.message, variant: "destructive" }),
  });

  const data = trialsQuery.data;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold">
              <Bot className="h-7 w-7 text-secondary" /> طلبات تجربة المستشار
            </h1>
            <p className="mt-1 text-muted-foreground">
              العملاء الذين وافقوا على بدء تجربة مجانية من داخل المحادثة.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">الإجمالي {data?.total || 0}</Badge>
            {data?.unreadCount ? <Badge variant="destructive">{data.unreadCount} جديدة</Badge> : null}
          </div>
        </div>

        {trialsQuery.isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-secondary" /></div>
        ) : trialsQuery.isError ? (
          <Card><CardContent className="py-12 text-center text-destructive">تعذر تحميل طلبات التجربة.</CardContent></Card>
        ) : !data?.trials.length ? (
          <Card>
            <CardContent className="py-14 text-center">
              <Sparkles className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h2 className="text-lg font-semibold">لا توجد طلبات من المستشار حتى الآن</h2>
              <p className="mt-2 text-sm text-muted-foreground">أول ما عميل يوافق ويرسل بياناته، الطلب هيظهر هنا.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {data.trials.map((trial) => (
              <Card key={trial.id} className={trial.isRead === "false" ? "border-secondary/50 bg-secondary/5" : ""}>
                <CardHeader className="pb-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <CardTitle className="text-lg">{trial.name}</CardTitle>
                        {trial.isRead === "false" ? <Badge>جديد</Badge> : null}
                        <Badge variant="secondary">من المستشار الذكي</Badge>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(trial.createdAt), { addSuffix: true, locale: ar })}
                      </p>
                    </div>
                    <Sparkles className="h-5 w-5 text-secondary" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3 text-sm sm:grid-cols-2">
                    <a href={`tel:${trial.phone}`} className="flex items-center gap-2 text-secondary" dir="ltr">
                      <Phone className="h-4 w-4" /> {trial.phone}
                    </a>
                    {trial.alternatePhone ? (
                      <a href={`tel:${trial.alternatePhone}`} className="flex items-center gap-2 text-secondary" dir="ltr">
                        <Phone className="h-4 w-4" /> {trial.alternatePhone} <span dir="rtl" className="text-xs text-muted-foreground">بديل</span>
                      </a>
                    ) : null}
                    <div className="flex items-center gap-2"><Building2 className="h-4 w-4 text-muted-foreground" /> {trial.company || "غير محدد"}</div>
                    <div className="flex items-center gap-2"><Bot className="h-4 w-4 text-muted-foreground" /> {sectorLabels[trial.sector || ""] || trial.sector || "قطاع غير محدد"}</div>
                  </div>

                  {trial.painPoint ? (
                    <div className="rounded-lg border bg-background/80 p-3">
                      <p className="mb-1 text-xs font-semibold text-muted-foreground">ملخص احتياجه من المحادثة</p>
                      <p className="text-sm leading-6">{trial.painPoint}</p>
                    </div>
                  ) : null}

                  <div className="flex flex-wrap gap-2">
                    {trial.isRead === "false" ? (
                      <Button size="sm" variant="outline" onClick={() => markAsReadMutation.mutate(trial.id)} disabled={markAsReadMutation.isPending}>
                        <Eye className="ml-1 h-4 w-4" /> تحديد كمقروء
                      </Button>
                    ) : null}
                    <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => deleteMutation.mutate(trial.id)} disabled={deleteMutation.isPending}>
                      <Trash2 className="ml-1 h-4 w-4" /> حذف
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
