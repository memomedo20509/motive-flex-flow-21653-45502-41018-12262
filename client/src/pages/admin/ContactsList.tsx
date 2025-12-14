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
  EyeOff,
  MessageSquare,
  Loader2
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import type { ContactSubmission } from "@shared/schema";

interface ContactsResponse {
  contacts: ContactSubmission[];
  total: number;
  unreadCount: number;
}

export default function ContactsList() {
  const { toast } = useToast();

  const { data, isLoading } = useQuery<ContactsResponse>({
    queryKey: ["/api/admin/contacts"],
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/admin/contacts/${id}/read`, { method: "PATCH" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/contacts"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/admin/contacts/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      toast({ title: "تم حذف الرسالة بنجاح" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/contacts"] });
    },
    onError: () => {
      toast({ title: "فشل في حذف الرسالة", variant: "destructive" });
    },
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold" data-testid="heading-contacts">رسائل التواصل</h1>
            <p className="text-muted-foreground">
              {data?.unreadCount ? `${data.unreadCount} رسالة جديدة` : "لا توجد رسائل جديدة"}
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
        ) : !data?.contacts?.length ? (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">لا توجد رسائل</h3>
              <p className="text-muted-foreground">سيتم عرض رسائل التواصل هنا عند وصولها</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {data.contacts.map((contact) => (
              <Card
                key={contact.id}
                className={contact.isRead === "false" ? "border-primary/50 bg-primary/5" : ""}
                data-testid={`card-contact-${contact.id}`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-lg">{contact.name}</CardTitle>
                      {contact.isRead === "false" && (
                        <Badge variant="default" className="text-xs">جديدة</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(contact.createdAt), { addSuffix: true, locale: ar })}
                    </p>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      <span dir="ltr">{contact.email}</span>
                    </div>
                    {contact.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        <span dir="ltr">{contact.phone}</span>
                      </div>
                    )}
                    {contact.company && (
                      <div className="flex items-center gap-1">
                        <Building className="h-4 w-4" />
                        <span>{contact.company}</span>
                      </div>
                    )}
                  </div>

                  <div className="bg-muted/50 rounded-md p-4">
                    <p className="whitespace-pre-wrap" data-testid={`text-message-${contact.id}`}>
                      {contact.message}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {contact.isRead === "false" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => markAsReadMutation.mutate(contact.id)}
                        disabled={markAsReadMutation.isPending}
                        data-testid={`button-mark-read-${contact.id}`}
                      >
                        <Eye className="h-4 w-4 ml-1" />
                        تحديد كمقروءة
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => deleteMutation.mutate(contact.id)}
                      disabled={deleteMutation.isPending}
                      data-testid={`button-delete-${contact.id}`}
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
