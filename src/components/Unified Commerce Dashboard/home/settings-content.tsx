// File: components/dashboard/settings-content.tsx
"use client";

import React, { useState } from "react";
import {
  User,
  Mail,
  Lock,
  Bell,
  CreditCard,
  Sun,
  Moon,
  ShieldCheck,
  KeyRound,
  Users,
  Building,
  LogOut,
  Trash2,
  UploadCloud,
  Eye,
  EyeOff,
  Copy,
  Activity,
  Palette,
  FileText,
  Save,
  RotateCcw,
	CheckCircle,
	Plus, // For Reset
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"; // Assuming shadcn/ui Card component
import { Button } from "@/components/ui/button"; // Assuming shadcn/ui Button
import { Input } from "@/components/ui/input"; // Assuming shadcn/ui Input
import { Label } from "@/components/ui/label"; // Assuming shadcn/ui Label
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Assuming shadcn/ui Avatar
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Assuming shadcn/ui Tabs
import { Switch } from "@/components/ui/switch"; // Assuming shadcn/ui Switch
import { Separator } from "@/components/ui/separator"; // Assuming shadcn/ui Separator
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"; // Assuming shadcn/ui Tooltip
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"; // Assuming shadcn/ui Table
import { Badge } from "@/components/ui/badge"; // Assuming shadcn/ui Badge
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog" // Assuming shadcn/ui Alert Dialog


// --- Mock Data & Types ---

interface UserProfile {
  name: string;
  email: string;
  avatarUrl: string | null; // URL or null
  role: string;
  lastLogin: string; // ISO Date string
}

interface NotificationPreferences {
  email: {
    systemAlerts: boolean;
    aiRecommendations: boolean;
    marketingUpdates: boolean;
    weeklySummary: boolean;
  };
  inApp: {
    systemAlerts: boolean;
    aiRecommendations: boolean;
    newFeatures: boolean;
  };
}

interface SecuritySettings {
  twoFactorEnabled: boolean;
  passwordLastUpdated: string; // ISO Date string
}

interface ApiKey {
    id: string;
    name: string;
    keyPrefix: string; // e.g., sk_live_...
    createdDate: string; // ISO Date string
    lastUsedDate: string | null; // ISO Date string or null
    permissions: string[]; // e.g., ['read:orders', 'write:products']
}

interface Invoice {
    id: string;
    date: string; // ISO Date string
    amount: number;
    status: 'Paid' | 'Pending' | 'Overdue';
    pdfUrl: string; // Link to download PDF
}

// --- Mock Data Initialization ---
const mockUserProfile: UserProfile = {
  name: "Sarah Johnson",
  email: "sarah.j@fashionco.com",
  avatarUrl: "/placeholder-avatar.png", // Replace with actual or remove for fallback
  role: "FashionCo Admin",
  lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
};

const mockNotificationPreferences: NotificationPreferences = {
  email: {
    systemAlerts: true,
    aiRecommendations: true,
    marketingUpdates: false,
    weeklySummary: true,
  },
  inApp: {
    systemAlerts: true,
    aiRecommendations: false,
    newFeatures: true,
  },
};

const mockSecuritySettings: SecuritySettings = {
    twoFactorEnabled: true,
    passwordLastUpdated: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(), // 35 days ago
}

const mockApiKeys: ApiKey[] = [
    {
        id: 'key-1',
        name: 'Primary Backend Key',
        keyPrefix: 'sk_live_aBcDeF...',
        createdDate: '2024-02-10T10:00:00Z',
        lastUsedDate: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
        permissions: ['read:all', 'write:orders', 'write:products']
    },
    {
        id: 'key-2',
        name: 'Reporting Tool Key',
        keyPrefix: 'rk_live_xYzAbC...',
        createdDate: '2024-03-01T15:30:00Z',
        lastUsedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        permissions: ['read:orders', 'read:customers', 'read:analytics']
    },
     {
        id: 'key-3',
        name: 'Test Key (Inactive)',
        keyPrefix: 'sk_test_lMnOpQ...',
        createdDate: '2023-11-15T09:00:00Z',
        lastUsedDate: null,
        permissions: ['read:all']
    }
];

const mockInvoices: Invoice[] = [
    { id: 'inv-003', date: '2025-03-01T00:00:00Z', amount: 99.00, status: 'Paid', pdfUrl: '#' },
    { id: 'inv-002', date: '2025-02-01T00:00:00Z', amount: 99.00, status: 'Paid', pdfUrl: '#' },
    { id: 'inv-001', date: '2025-01-01T00:00:00Z', amount: 99.00, status: 'Paid', pdfUrl: '#' },
];


// --- Component ---

const SettingsContent: React.FC = () => {
  // State for editable fields (initialize with mock data)
  const [profileName, setProfileName] = useState(mockUserProfile.name);
  const [profileEmail, setProfileEmail] = useState(mockUserProfile.email);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [notificationPrefs, setNotificationPrefs] = useState(mockNotificationPreferences);
  const [securitySettings, setSecuritySettings] = useState(mockSecuritySettings);
  const [theme, setTheme] = useState<'light' | 'dark'>('light'); // Default or from user preference

  // Handlers
  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Updating profile:", { name: profileName, email: profileEmail });
    // Add actual API call here
    // Show success/error toast notification
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("New passwords do not match!"); // Replace with better UI feedback
      return;
    }
    if (newPassword.length < 8) {
        alert("New password must be at least 8 characters long."); // Replace with better UI feedback
        return;
    }
    console.log("Changing password...");
    // Add actual API call here (send currentPassword and newPassword)
    // Clear fields on success, show success/error toast
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleNotificationChange = (
    type: "email" | "inApp",
    key: keyof NotificationPreferences["email"] | keyof NotificationPreferences["inApp"]
  ) => {
    setNotificationPrefs((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [key]: !prev[type][key as keyof typeof prev[]], // Type assertion needed here
      },
    }));
    // Consider debouncing or adding a save button for notification changes
    console.log("Notification preferences updated");
     // Add actual API call here
  };

   const handleThemeChange = (isDark: boolean) => {
    const newTheme = isDark ? 'dark' : 'light';
    setTheme(newTheme);
    // Apply theme change globally (e.g., by adding/removing class on body or html)
    document.documentElement.classList.toggle('dark', isDark);
    console.log("Theme changed to:", newTheme);
    // Save preference to localStorage or backend
  };

   const handleToggle2FA = (enabled: boolean) => {
        setSecuritySettings(prev => ({...prev, twoFactorEnabled: enabled}));
        console.log(`2FA ${enabled ? 'Enabled' : 'Disabled'}`);
        // Trigger 2FA setup flow if enabling, or confirmation if disabling
        // Add actual API call here
   }

   const handleGenerateApiKey = () => {
       console.log("Generating new API key...");
       // Show modal to name the key and set permissions
       // Add actual API call here
       // Update the mockApiKeys state (or refetch)
   }

   const handleRevokeApiKey = (keyId: string) => {
        console.log(`Revoking API key: ${keyId}`);
        // Add actual API call here
        // Update the mockApiKeys state (or refetch)
   }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings, preferences, and security.
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList>
            <TabsTrigger value="profile">
              <User className="mr-2 h-4 w-4" /> Profile
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="mr-2 h-4 w-4" /> Notifications
            </TabsTrigger>
            <TabsTrigger value="security">
              <ShieldCheck className="mr-2 h-4 w-4" /> Security
            </TabsTrigger>
             <TabsTrigger value="appearance">
              <Palette className="mr-2 h-4 w-4" /> Appearance
            </TabsTrigger>
            {/* Optional Tabs */}
             <TabsTrigger value="billing">
              <CreditCard className="mr-2 h-4 w-4" /> Billing
            </TabsTrigger>
             <TabsTrigger value="api">
              <KeyRound className="mr-2 h-4 w-4" /> API Keys
            </TabsTrigger>
            {/* <TabsTrigger value="account"><Building className="mr-2 h-4 w-4" /> Account</TabsTrigger> */}
          </TabsList>

          {/* --- Profile Tab --- */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal details.</CardDescription>
              </CardHeader>
              <form onSubmit={handleProfileUpdate}>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={mockUserProfile.avatarUrl || undefined} alt={profileName} />
                      <AvatarFallback>{profileName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <Label htmlFor="avatar-upload" className="cursor-pointer">
                        <Button type="button" variant="outline" size="sm">
                          <UploadCloud className="mr-2 h-4 w-4" />
                          Change Avatar
                        </Button>
                      </Label>
                      <Input id="avatar-upload" type="file" className="hidden" accept="image/*" />
                      <p className="text-xs text-muted-foreground">JPG, PNG, GIF up to 5MB.</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileEmail}
                        onChange={(e) => setProfileEmail(e.target.value)}
                        required
                      />
                    </div>
                     <div className="space-y-2">
                      <Label>Role</Label>
                      <Input value={mockUserProfile.role} disabled readOnly />
                    </div>
                     <div className="space-y-2">
                      <Label>Last Login</Label>
                      <Input value={new Date(mockUserProfile.lastLogin).toLocaleString()} disabled readOnly />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <Button type="submit">
                    <Save className="mr-2 h-4 w-4" /> Update Profile
                  </Button>
                </CardFooter>
              </form>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>
                  Update your password regularly for better security. Last updated {new Date(mockSecuritySettings.passwordLastUpdated).toLocaleDateString()}.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handlePasswordChange}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <div className="relative">
                       <Input
                         id="current-password"
                         type={showCurrentPassword ? "text" : "password"}
                         value={currentPassword}
                         onChange={(e) => setCurrentPassword(e.target.value)}
                         required
                       />
                       <Button
                         type="button"
                         variant="ghost"
                         size="icon"
                         className="absolute right-1 top-1 h-7 w-7"
                         onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                       >
                         {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                         <span className="sr-only">{showCurrentPassword ? 'Hide' : 'Show'} password</span>
                       </Button>
                    </div>

                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <div className="relative">
                        <Input
                          id="new-password"
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          minLength={8}
                          required
                        />
                        <Button
                         type="button"
                         variant="ghost"
                         size="icon"
                         className="absolute right-1 top-1 h-7 w-7"
                         onClick={() => setShowNewPassword(!showNewPassword)}
                       >
                         {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                       </Button>
                       </div>
                       <p className="text-xs text-muted-foreground">Minimum 8 characters.</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                       <div className="relative">
                        <Input
                          id="confirm-password"
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          minLength={8}
                          required
                        />
                         <Button
                         type="button"
                         variant="ghost"
                         size="icon"
                         className="absolute right-1 top-1 h-7 w-7"
                         onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                       >
                         {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                       </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <Button type="submit">
                    <Lock className="mr-2 h-4 w-4" /> Change Password
                  </Button>
                </CardFooter>
              </form>
            </Card>
             <Card className="border-destructive">
                <CardHeader>
                    <CardTitle className="text-destructive">Danger Zone</CardTitle>
                    <CardDescription>Proceed with caution. These actions are irreversible.</CardDescription>
                </CardHeader>
                 <CardContent>
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button variant="breadcrumb">
                                <Trash2 className="mr-2 h-4 w-4" /> Delete Account
                           </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete your
                                account and remove your data from our servers.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() => console.log('Account Deletion Initiated')}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                Yes, Delete My Account
                            </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                     </AlertDialog>
                </CardContent>
             </Card>
          </TabsContent>

          {/* --- Notifications Tab --- */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Choose how you want to be notified about activities and updates.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Email Notifications */}
                <div>
                  <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                    <Mail className="h-5 w-5" /> Email Notifications
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div>
                        <Label htmlFor="email-system" className="font-medium">System Alerts</Label>
                        <p className="text-sm text-muted-foreground">Critical system messages and security alerts.</p>
                      </div>
                      <Switch
                        id="email-system"
                        checked={notificationPrefs.email.systemAlerts}
                        onCheckedChange={() => handleNotificationChange("email", "systemAlerts")}
                      />
                    </div>
                     <div className="flex items-center justify-between rounded-lg border p-4">
                      <div>
                        <Label htmlFor="email-ai" className="font-medium">AI Recommendations</Label>
                        <p className="text-sm text-muted-foreground">Notifications about new AI-driven insights.</p>
                      </div>
                      <Switch
                        id="email-ai"
                        checked={notificationPrefs.email.aiRecommendations}
                        onCheckedChange={() => handleNotificationChange("email", "aiRecommendations")}
                      />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div>
                        <Label htmlFor="email-marketing" className="font-medium">Marketing Updates</Label>
                        <p className="text-sm text-muted-foreground">News, tips, and promotional offers.</p>
                      </div>
                      <Switch
                        id="email-marketing"
                        checked={notificationPrefs.email.marketingUpdates}
                        onCheckedChange={() => handleNotificationChange("email", "marketingUpdates")}
                      />
                    </div>
                     <div className="flex items-center justify-between rounded-lg border p-4">
                      <div>
                        <Label htmlFor="email-summary" className="font-medium">Weekly Summary</Label>
                        <p className="text-sm text-muted-foreground">A digest of your account activity and performance.</p>
                      </div>
                      <Switch
                        id="email-summary"
                        checked={notificationPrefs.email.weeklySummary}
                        onCheckedChange={() => handleNotificationChange("email", "weeklySummary")}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* In-App Notifications */}
                <div>
                  <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                    <Bell className="h-5 w-5" /> In-App Notifications
                  </h3>
                   <div className="space-y-3">
                     <div className="flex items-center justify-between rounded-lg border p-4">
                      <div>
                        <Label htmlFor="inapp-system" className="font-medium">System Alerts</Label>
                        <p className="text-sm text-muted-foreground">Important alerts shown within the application.</p>
                      </div>
                      <Switch
                        id="inapp-system"
                        checked={notificationPrefs.inApp.systemAlerts}
                        onCheckedChange={() => handleNotificationChange("inApp", "systemAlerts")}
                      />
                    </div>
                     <div className="flex items-center justify-between rounded-lg border p-4">
                      <div>
                        <Label htmlFor="inapp-ai" className="font-medium">AI Recommendations</Label>
                        <p className="text-sm text-muted-foreground">Notifications for new insights inside the dashboard.</p>
                      </div>
                      <Switch
                        id="inapp-ai"
                        checked={notificationPrefs.inApp.aiRecommendations}
                        onCheckedChange={() => handleNotificationChange("inApp", "aiRecommendations")}
                      />
                    </div>
                     <div className="flex items-center justify-between rounded-lg border p-4">
                      <div>
                        <Label htmlFor="inapp-features" className="font-medium">New Features</Label>
                        <p className="text-sm text-muted-foreground">Updates about new platform capabilities.</p>
                      </div>
                      <Switch
                        id="inapp-features"
                        checked={notificationPrefs.inApp.newFeatures}
                        onCheckedChange={() => handleNotificationChange("inApp", "newFeatures")}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
               <CardFooter className="border-t pt-4">
                    <Button variant="outline">
                         <RotateCcw className="mr-2 h-4 w-4" /> Reset to Defaults
                    </Button>
                    {/* Or add a Save button if changes aren't immediate */}
               </CardFooter>
            </Card>
          </TabsContent>

          {/* --- Security Tab --- */}
          <TabsContent value="security" className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                    <CardDescription>Manage your account security options.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Two-Factor Authentication */}
                    <div className="flex items-start justify-between rounded-lg border p-4">
                        <div>
                            <Label htmlFor="two-factor" className="text-base font-medium">Two-Factor Authentication (2FA)</Label>
                            <p className="text-sm text-muted-foreground mt-1">
                                Enhance your account security by requiring a second verification step upon login.
                            </p>
                            {securitySettings.twoFactorEnabled && (
                                <p className="text-sm text-green-600 mt-2 font-medium flex items-center gap-1"><ShieldCheck className="h-4 w-4"/> 2FA is currently enabled.</p>
                            )}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                             <Switch
                                id="two-factor"
                                checked={securitySettings.twoFactorEnabled}
                                onCheckedChange={handleToggle2FA}
                            />
                            {securitySettings.twoFactorEnabled && (
                                <Button variant="outline" size="sm">Manage 2FA Devices</Button>
                            )}
                        </div>

                    </div>

                    {/* Connected Devices / Sessions (Placeholder) */}
                    <div className="rounded-lg border p-4">
                        <Label className="text-base font-medium">Active Sessions</Label>
                        <p className="text-sm text-muted-foreground mt-1 mb-3">
                            Devices currently logged into your account. Log out from sessions you don't recognize.
                        </p>
                        {/* Mock Session List */}
                        <div className="space-y-2 text-sm">
                           <div className="flex justify-between items-center">
                                <div>
                                    <span className="font-medium">Chrome on macOS</span> - Current Session
                                    <p className="text-xs text-muted-foreground">New York, USA (Approx.)</p>
                                </div>
                                <Badge variant="default">Active</Badge>
                           </div>
                            <div className="flex justify-between items-center">
                                <div>
                                    <span className="font-medium">Safari on iPhone</span>
                                    <p className="text-xs text-muted-foreground">Los Angeles, USA (Approx.) - 1 day ago</p>
                                </div>
                                <Button variant="ghost" size="sm">Log Out</Button>
                           </div>
                        </div>
                         <Button variant="outline" size="sm" className="mt-4">Log Out All Other Sessions</Button>
                    </div>

                    {/* Security Activity Log (Placeholder) */}
                     <div className="rounded-lg border p-4">
                        <Label className="text-base font-medium">Recent Security Activity</Label>
                        <p className="text-sm text-muted-foreground mt-1 mb-3">
                            Log of significant security-related events on your account.
                        </p>
                         <Table>
                            <TableHeader>
                                <TableRow>
                                <TableHead>Event</TableHead>
                                <TableHead>Device/Location</TableHead>
                                <TableHead>Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell>Password Changed</TableCell>
                                    <TableCell>Chrome on macOS (Current)</TableCell>
                                    <TableCell>{new Date(mockSecuritySettings.passwordLastUpdated).toLocaleString()}</TableCell>
                                </TableRow>
                                 <TableRow>
                                    <TableCell>2FA Enabled</TableCell>
                                    <TableCell>Chrome on macOS (Current)</TableCell>
                                    <TableCell>{new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toLocaleString()}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Successful Login</TableCell>
                                    <TableCell>Safari on iPhone (Los Angeles)</TableCell>
                                    <TableCell>{new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toLocaleString()}</TableCell>
                                </TableRow>
                            </TableBody>
                         </Table>
                          <Button variant="link" size="sm" className="mt-2 p-0 h-auto">View Full Activity Log</Button>
                    </div>
                </CardContent>
            </Card>
          </TabsContent>

           {/* --- Appearance Tab --- */}
          <TabsContent value="appearance" className="space-y-6">
             <Card>
                <CardHeader>
                    <CardTitle>Appearance</CardTitle>
                    <CardDescription>Customize the look and feel of the application.</CardDescription>
                </CardHeader>
                <CardContent>
                     <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="flex items-center gap-4">
                           {theme === 'light' ? <Sun className="h-6 w-6 text-orange-500"/> : <Moon className="h-6 w-6 text-indigo-400" />}
                           <div>
                                <Label htmlFor="theme-switch" className="text-base font-medium">Theme</Label>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Choose between light and dark mode.
                                </p>
                           </div>
                        </div>
                         <div className="flex items-center space-x-2">
                            <Sun className="h-4 w-4"/>
                            <Switch
                                id="theme-switch"
                                checked={theme === 'dark'}
                                onCheckedChange={handleThemeChange}
                            />
                            <Moon className="h-4 w-4"/>
                        </div>
                    </div>
                    {/* Add other appearance settings here if needed (e.g., font size, density) */}
                </CardContent>
             </Card>
          </TabsContent>

            {/* --- Billing Tab --- */}
          <TabsContent value="billing" className="space-y-6">
             <Card>
                <CardHeader>
                    <CardTitle>Subscription Plan</CardTitle>
                    <CardDescription>Manage your current subscription and billing details.</CardDescription>
                </CardHeader>
                 <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-4">
                        <div className="rounded-lg border p-4 bg-muted/40">
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="font-semibold">Current Plan: Pro</h4>
                                <Badge variant="default">Active</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                                Billed monthly at $99.00. Next billing date: April 1, 2025.
                            </p>
                             <div className="space-y-1 text-sm">
                                <p className="flex items-center gap-1"><CheckCircle className="h-4 w-4 text-green-600"/> Unlimited Products</p>
                                <p className="flex items-center gap-1"><CheckCircle className="h-4 w-4 text-green-600"/> Advanced Analytics</p>
                                <p className="flex items-center gap-1"><CheckCircle className="h-4 w-4 text-green-600"/> AI Recommendations</p>
                                <p className="flex items-center gap-1"><CheckCircle className="h-4 w-4 text-green-600"/> Priority Support</p>
                             </div>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline">Change Plan</Button>
                            <Button variant="breadcrumb">Cancel Subscription</Button>
                        </div>
                    </div>
                     <div className="space-y-4">
                         <h4 className="font-semibold">Payment Method</h4>
                        <div className="rounded-lg border p-4 flex items-center justify-between">
                             <div className="flex items-center gap-2">
                                 <CreditCard className="h-5 w-5"/>
                                 <span>Visa ending in 4242</span>
                             </div>
                             <Button variant="link" size="sm" className="p-0 h-auto">Update</Button>
                        </div>
                     </div>
                 </CardContent>
             </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Billing History</CardTitle>
                    <CardDescription>View and download your past invoices.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead>Invoice ID</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Download</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockInvoices.map(invoice => (
                                <TableRow key={invoice.id}>
                                    <TableCell>{invoice.id}</TableCell>
                                    <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                                    <TableCell>${invoice.amount.toFixed(2)}</TableCell>
                                    <TableCell>
                                        <Badge variant={invoice.status === 'Paid' ? 'default' : 'secondary'}>{invoice.status}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="outline" size="icon" asChild>
                                            <a href={invoice.pdfUrl} target="_blank" rel="noopener noreferrer">
                                                <FileText className="h-4 w-4" />
                                                <span className="sr-only">Download Invoice</span>
                                            </a>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                     </Table>
                </CardContent>
             </Card>
          </TabsContent>

           {/* --- API Keys Tab --- */}
           <TabsContent value="api" className="space-y-6">
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>API Keys</CardTitle>
                                <CardDescription>Manage API keys for accessing your data programmatically.</CardDescription>
                            </div>
                             <Button onClick={handleGenerateApiKey}>
                                <Plus className="mr-2 h-4 w-4" /> Create New API Key
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                         <Table>
                            <TableHeader>
                                <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Key Prefix</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead>Last Used</TableHead>
                                <TableHead>Permissions</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mockApiKeys.length > 0 ? mockApiKeys.map(key => (
                                    <TableRow key={key.id}>
                                        <TableCell className="font-medium">{key.name}</TableCell>
                                        <TableCell>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <span className="font-mono text-xs cursor-pointer flex items-center gap-1">
                                                        {key.keyPrefix}
                                                        <Copy className="h-3 w-3 text-muted-foreground"/>
                                                    </span>
                                                </TooltipTrigger>
                                                <TooltipContent>Copy Prefix</TooltipContent>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell>{new Date(key.createdDate).toLocaleDateString()}</TableCell>
                                        <TableCell>{key.lastUsedDate ? new Date(key.lastUsedDate).toLocaleString() : 'Never'}</TableCell>
                                        <TableCell>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                <div className="flex flex-wrap gap-1 max-w-[150px]">
                                                    {key.permissions.slice(0, 2).map(p => <Badge key={p} variant="secondary" className="text-xs">{p}</Badge>)}
                                                    {key.permissions.length > 2 && <Badge variant="secondary" className="text-xs">+{key.permissions.length-2}</Badge>}
                                                </div>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <ul className="list-disc list-inside text-xs">
                                                        {key.permissions.map(p => <li key={p}>{p}</li>)}
                                                    </ul>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell className="text-right">
                                             <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                     <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive">
                                                        <Trash2 className="h-4 w-4"/>
                                                     </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                    <AlertDialogTitle>Revoke API Key "{key.name}"?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone. Any applications using this key will no longer be able to access your data.
                                                    </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => handleRevokeApiKey(key.id)}
                                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                                        Yes, Revoke Key
                                                    </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                             </AlertDialog>

                                        </TableCell>
                                    </TableRow>
                                )) : (
                                     <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                        No API keys created yet.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                         </Table>
                    </CardContent>
                    <CardFooter className="border-t pt-4">
                         <p className="text-sm text-muted-foreground">
                           Need help with the API? <a href="#" className="text-primary underline">View API Documentation</a>.
                        </p>
                    </CardFooter>
                </Card>
           </TabsContent>

        </Tabs>
      </div>
    </TooltipProvider>
  );
};

export default SettingsContent;