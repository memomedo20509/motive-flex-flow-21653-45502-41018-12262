import { useMemo, useState, type FormEvent } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  BarChart3,
  Bot,
  BookOpen,
  Building2,
  CheckCircle2,
  Clock3,
  Coins,
  Cpu,
  Loader2,
  MessageSquare,
  Pencil,
  Phone,
  Plus,
  Save,
  ThumbsDown,
  Trash2,
  Users,
} from "lucide-react";
import type { AssistantKnowledge, AssistantLead } from "@shared/schema";
import type { LucideIcon } from "lucide-react";
import { AdminLayout } from "./AdminLayout";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

interface AssistantAnalytics {
  sessions: number;
  messages: number;
  leads: number;
  positiveFeedback: number;
  negativeFeedback: number;
  unanswered: number;
  aiResponses: number;
  fallbackResponses: number;
  totalPromptTokens: number;
  totalCompletionTokens: number;
  totalCostUsd: number;
  averageLatencyMs: number;
  topSectors: Array<{ sector: string; count: number }>;
  modelUsage: Array<{ model: string; messages: number; tokens: number; costUsd: number }>;
}

interface KnowledgeForm {
  slug: string;
  type: string;
  sector: string;
  title: string;
  content: string;
  tags: string;
  sourceUrl: string;
  priority: number;
  status: string;
}

const EMPTY_FORM: KnowledgeForm = {
  slug: "",
  type: "faq",
  sector: "",
  title: "",
  content: "",
  tags: "",
  sourceUrl: "",
  priority: 50,
  status: "published",
};

const TYPE_LABELS: Record<string, string> = {
  product: "عن المنتج",
  feature: "ميزة",
  sector: "قطاع",
  pricing: "أسعار",
  faq: "سؤال شائع",
  policy: "سياسة",
  sales: "تأهيل بيعي",
};

function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat("ar-SA", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function knowledgeToForm(entry: AssistantKnowledge): KnowledgeForm {
  return {
    slug: entry.slug,
    type: entry.type,
    sector: entry.sector || "",
    title: entry.title,
    content: entry.content,
    tags: entry.tags.join(", "),
    sourceUrl: entry.sourceUrl || "",
    priority: entry.priority,
    status: entry.status,
  };
}

export default function AssistantManagement() {
  const { toast } = useToast();
  const [typeFilter, setTypeFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<AssistantKnowledge | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<KnowledgeForm>(EMPTY_FORM);

  const analyticsQuery = useQuery<AssistantAnalytics>({ queryKey: ["/api/admin/assistant/analytics"] });
  const knowledgeQuery = useQuery<AssistantKnowledge[]>({
    queryKey: ["/api/admin/assistant/knowledge", { type: typeFilter }],
  });
  const leadsQuery = useQuery<AssistantLead[]>({ queryKey: ["/api/admin/assistant/leads"] });

  const filteredKnowledge = useMemo(() => {
    const needle = search.trim().toLocaleLowerCase("ar");
    if (!needle) return knowledgeQuery.data || [];
    return (knowledgeQuery.data || []).filter((entry) =>
      [entry.title, entry.slug, entry.sector, entry.content, ...entry.tags]
        .filter(Boolean)
        .some((value) => String(value).toLocaleLowerCase("ar").includes(needle)),
    );
  }, [knowledgeQuery.data, search]);

  const saveMutation = useMutation({
    mutationFn: async (payload: KnowledgeForm) => {
      const body = {
        ...payload,
        sector: payload.sector || null,
        sourceUrl: payload.sourceUrl || null,
        tags: payload.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
      };
      return editing
        ? apiRequest(`/api/admin/assistant/knowledge/${editing.id}`, { method: "PATCH", body: JSON.stringify(body) })
        : apiRequest("/api/admin/assistant/knowledge", { method: "POST", body: JSON.stringify(body) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/assistant/knowledge"] });
      setFormOpen(false);
      setEditing(null);
      setForm(EMPTY_FORM);
      toast({ title: editing ? "تم تحديث المعرفة" : "تمت إضافة المعرفة" });
    },
    onError: (error: Error) => toast({ title: error.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/admin/assistant/knowledge/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/assistant/knowledge"] });
      toast({ title: "تم حذف عنصر المعرفة" });
    },
    onError: (error: Error) => toast({ title: error.message, variant: "destructive" }),
  });

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormOpen(true);
  };

  const openEdit = (entry: AssistantKnowledge) => {
    setEditing(entry);
    setForm(knowledgeToForm(entry));
    setFormOpen(true);
  };

  const submitKnowledge = (event: FormEvent) => {
    event.preventDefault();
    saveMutation.mutate(form);
  };

  const analytics = analyticsQuery.data;
  const helpfulTotal = (analytics?.positiveFeedback || 0) + (analytics?.negativeFeedback || 0);
  const helpfulRate = helpfulTotal ? Math.round(((analytics?.positiveFeedback || 0) / helpfulTotal) * 100) : 0;

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold"><Bot className="h-7 w-7 text-secondary" /> المستشار الذكي</h1>
            <p className="mt-1 text-muted-foreground">راقب الاستخدام، راجع العملاء المحتملين، وحدّث المعلومات التي يعتمد عليها المساعد.</p>
          </div>
          <Button onClick={openCreate}><Plus className="ml-2 h-4 w-4" /> إضافة معرفة</Button>
        </div>

        {analyticsQuery.isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-7 w-7 animate-spin" /></div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {([
              ["المحادثات", analytics?.sessions || 0, Users],
              ["ردود الذكاء", analytics?.aiResponses || 0, MessageSquare],
              ["طلبات التواصل", analytics?.leads || 0, Phone],
              ["نسبة الرد المفيد", `${helpfulRate}%`, CheckCircle2],
              ["التكلفة الإجمالية", `$${(analytics?.totalCostUsd || 0).toFixed(4)}`, Coins],
              ["متوسط زمن الرد", `${((analytics?.averageLatencyMs || 0) / 1000).toFixed(1)} ث`, Clock3],
              ["ردود احتياطية", analytics?.fallbackResponses || 0, ThumbsDown],
              ["بدون معرفة كافية", analytics?.unanswered || 0, BarChart3],
            ] as Array<[string, string | number, LucideIcon]>).map(([label, value, Icon]) => (
              <Card key={String(label)}>
                <CardContent className="p-5">
                  <Icon className="mb-3 h-5 w-5 text-secondary" />
                  <p className="text-2xl font-bold">{value}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-secondary" /> قاعدة المعرفة</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ابحث في العنوان أو المحتوى أو الوسوم" className="min-w-[220px] flex-1" />
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">كل الأنواع</SelectItem>
                    {Object.entries(TYPE_LABELS).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {knowledgeQuery.isLoading ? (
                <div className="flex justify-center py-10"><Loader2 className="h-7 w-7 animate-spin" /></div>
              ) : !filteredKnowledge.length ? (
                <div className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">لا توجد عناصر مطابقة.</div>
              ) : (
                <div className="space-y-3">
                  {filteredKnowledge.map((entry) => (
                    <div key={entry.id} className="rounded-xl border p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold">{entry.title}</h3>
                            <Badge variant="secondary">{TYPE_LABELS[entry.type] || entry.type}</Badge>
                            <Badge variant={entry.status === "published" ? "default" : "outline"}>{entry.status === "published" ? "منشور" : "مسودة"}</Badge>
                            {entry.sector ? <Badge variant="outline">{entry.sector}</Badge> : null}
                          </div>
                          <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">{entry.content}</p>
                          <p className="mt-2 text-xs text-muted-foreground">الأولوية {entry.priority} · {entry.slug}</p>
                        </div>
                        <div className="flex shrink-0 gap-1">
                          <Button size="icon" variant="ghost" onClick={() => openEdit(entry)} aria-label="تعديل"><Pencil className="h-4 w-4" /></Button>
                          <Button size="icon" variant="ghost" className="text-destructive" onClick={() => {
                            if (window.confirm(`حذف "${entry.title}"؟`)) deleteMutation.mutate(entry.id);
                          }} aria-label="حذف"><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Building2 className="h-5 w-5 text-secondary" /> القطاعات الأكثر سؤالًا</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {analytics?.topSectors?.length ? analytics.topSectors.map((item, index) => (
                  <div key={item.sector} className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary/10 text-xs font-bold text-secondary">{index + 1}</span>
                    <span className="flex-1 text-sm">{item.sector}</span>
                    <Badge variant="outline">{item.count}</Badge>
                  </div>
                )) : <p className="text-sm text-muted-foreground">تظهر البيانات بعد بدء المحادثات.</p>}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Cpu className="h-5 w-5 text-secondary" /> استخدام الموديل</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {analytics?.modelUsage?.length ? analytics.modelUsage.map((item) => (
                  <div key={item.model} className="rounded-lg border p-3 text-xs">
                    <p className="truncate font-semibold" dir="ltr" title={item.model}>{item.model}</p>
                    <div className="mt-2 flex justify-between text-muted-foreground">
                      <span>{item.messages} رد</span>
                      <span>{item.tokens.toLocaleString("en-US")} token</span>
                      <span>${item.costUsd.toFixed(4)}</span>
                    </div>
                  </div>
                )) : <p className="text-sm text-muted-foreground">تظهر التكلفة والتوكنز بعد أول رد من OpenRouter.</p>}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-lg">أحدث طلبات التواصل</CardTitle></CardHeader>
              <CardContent className="p-0">
                {leadsQuery.isLoading ? <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div> : (
                  <Table>
                    <TableHeader><TableRow><TableHead className="text-right">العميل</TableHead><TableHead className="text-right">التاريخ</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {(leadsQuery.data || []).slice(0, 8).map((lead) => (
                        <TableRow key={lead.id}>
                          <TableCell>
                            <p className="font-medium">{lead.name}</p>
                            <a href={`tel:${lead.phone}`} dir="ltr" className="text-xs text-secondary">{lead.phone}</a>
                            {lead.sector ? <p className="mt-1 text-xs text-muted-foreground">{lead.sector}</p> : null}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-xs text-muted-foreground">{formatDate(lead.createdAt)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
                {!leadsQuery.isLoading && !leadsQuery.data?.length ? <p className="p-6 text-center text-sm text-muted-foreground">لا توجد طلبات حتى الآن.</p> : null}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent dir="rtl" className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader className="text-right">
            <DialogTitle>{editing ? "تعديل عنصر المعرفة" : "إضافة عنصر معرفة"}</DialogTitle>
            <DialogDescription>المحتوى المنشور يدخل مباشرة في السياق الذي يستند إليه المستشار عند الإجابة.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submitKnowledge} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="knowledge-title">العنوان</Label><Input id="knowledge-title" required value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} /></div>
              <div className="space-y-2"><Label htmlFor="knowledge-slug">المعرّف الفريد</Label><Input id="knowledge-slug" required dir="ltr" pattern="[a-z0-9-]+" placeholder="example-slug" value={form.slug} onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") }))} /></div>
              <div className="space-y-2">
                <Label>النوع</Label>
                <Select value={form.type} onValueChange={(value) => setForm((current) => ({ ...current, type: value }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(TYPE_LABELS).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label htmlFor="knowledge-sector">القطاع (اختياري)</Label><Input id="knowledge-sector" dir="ltr" value={form.sector} onChange={(event) => setForm((current) => ({ ...current, sector: event.target.value }))} /></div>
              <div className="space-y-2"><Label htmlFor="knowledge-priority">الأولوية من 0 إلى 100</Label><Input id="knowledge-priority" type="number" min={0} max={100} value={form.priority} onChange={(event) => setForm((current) => ({ ...current, priority: Number(event.target.value) }))} /></div>
              <div className="space-y-2">
                <Label>الحالة</Label>
                <Select value={form.status} onValueChange={(value) => setForm((current) => ({ ...current, status: value }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="published">منشور</SelectItem><SelectItem value="draft">مسودة</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2"><Label htmlFor="knowledge-content">المحتوى المعتمد</Label><Textarea id="knowledge-content" required rows={10} value={form.content} onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))} /></div>
            <div className="space-y-2"><Label htmlFor="knowledge-tags">وسوم البحث (افصل بفاصلة)</Label><Input id="knowledge-tags" value={form.tags} onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value }))} /></div>
            <div className="space-y-2"><Label htmlFor="knowledge-source">رابط المصدر الداخلي أو العام (اختياري)</Label><Input id="knowledge-source" dir="ltr" placeholder="/features" value={form.sourceUrl} onChange={(event) => setForm((current) => ({ ...current, sourceUrl: event.target.value }))} /></div>
            <DialogFooter className="gap-2 sm:justify-start">
              <Button type="submit" disabled={saveMutation.isPending}>{saveMutation.isPending ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Save className="ml-2 h-4 w-4" />} حفظ</Button>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>إلغاء</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
