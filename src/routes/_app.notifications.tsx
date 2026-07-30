import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { Bell, Check, CheckCheck, Settings, Filter, Search, XCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useNotifications,
  useUnreadCount,
  useMarkAsRead,
  useMarkAllAsRead,
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from "@/hooks/api/useNotifications";
import { transformNotifications, type NotificationUI, type NotificationType, type NotificationPriority, priorityConfig, typeLabels } from "@/types/notification";

export const Route = createFileRoute("/_app/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications · CareerOS" },
      { name: "description", content: "Event-driven, preference-aware alerts across the platform." },
    ],
  }),
  component: NotificationsPage,
});

type ViewMode = "inbox" | "unread" | "preferences";

function NotificationsPage() {
  const [view, setView] = useState<ViewMode>("inbox");
  const [query, setQuery] = useState("");

  // Live backend data
  const { data: notifications, isLoading, isError, error, refetch } = useNotifications();
  const unreadCount = useUnreadCount();
  const { data: preferences } = useNotificationPreferences();
  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();
  const updatePreferencesMutation = useUpdateNotificationPreferences();

  // Filter notifications by search query
  const filtered = useMemo(() => {
    if (!notifications) return [];
    const all = transformNotifications(notifications);
    if (!query.trim()) return all;
    const q = query.toLowerCase();
    return all.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.message.toLowerCase().includes(q) ||
        typeLabels[n.type].toLowerCase().includes(q)
    );
  }, [notifications, query]);

  // Get unread notifications
  const unread = useMemo(() => {
    return filtered.filter((n) => !n.isRead);
  }, [filtered]);

  // Handle mark as read
  const handleMarkAsRead = (id: string) => {
    markAsReadMutation.mutate(id);
  };

  // Handle mark all as read
  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
        <PageHeader
          eyebrow="Personal"
          title="Notifications"
          description="Event-driven, preference-aware alerts across the platform."
        />
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-center gap-4 px-4 py-20">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h2 className="text-lg font-semibold">Failed to load notifications</h2>
        <p className="text-sm text-muted-foreground">{(error as Error)?.message ?? "An unexpected error occurred"}</p>
        <Button variant="outline" onClick={() => refetch()}>Try again</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
      <PageHeader
        eyebrow="Personal"
        title="Notifications"
        description="Event-driven, preference-aware alerts across the platform."
        actions={
          <div className="flex items-center gap-2">
            {view === "inbox" && unread.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="rounded-xl"
                onClick={handleMarkAllAsRead}
                disabled={markAllAsReadMutation.isPending}
              >
                <CheckCheck className="mr-1.5 h-4 w-4" />
                Mark all read
              </Button>
            )}
            <Button variant="ghost" size="icon" className="rounded-xl" aria-label="Refresh" onClick={() => refetch()}>
              <Bell className="h-4 w-4" />
            </Button>
          </div>
        }
      />

      {/* Toolbar */}
      <div className="glass flex flex-wrap items-center gap-2 rounded-2xl border border-border/60 p-2 sm:p-2.5">
        <Tabs value={view} onValueChange={(v) => setView(v as ViewMode)}>
          <TabsList className="rounded-xl">
            <TabsTrigger value="inbox" className="gap-1.5 rounded-lg text-xs">
              <Bell className="h-3.5 w-3.5" />
              Inbox
              {unreadCount > 0 && (
                <Badge variant="secondary" className="ml-1.5 h-5 min-w-5 px-1 text-[10px]">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="unread" className="gap-1.5 rounded-lg text-xs">
              <XCircle className="h-3.5 w-3.5" />
              Unread
            </TabsTrigger>
            <TabsTrigger value="preferences" className="gap-1.5 rounded-lg text-xs">
              <Settings className="h-3.5 w-3.5" />
              Preferences
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {view !== "preferences" && (
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search notifications…"
              className="h-9 rounded-xl border-border/60 bg-background/40 pl-8 text-sm"
            />
          </div>
        )}
      </div>

      {/* Content */}
      {view === "preferences" ? (
        <PreferencesPanel
          preferences={preferences}
          updateMutation={updatePreferencesMutation}
        />
      ) : (
        <NotificationList
          notifications={view === "unread" ? unread : filtered}
          onMarkAsRead={handleMarkAsRead}
          isMarkingRead={markAsReadMutation.isPending}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Notification List Component
// ---------------------------------------------------------------------------

function NotificationList({
  notifications,
  onMarkAsRead,
  isMarkingRead,
}: {
  notifications: NotificationUI[];
  onMarkAsRead: (id: string) => void;
  isMarkingRead: boolean;
}) {
  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border/60 p-20">
        <Bell className="h-16 w-16 text-muted-foreground/40" />
        <h2 className="text-lg font-semibold">No notifications</h2>
        <p className="text-sm text-muted-foreground">
          You're all caught up! New notifications will appear here.
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="glass rounded-2xl border border-border/60">
      <div className="flex flex-col divide-y divide-border/60">
        {notifications.map((n) => (
          <NotificationRow
            key={n.id}
            notification={n}
            onMarkAsRead={onMarkAsRead}
            isMarkingRead={isMarkingRead}
          />
        ))}
      </div>
    </ScrollArea>
  );
}

function NotificationRow({
  notification,
  onMarkAsRead,
  isMarkingRead,
}: {
  notification: NotificationUI;
  onMarkAsRead: (id: string) => void;
  isMarkingRead: boolean;
}) {
  const priorityStyle = priorityConfig[notification.priority];

  return (
    <div className={cn(
      "flex items-start gap-4 p-4 transition-colors",
      !notification.isRead && "bg-primary/5"
    )}>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-medium truncate">{notification.title}</h3>
              <Badge
                variant="secondary"
                className={cn("text-[10px] h-5", priorityStyle.color)}
              >
                {priorityStyle.label}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
              {notification.message}
            </p>
            <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
              <span>{typeLabels[notification.type]}</span>
              <span>·</span>
              <span>{notification.timeAgo}</span>
            </div>
          </div>

          {!notification.isRead && (
            <Button
              variant="ghost"
              size="sm"
              className="rounded-lg h-7 px-2 text-xs"
              onClick={() => onMarkAsRead(notification.id)}
              disabled={isMarkingRead}
            >
              <Check className="h-3 w-3 mr-1" />
              Read
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Preferences Panel Component
// ---------------------------------------------------------------------------

function PreferencesPanel({
  preferences,
  updateMutation,
}: {
  preferences?: {
    email_enabled: boolean;
    in_app_enabled: boolean;
    push_enabled: boolean;
    high_match_threshold: number;
    daily_digest: boolean;
    weekly_digest: boolean;
    quiet_hours?: {
      startHour: number;
      endHour: number;
      timezoneOffsetMinutes?: number;
    } | null;
  };
  updateMutation: ReturnType<typeof useUpdateNotificationPreferences>;
}) {
  const [emailEnabled, setEmailEnabled] = useState(preferences?.email_enabled ?? true);
  const [inAppEnabled, setInAppEnabled] = useState(preferences?.in_app_enabled ?? true);
  const [pushEnabled, setPushEnabled] = useState(preferences?.push_enabled ?? false);
  const [highMatchThreshold, setHighMatchThreshold] = useState(preferences?.high_match_threshold ?? 80);
  const [dailyDigest, setDailyDigest] = useState(preferences?.daily_digest ?? true);
  const [weeklyDigest, setWeeklyDigest] = useState(preferences?.weekly_digest ?? false);

  // Update local state when preferences load
  useEffect(() => {
    if (preferences) {
      setEmailEnabled(preferences.email_enabled);
      setInAppEnabled(preferences.in_app_enabled);
      setPushEnabled(preferences.push_enabled);
      setHighMatchThreshold(preferences.high_match_threshold);
      setDailyDigest(preferences.daily_digest);
      setWeeklyDigest(preferences.weekly_digest);
    }
  }, [preferences]);

  const handleSave = () => {
    updateMutation.mutate({
      email_enabled: emailEnabled,
      in_app_enabled: inAppEnabled,
      push_enabled: pushEnabled,
      high_match_threshold: highMatchThreshold,
      daily_digest: dailyDigest,
      weekly_digest: weeklyDigest,
    });
  };

  return (
    <div className="glass rounded-2xl border border-border/60 p-6">
      <h3 className="mb-4 text-sm font-semibold">Notification Preferences</h3>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">Email notifications</div>
            <div className="text-sm text-muted-foreground">Receive alerts via email</div>
          </div>
          <input
            type="checkbox"
            checked={emailEnabled}
            onChange={(e) => setEmailEnabled(e.target.checked)}
            className="h-4 w-4"
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">In-app notifications</div>
            <div className="text-sm text-muted-foreground">Show alerts in the app</div>
          </div>
          <input
            type="checkbox"
            checked={inAppEnabled}
            onChange={(e) => setInAppEnabled(e.target.checked)}
            className="h-4 w-4"
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">Push notifications</div>
            <div className="text-sm text-muted-foreground">Browser push alerts</div>
          </div>
          <input
            type="checkbox"
            checked={pushEnabled}
            onChange={(e) => setPushEnabled(e.target.checked)}
            className="h-4 w-4"
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">High match threshold</div>
            <div className="text-sm text-muted-foreground">
              Minimum match score to trigger alert
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={50}
              max={100}
              step={5}
              value={highMatchThreshold}
              onChange={(e) => setHighMatchThreshold(Number(e.target.value))}
              className="w-32"
            />
            <span className="text-sm font-mono w-10">{highMatchThreshold}%</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">Daily digest</div>
            <div className="text-sm text-muted-foreground">Summary of daily activity</div>
          </div>
          <input
            type="checkbox"
            checked={dailyDigest}
            onChange={(e) => setDailyDigest(e.target.checked)}
            className="h-4 w-4"
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">Weekly digest</div>
            <div className="text-sm text-muted-foreground">Summary of weekly activity</div>
          </div>
          <input
            type="checkbox"
            checked={weeklyDigest}
            onChange={(e) => setWeeklyDigest(e.target.checked)}
            className="h-4 w-4"
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <Button
          className="rounded-xl"
          onClick={handleSave}
          disabled={updateMutation.isPending}
        >
          Save preferences
        </Button>
      </div>
    </div>
  );
}