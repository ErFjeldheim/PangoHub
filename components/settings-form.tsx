"use client";

import type React from "react";
import { useState } from "react";
import { createClient } from "@/lib/pocketbase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useTheme } from "next-themes";
import { Globe, Moon, Sun } from "lucide-react";

type SettingsProfile = {
  email: string;
  role: "admin" | "consultant";
};

interface SettingsFormProps {
  profile: SettingsProfile;
}

export function SettingsForm({ profile }: SettingsFormProps) {
  const [email, setEmail] = useState(profile.email || "");
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const pb = createClient();
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();

  const handleEmailUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await pb.collection("users").requestEmailChange(email);

      toast.success(t.settings.messages.emailRequested, {
        description: t.settings.messages.emailRequestedDesc,
      });
    } catch (err) {
      const error = err as Error;
      toast.error("Error", {
        description: error.message || "Failed to update email",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    setIsLoading(true);

    try {
      await pb.collection("users").requestPasswordReset(profile.email);

      toast.success(t.settings.messages.passwordResetSent, {
        description: t.settings.messages.passwordResetDesc,
      });
    } catch (err) {
      const error = err as Error;
      toast.error("Error", {
        description: error.message || "Failed to send password reset",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (
      !confirm(
        t.settings.confirmDelete
      )
    ) {
      return;
    }

    setIsDeleting(true);

    try {
      if (pb.authStore.record) {
          await pb.collection("users").delete(pb.authStore.record.id);
          pb.authStore.clear();
          document.cookie = "pb_auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          router.push("/auth/login");
      }

      toast.success(t.settings.messages.accountDeleted);
    } catch (err) {
      const error = err as Error;
      toast.error("Error", {
        description: error.message || "Failed to delete account",
      });
    } finally {

      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t.settings.theme}</CardTitle>
            <CardDescription>{t.settings.themeSubtitle}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button
              variant={theme === "light" ? "default" : "outline"}
              size="sm"
              onClick={() => setTheme("light")}
              className="gap-2"
            >
              <Sun className="h-4 w-4" />
              Light
            </Button>
            <Button
              variant={theme === "dark" ? "default" : "outline"}
              size="sm"
              onClick={() => setTheme("dark")}
              className="gap-2"
            >
              <Moon className="h-4 w-4" />
              Dark
            </Button>
            <Button
              variant={theme === "system" ? "default" : "outline"}
              size="sm"
              onClick={() => setTheme("system")}
            >
              System
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t.settings.language}</CardTitle>
            <CardDescription>{t.settings.languageSubtitle}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button
              variant={language === "nb" ? "default" : "outline"}
              size="sm"
              onClick={() => setLanguage("nb")}
              className="gap-2"
            >
              <Globe className="h-4 w-4" />
              Norsk
            </Button>
            <Button
              variant={language === "en" ? "default" : "outline"}
              size="sm"
              onClick={() => setLanguage("en")}
              className="gap-2"
            >
              <Globe className="h-4 w-4" />
              English
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t.settings.account}</CardTitle>
          <CardDescription>
            {t.settings.accountSubtitle}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleEmailUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t.settings.email}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t.common.saving : t.settings.updateEmail}
            </Button>
          </form>

          <div className="pt-4 border-t">
            <Button
              variant="outline"
              onClick={handlePasswordReset}
              disabled={isLoading}
            >
              {t.settings.resetPassword}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t.settings.role}</CardTitle>
          <CardDescription>{t.settings.roleSubtitle}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{t.settings.currentRole}</span>
              <span className="text-sm capitalize bg-primary/10 text-primary px-2 py-1 rounded">
                {profile.role === "admin" ? t.nav.admin : t.nav.member}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              {profile.role === "admin"
                ? t.settings.adminDesc
                : t.settings.memberDesc}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="text-destructive">{t.settings.dangerZone}</CardTitle>
          <CardDescription>
            {t.settings.dangerZoneSubtitle}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={handleDeleteAccount}
            disabled={isDeleting}
          >
            {isDeleting ? t.common.loading : t.settings.deleteAccount}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
