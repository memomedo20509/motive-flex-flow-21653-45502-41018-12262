import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Eye, Tag, TrendingUp } from "lucide-react";
import { AdminLayout } from "./AdminLayout";
import type { Article } from "@shared/schema";

interface ArticlesResponse {
  articles: Article[];
  total: number;
}

const Dashboard = () => {
  const { data: publishedData } = useQuery<ArticlesResponse>({
    queryKey: ["/api/admin/articles", { status: "published", limit: 100 }],
  });

  const { data: draftData } = useQuery<ArticlesResponse>({
    queryKey: ["/api/admin/articles", { status: "draft", limit: 100 }],
  });

  const { data: allData } = useQuery<ArticlesResponse>({
    queryKey: ["/api/admin/articles", { limit: 100 }],
  });

  const { data: tags } = useQuery<string[]>({
    queryKey: ["/api/articles/tags"],
  });

  const totalViews = allData?.articles.reduce((sum, article) => sum + (article.viewCount || 0), 0) || 0;

  const stats = [
    {
      title: "إجمالي المقالات",
      value: allData?.total || 0,
      icon: FileText,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "المقالات المنشورة",
      value: publishedData?.total || 0,
      icon: TrendingUp,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "إجمالي المشاهدات",
      value: totalViews,
      icon: Eye,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "التصنيفات",
      value: tags?.length || 0,
      icon: Tag,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
  ];

  const recentArticles = allData?.articles.slice(0, 5) || [];

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-dashboard-title">لوحة التحكم</h1>
          <p className="text-muted-foreground mt-1">مرحباً بك في لوحة إدارة موتفلكس</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Card key={index} data-testid={`card-stat-${index}`}>
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value.toLocaleString("ar-SA")}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>أحدث المقالات</CardTitle>
          </CardHeader>
          <CardContent>
            {recentArticles.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                لا توجد مقالات بعد
              </p>
            ) : (
              <div className="space-y-4">
                {recentArticles.map((article) => (
                  <div
                    key={article.id}
                    className="flex items-center justify-between gap-4 p-3 rounded-lg border"
                    data-testid={`row-recent-article-${article.id}`}
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{article.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(article.createdAt).toLocaleDateString("ar-SA")}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {article.viewCount}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          article.status === "published"
                            ? "bg-green-500/10 text-green-600"
                            : "bg-yellow-500/10 text-yellow-600"
                        }`}
                      >
                        {article.status === "published" ? "منشور" : "مسودة"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
