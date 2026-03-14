"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  User,
  Bell,
  Shield,
  Palette,
  MapPin,
  Phone,
  Mail,
  Camera,
  Save,
  Globe,
  Moon,
  Sun,
  Smartphone,
  Volume2,
  Eye,
  Lock,
  Key,
  LogOut,
  Trash2,
  HelpCircle,
  MessageSquare,
  FileText,
} from "lucide-react"

export function SettingsPanel() {
  const [theme, setTheme] = useState("light")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2">
            <Palette className="h-4 w-4" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="privacy" className="gap-2">
            <Shield className="h-4 w-4" />
            Privacy
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your profile information and farm details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Section */}
              <div className="flex flex-col items-center gap-4 sm:flex-row">
                <Avatar className="h-24 w-24">
                  <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Farmer" />
                  <AvatarFallback className="text-2xl">JD</AvatarFallback>
                </Avatar>
                <div className="text-center sm:text-left">
                  <h3 className="font-medium">Profile Photo</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    JPG, GIF or PNG. Max size 2MB.
                  </p>
                  <div className="flex gap-2 justify-center sm:justify-start">
                    <Button variant="outline" size="sm">
                      <Camera className="mr-2 h-4 w-4" />
                      Change Photo
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive">
                      Remove
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Personal Info */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" defaultValue="John" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" defaultValue="Doe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="email" defaultValue="john.doe@farm.com" className="pl-10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="phone" defaultValue="+1 (555) 123-4567" className="pl-10" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell other farmers about yourself..."
                  defaultValue="Third-generation farmer specializing in organic vegetables and sustainable practices."
                  rows={3}
                />
              </div>

              <Separator />

              {/* Farm Details */}
              <div>
                <h3 className="font-medium mb-4">Farm Details</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="farmName">Farm Name</Label>
                    <Input id="farmName" defaultValue="Green Valley Farm" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="farmSize">Farm Size</Label>
                    <Select defaultValue="medium">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small (1-10 acres)</SelectItem>
                        <SelectItem value="medium">Medium (10-100 acres)</SelectItem>
                        <SelectItem value="large">Large (100-500 acres)</SelectItem>
                        <SelectItem value="xlarge">Very Large (500+ acres)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="location">Location</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="location"
                        defaultValue="Springfield County, Illinois"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Primary Crops</Label>
                    <div className="flex flex-wrap gap-2">
                      {["Corn", "Wheat", "Soybeans", "Vegetables"].map((crop) => (
                        <Badge key={crop} variant="secondary" className="gap-1">
                          {crop}
                          <button className="ml-1 hover:text-destructive">&times;</button>
                        </Badge>
                      ))}
                      <Button variant="outline" size="sm" className="h-6">
                        + Add Crop
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button className="gap-2">
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose how and when you want to be notified
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium">Delivery Methods</h3>
                {[
                  { icon: Smartphone, label: "Push Notifications", description: "Receive notifications on your mobile device", enabled: true },
                  { icon: Mail, label: "Email Notifications", description: "Get important updates via email", enabled: true },
                  { icon: MessageSquare, label: "SMS Alerts", description: "Critical alerts via text message", enabled: false },
                ].map((method) => (
                  <div key={method.label} className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                        <method.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">{method.label}</p>
                        <p className="text-sm text-muted-foreground">{method.description}</p>
                      </div>
                    </div>
                    <Button variant={method.enabled ? "default" : "outline"} size="sm">
                      {method.enabled ? "Enabled" : "Disabled"}
                    </Button>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-medium">Notification Types</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { label: "Weather Alerts", description: "Severe weather warnings", priority: "high" },
                    { label: "Price Alerts", description: "Market price changes", priority: "medium" },
                    { label: "New Messages", description: "Direct messages from farmers", priority: "medium" },
                    { label: "Forum Replies", description: "Replies to your posts", priority: "low" },
                    { label: "New Listings", description: "Marketplace listings matching your interests", priority: "low" },
                    { label: "Course Updates", description: "New learning content available", priority: "low" },
                  ].map((type) => (
                    <div key={type.label} className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="text-sm font-medium">{type.label}</p>
                        <p className="text-xs text-muted-foreground">{type.description}</p>
                      </div>
                      <Badge variant={type.priority === "high" ? "destructive" : type.priority === "medium" ? "default" : "secondary"}>
                        {type.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-medium">Quiet Hours</h3>
                <p className="text-sm text-muted-foreground">
                  Don't send notifications during these hours (except critical alerts)
                </p>
                <div className="flex items-center gap-4">
                  <div className="space-y-2">
                    <Label>Start Time</Label>
                    <Select defaultValue="22">
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 24 }, (_, i) => (
                          <SelectItem key={i} value={i.toString()}>
                            {i.toString().padStart(2, "0")}:00
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>End Time</Label>
                    <Select defaultValue="6">
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 24 }, (_, i) => (
                          <SelectItem key={i} value={i.toString()}>
                            {i.toString().padStart(2, "0")}:00
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>
                Customize how the app looks and feels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium">Theme</h3>
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { value: "light", icon: Sun, label: "Light", description: "Light theme for daytime use" },
                    { value: "dark", icon: Moon, label: "Dark", description: "Dark theme for nighttime use" },
                    { value: "system", icon: Smartphone, label: "System", description: "Follow system preference" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setTheme(option.value)}
                      className={`flex flex-col items-center gap-2 rounded-lg border p-4 transition-colors ${
                        theme === option.value
                          ? "border-primary bg-primary/5"
                          : "hover:bg-muted/50"
                      }`}
                    >
                      <option.icon className={`h-6 w-6 ${theme === option.value ? "text-primary" : ""}`} />
                      <span className="font-medium">{option.label}</span>
                      <span className="text-xs text-muted-foreground text-center">
                        {option.description}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-medium">Language & Region</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Language</Label>
                    <Select defaultValue="en">
                      <SelectTrigger>
                        <Globe className="mr-2 h-4 w-4" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="pt">Portuguese</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Units</Label>
                    <Select defaultValue="imperial">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="imperial">Imperial (°F, acres, lbs)</SelectItem>
                        <SelectItem value="metric">Metric (°C, hectares, kg)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-medium">Accessibility</h3>
                <div className="space-y-3">
                  {[
                    { icon: Eye, label: "Large Text", description: "Increase text size for better readability" },
                    { icon: Volume2, label: "Sound Effects", description: "Play sounds for notifications and actions" },
                  ].map((option) => (
                    <div key={option.label} className="flex items-center justify-between rounded-lg border p-4">
                      <div className="flex items-center gap-3">
                        <option.icon className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{option.label}</p>
                          <p className="text-sm text-muted-foreground">{option.description}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Off</Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Privacy & Security</CardTitle>
              <CardDescription>
                Manage your account security and privacy settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium">Account Security</h3>
                {[
                  { icon: Lock, label: "Change Password", description: "Update your account password", action: "Change" },
                  { icon: Key, label: "Two-Factor Authentication", description: "Add extra security to your account", action: "Enable" },
                  { icon: Smartphone, label: "Active Sessions", description: "View and manage logged-in devices", action: "View" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                        <item.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">{item.label}</p>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">{item.action}</Button>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-medium">Privacy Settings</h3>
                {[
                  { label: "Profile Visibility", description: "Who can see your profile", value: "Farmers Only" },
                  { label: "Location Sharing", description: "Share your farm location", value: "Region Only" },
                  { label: "Activity Status", description: "Show when you're online", value: "Contacts Only" },
                ].map((setting) => (
                  <div key={setting.label} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="font-medium">{setting.label}</p>
                      <p className="text-sm text-muted-foreground">{setting.description}</p>
                    </div>
                    <Select defaultValue={setting.value.toLowerCase().replace(" ", "-")}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="everyone">Everyone</SelectItem>
                        <SelectItem value="farmers-only">Farmers Only</SelectItem>
                        <SelectItem value="contacts-only">Contacts Only</SelectItem>
                        <SelectItem value="region-only">Region Only</SelectItem>
                        <SelectItem value="nobody">Nobody</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-medium">Data & Account</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Button variant="outline" className="justify-start gap-2">
                    <FileText className="h-4 w-4" />
                    Download My Data
                  </Button>
                  <Button variant="outline" className="justify-start gap-2">
                    <HelpCircle className="h-4 w-4" />
                    Privacy Policy
                  </Button>
                </div>
                <Separator />
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start gap-2 text-amber-600 hover:text-amber-700">
                    <LogOut className="h-4 w-4" />
                    Sign Out of All Devices
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2 text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                    Delete Account
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
