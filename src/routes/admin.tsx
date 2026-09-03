import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  BarChart3,
  Users,
  Briefcase,
  FileText,
  Bell,
  Settings,
  Activity,
  Shield,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Portal · CareerOS" },
      {
        name: "description",
        content: "Platform administration and analytics dashboard.",
      },
    ],
  }),
  component: AdminPortal,
} as any);

type StatCard = {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ElementType;
  trend?: "up" | "down" | "neutral";
};

function AdminPortal() {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState<StatCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch admin stats
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/admin/stats");
        if (response.ok) {
          const data = await response.json();
          setStats(data.stats || []);
        }
      } catch (error) {
        console.error("Failed to fetch admin stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards: StatCard[] = [
    { title: "Total Users", value: "1,234", change: "+12%", icon: Users, trend: "up" },
    { title: "Active Jobs", value: "5,678", change: "+5%", icon: Briefcase, trend: "up" },
    { title: "Resumes", value: "890", change: "+8%", icon: FileText, trend: "up" },
    { title: "ATS Reports", value: "2,345", change: "+15%", icon: BarChart3, trend: "up" },
    { title: "Notifications", value: "456", change: "-3%", icon: Bell, trend: "down" },
    { title: "Applications", value: "789", change: "+10%", icon: Activity, trend: "up" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Portal</h1>
          <p className="mt-1 text-muted-foreground">Platform administration and analytics</p>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium">Admin Access</span>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="crawlers">Crawlers</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="ats">ATS Reports</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="flags">Feature Flags</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {statCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.title}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </CardTitle>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    {stat.change && (
                      <p
                        className={`text-xs ${stat.trend === "up" ? "text-success" : "text-destructive"}`}
                      >
                        {stat.change} from last month
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest platform events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { event: "New user signup", user: "john@example.com", time: "2 minutes ago" },
                  { event: "Resume uploaded", user: "jane@example.com", time: "5 minutes ago" },
                  {
                    event: "ATS analysis completed",
                    user: "bob@example.com",
                    time: "10 minutes ago",
                  },
                  {
                    event: "Application created",
                    user: "alice@example.com",
                    time: "15 minutes ago",
                  },
                  { event: "Job crawled", user: "Google", time: "20 minutes ago" },
                ].map((activity, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between border-b border-border/60 pb-3 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium">{activity.event}</p>
                      <p className="text-xs text-muted-foreground">{activity.user}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Other Tabs */}
      {activeTab !== "overview" && (
        <Card>
          <CardHeader>
            <CardTitle className="capitalize">{activeTab}</CardTitle>
            <CardDescription>Manage {activeTab}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Settings className="h-12 w-12 text-muted-foreground/40" />
              <h3 className="mt-4 text-lg font-semibold">Coming Soon</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                The {activeTab} management interface is under development.
              </p>
              <Button className="mt-4" variant="outline">
                Request Access
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
