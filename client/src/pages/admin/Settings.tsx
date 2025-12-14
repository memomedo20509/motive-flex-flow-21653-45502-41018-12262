import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AdminLayout } from "./AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { 
  Settings as SettingsIcon, 
  Loader2,
  Mail,
  Save
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const settingsFormSchema = z.object({
  notification_email: z.string().email("البريد الإلكتروني غير صالح"),
});

type SettingsForm = z.infer<typeof settingsFormSchema>;

export default function Settings() {
  const { toast } = useToast();

  const form = useForm<SettingsForm>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      notification_email: "",
    },
  });

  const { data: settings, isLoading } = useQuery<Record<string, string>>({
    queryKey: ["/api/admin/settings"],
  });

  const updateMutation = useMutation({
    mutationFn: async (data: SettingsForm) => {
      return apiRequest("/api/admin/settings", {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({ title: "تم حفظ الإعدادات بنجاح" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
    },
    onError: (error: any) => {
      toast({ 
        title: "فشل في حفظ الإعدادات", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  if (settings && form.getValues("notification_email") === "") {
    form.reset({
      notification_email: settings.notification_email || "",
    });
  }

  const onSubmit = (data: SettingsForm) => {
    updateMutation.mutate(data);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold" data-testid="heading-settings">الإعدادات</h1>
          <p className="text-muted-foreground">
            إعدادات النظام والإشعارات
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                إعدادات الإشعارات
              </CardTitle>
              <CardDescription>
                إعداد البريد الإلكتروني لاستقبال إشعارات رسائل التواصل
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="notification_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>البريد الإلكتروني للإشعارات</FormLabel>
                        <FormControl>
                          <Input 
                            type="email" 
                            dir="ltr" 
                            className="text-left max-w-md"
                            placeholder="admin@example.com"
                            data-testid="input-notification-email"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          سيتم إرسال إشعارات رسائل التواصل الجديدة إلى هذا البريد الإلكتروني
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    disabled={updateMutation.isPending}
                    data-testid="button-save-settings"
                  >
                    {updateMutation.isPending ? (
                      <>
                        <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                        جاري الحفظ...
                      </>
                    ) : (
                      <>
                        <Save className="ml-2 h-4 w-4" />
                        حفظ الإعدادات
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
