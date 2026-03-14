"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Bell,
  MessageSquare,
  ShoppingCart,
  Cloud,
  Users,
  BookOpen,
  AlertTriangle,
  CheckCircle,
  Info,
  Clock,
  Check,
  Trash2,
  Settings,
  Filter,
} from "lucide-react"

interface Notification {
  id: string
  type: "message" | "marketplace" | "weather" | "community" | "learning" | "system"
  title: string
  description: string
  time: string
  read: boolean
  priority: "low" | "medium" | "high"
  avatar?: string
  action?: {
    label: string
    href: string
  }
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "weather",
    title: "Weather Alert: Heavy Rain Expected",
    description: "Heavy rainfall predicted for your region tomorrow. Consider protecting sensitive crops.",
    time: "5 minutes ago",
    read: false,
    priority: "high",
  },
  {
    id: "2",
    type: "message",
    title: "New message from Sarah Johnson",
    description: "Hi! I saw your listing for organic tomatoes. Are they still available?",
    time: "15 minutes ago",
    read: false,
    priority: "medium",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    action: { label: "Reply", href: "/messages" },
  },
  {
    id: "3",
    type: "marketplace",
    title: "Your listing received an offer",
    description: "John Smith made an offer of $350 for your wheat harvest listing.",
    time: "1 hour ago",
    read: false,
    priority: "medium",
    action: { label: "View Offer", href: "/marketplace" },
  },
  {
    id: "4",
    type: "community",
    title: "New reply to your post",
    description: "Michael Brown commented on 'Best practices for pest control'",
    time: "2 hours ago",
    read: true,
    priority: "low",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
    action: { label: "View", href: "/community" },
  },
  {
    id: "5",
    type: "learning",
    title: "New course available",
    description: "Check out 'Advanced Irrigation Techniques' - a new course just added to the learning hub.",
    time: "3 hours ago",
    read: true,
    priority: "low",
    action: { label: "Start Learning", href: "/learn" },
  },
  {
    id: "6",
    type: "system",
    title: "Profile completion reminder",
    description: "Complete your profile to connect with more farmers in your area.",
    time: "1 day ago",
    read: true,
    priority: "low",
  },
  {
    id: "7",
    type: "weather",
    title: "Frost Warning Lifted",
    description: "The frost warning for your region has been lifted. Temperature is now stable.",
    time: "1 day ago",
    read: true,
    priority: "medium",
  },
  {
    id: "8",
    type: "marketplace",
    title: "Price drop alert",
    description: "Fertilizer prices have dropped 15% in your area. Great time to stock up!",
    time: "2 days ago",
    read: true,
    priority: "low",
    action: { label: "Browse", href: "/marketplace" },
  },
]

const getIcon = (type: string) => {
  switch (type) {
    case "message":
      return <MessageSquare className="h-5 w-5" />
    case "marketplace":
      return <ShoppingCart className="h-5 w-5" />
    case "weather":
      return <Cloud className="h-5 w-5" />
    case "community":
      return <Users className="h-5 w-5" />
    case "learning":
      return <BookOpen className="h-5 w-5" />
    default:
      return <Bell className="h-5 w-5" />
  }
}

const getPriorityIcon = (priority: string) => {
  switch (priority) {
    case "high":
      return <AlertTriangle className="h-4 w-4 text-destructive" />
    case "medium":
      return <Info className="h-4 w-4 text-amber-500" />
    default:
      return <CheckCircle className="h-4 w-4 text-muted-foreground" />
  }
}

const getTypeColor = (type: string) => {
  switch (type) {
    case "message":
      return "bg-blue-500/10 text-blue-600"
    case "marketplace":
      return "bg-emerald-500/10 text-emerald-600"
    case "weather":
      return "bg-amber-500/10 text-amber-600"
    case "community":
      return "bg-purple-500/10 text-purple-600"
    case "learning":
      return "bg-primary/10 text-primary"
    default:
      return "bg-muted text-muted-foreground"
  }
}

export function NotificationsCenter() {
  const [notifications, setNotifications] = useState(mockNotifications)
  const [activeTab, setActiveTab] = useState("all")

  const unreadCount = notifications.filter((n) => !n.read).length
  const filteredNotifications =
    activeTab === "all"
      ? notifications
      : activeTab === "unread"
        ? notifications.filter((n) => !n.read)
        : notifications.filter((n) => n.type === activeTab)

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const clearAll = () => {
    setNotifications([])
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Notifications</h1>
          <p className="text-muted-foreground mt-1">
            Stay updated with messages, alerts, and activity
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Filter</span>
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{notifications.length}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{unreadCount}</p>
                <p className="text-sm text-muted-foreground">Unread</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {notifications.filter((n) => n.priority === "high").length}
                </p>
                <p className="text-sm text-muted-foreground">High Priority</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {notifications.filter((n) => n.read).length}
                </p>
                <p className="text-sm text-muted-foreground">Read</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>All Notifications</CardTitle>
              <CardDescription>
                {unreadCount > 0
                  ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
                  : "All caught up!"}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={markAllAsRead} disabled={unreadCount === 0}>
                <Check className="mr-2 h-4 w-4" />
                Mark all read
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearAll}
                disabled={notifications.length === 0}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear all
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4 flex-wrap h-auto gap-1">
              <TabsTrigger value="all" className="gap-2">
                All
                <Badge variant="secondary" className="ml-1">
                  {notifications.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="unread" className="gap-2">
                Unread
                {unreadCount > 0 && (
                  <Badge className="ml-1 bg-primary">{unreadCount}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="weather" className="gap-2">
                <Cloud className="h-4 w-4" />
                <span className="hidden sm:inline">Weather</span>
              </TabsTrigger>
              <TabsTrigger value="message" className="gap-2">
                <MessageSquare className="h-4 w-4" />
                <span className="hidden sm:inline">Messages</span>
              </TabsTrigger>
              <TabsTrigger value="marketplace" className="gap-2">
                <ShoppingCart className="h-4 w-4" />
                <span className="hidden sm:inline">Market</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-0">
              <ScrollArea className="h-[500px] pr-4">
                {filteredNotifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Bell className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-medium">No notifications</h3>
                    <p className="text-sm text-muted-foreground">
                      {activeTab === "unread"
                        ? "You're all caught up!"
                        : "No notifications in this category"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredNotifications.map((notification, index) => (
                      <div key={notification.id}>
                        <div
                          className={`group flex gap-4 rounded-lg p-4 transition-colors hover:bg-muted/50 ${
                            !notification.read ? "bg-primary/5" : ""
                          }`}
                        >
                          {notification.avatar ? (
                            <Avatar className="h-10 w-10 shrink-0">
                              <AvatarImage src={notification.avatar} />
                              <AvatarFallback>
                                {notification.title.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                          ) : (
                            <div
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${getTypeColor(
                                notification.type
                              )}`}
                            >
                              {getIcon(notification.type)}
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <h4
                                  className={`text-sm font-medium leading-tight ${
                                    !notification.read ? "text-foreground" : "text-muted-foreground"
                                  }`}
                                >
                                  {notification.title}
                                </h4>
                                {!notification.read && (
                                  <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                                )}
                              </div>
                              {getPriorityIcon(notification.priority)}
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                              {notification.description}
                            </p>
                            <div className="mt-2 flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">
                                {notification.time}
                              </span>
                              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                {!notification.read && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => markAsRead(notification.id)}
                                    className="h-7 text-xs"
                                  >
                                    Mark read
                                  </Button>
                                )}
                                {notification.action && (
                                  <Button size="sm" className="h-7 text-xs">
                                    {notification.action.label}
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteNotification(notification.id)}
                                  className="h-7 text-xs text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                        {index < filteredNotifications.length - 1 && <Separator />}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Notification Preferences Quick Access */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Notification Preferences</CardTitle>
          <CardDescription>Customize how and when you receive notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Cloud, label: "Weather Alerts", description: "Critical weather updates", enabled: true },
              { icon: MessageSquare, label: "Messages", description: "New messages and replies", enabled: true },
              { icon: ShoppingCart, label: "Marketplace", description: "Offers and price alerts", enabled: true },
              { icon: Users, label: "Community", description: "Forum activity and mentions", enabled: false },
              { icon: BookOpen, label: "Learning", description: "New courses and progress", enabled: false },
              { icon: Bell, label: "System", description: "Account and security updates", enabled: true },
            ].map((pref) => (
              <div
                key={pref.label}
                className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
                  pref.enabled ? "bg-primary/5 border-primary/20" : "bg-muted/50"
                }`}
              >
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                    pref.enabled ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                  }`}
                >
                  <pref.icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{pref.label}</p>
                  <p className="text-xs text-muted-foreground">{pref.description}</p>
                </div>
                <div
                  className={`h-3 w-3 rounded-full ${pref.enabled ? "bg-primary" : "bg-muted-foreground/30"}`}
                />
              </div>
            ))}
          </div>
          <Button variant="outline" className="mt-4 w-full sm:w-auto">
            Manage All Preferences
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
