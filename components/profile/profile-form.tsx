"use client";

import { useEffect, useState } from "react";
import { updateMyProfileAction } from "@/app/actions/profile";
import { SubmitButton } from "@/components/profile/SubmitButton";
import { useLanguage } from "@/lib/i18n/LanguageContext";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Briefcase,
  Calendar,
  Phone,
  MapPin,
  Linkedin,
  Github,
  Globe,
  Mail,
  FileText,
} from "lucide-react";

import { SkillsManager } from "./SkillsManager";
import { ExperienceManager } from "./ExperienceManager";
import { EducationManager } from "./EducationManager";
import { CurrentProfile } from "@/types/profile";
import { Experience, Education } from "@/types/pocketbase";

interface ProfileFormProps {
  profile: CurrentProfile;
  availabilityContent: React.ReactNode;
  initialExperiences: Experience[];
  initialEducations: Education[];
  departments: Array<{ id: string; name: string }>;
  primaryDepartment: { id: string; name: string } | null;
}

export function ProfileForm({
  profile,
  availabilityContent,
  initialExperiences,
  initialEducations,
  departments,
  primaryDepartment,
}: ProfileFormProps) {
  const { t } = useLanguage();
  const [formValues, setFormValues] = useState({
    first_name: profile.first_name ?? "",
    last_name: profile.last_name ?? "",
    title: profile.title ?? "",
    bio: profile.bio ?? "",
    phone: profile.phone ?? "",
    location: profile.location ?? "",
    linkedin_url: profile.linkedin_url ?? "",
    github_url: profile.github_url ?? "",
    portfolio_url: profile.portfolio_url ?? "",
  });
  const [departmentId, setDepartmentId] = useState<string | null>(
    primaryDepartment?.id ?? null,
  );

  useEffect(() => {
    setFormValues({
      first_name: profile.first_name ?? "",
      last_name: profile.last_name ?? "",
      title: profile.title ?? "",
      bio: profile.bio ?? "",
      phone: profile.phone ?? "",
      location: profile.location ?? "",
      linkedin_url: profile.linkedin_url ?? "",
      github_url: profile.github_url ?? "",
      portfolio_url: profile.portfolio_url ?? "",
    });
    setDepartmentId(primaryDepartment?.id ?? null);
  }, [profile.id, primaryDepartment?.id]);

  const updateField =
    (field: keyof typeof formValues) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormValues((prev) => ({ ...prev, [field]: event.target.value }));
    };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-auto p-1">
          <TabsTrigger value="basic" className="flex items-center gap-2 py-3">
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">{t.profile.tabs.basic}</span>
            <span className="sm:hidden">Basic</span>
          </TabsTrigger>
          <TabsTrigger
            value="professional"
            className="flex items-center gap-2 py-3"
          >
            <Briefcase className="w-4 h-4" />
            <span className="hidden sm:inline">
              {t.profile.tabs.professional}
            </span>
            <span className="sm:hidden">Work</span>
          </TabsTrigger>
          <TabsTrigger
            value="availability"
            className="flex items-center gap-2 py-3"
          >
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">
              {t.profile.tabs.availability}
            </span>
            <span className="sm:hidden">Hours</span>
          </TabsTrigger>
        </TabsList>

        {/* BASIC */}
        <TabsContent value="basic" className="space-y-6 mt-6">
          <form action={updateMyProfileAction} className="space-y-6">
            <Card className="border-2 hover:border-accent/30 transition-colors duration-200">
              <CardHeader className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                    <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">
                      {t.profile.basic.title}
                    </CardTitle>
                    <CardDescription>{t.profile.basic.desc}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="first_name"
                      className="flex items-center gap-2 text-sm font-medium"
                    >
                      <User className="w-4 h-4 text-muted-foreground" />
                      {t.profile.basic.firstName}
                    </Label>
                    <Input
                      id="first_name"
                      name="first_name"
                      value={formValues.first_name}
                      onChange={updateField("first_name")}
                      required
                      className="h-11"
                      placeholder="John"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="last_name"
                      className="flex items-center gap-2 text-sm font-medium"
                    >
                      <User className="w-4 h-4 text-muted-foreground" />
                      {t.profile.basic.lastName}
                    </Label>
                    <Input
                      id="last_name"
                      name="last_name"
                      value={formValues.last_name}
                      onChange={updateField("last_name")}
                      required
                      className="h-11"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="title"
                    className="flex items-center gap-2 text-sm font-medium"
                  >
                    <Briefcase className="w-4 h-4 text-muted-foreground" />
                    {t.profile.basic.jobTitle}
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="e.g., Senior Software Engineer"
                    value={formValues.title}
                    onChange={updateField("title")}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="department_id"
                    className="flex items-center gap-2 text-sm font-medium"
                  >
                    <Briefcase className="w-4 h-4 text-muted-foreground" />
                    {t.profile.basic.department}
                  </Label>
                  <input
                    type="hidden"
                    name="department_id"
                    value={departmentId ?? ""}
                  />
                  <Select
                    value={departmentId ?? "none"}
                    onValueChange={(value) =>
                      setDepartmentId(value === "none" ? null : value)
                    }
                  >
                    <SelectTrigger className="w-full h-11">
                      <SelectValue
                        placeholder={t.profile.basic.departmentPlaceholder}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">
                        {t.profile.basic.departmentNone}
                      </SelectItem>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="bio"
                    className="flex items-center gap-2 text-sm font-medium"
                  >
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    {t.profile.basic.bio}
                  </Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    placeholder={t.profile.basic.bioPlaceholder}
                    value={formValues.bio}
                    onChange={updateField("bio")}
                    rows={5}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    {t.profile.basic.bioHint}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-accent/30 transition-colors duration-200">
              <CardHeader className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/20">
                    <Mail className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">
                      {t.profile.contact.title}
                    </CardTitle>
                    <CardDescription>{t.profile.contact.desc}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="phone"
                      className="flex items-center gap-2 text-sm font-medium"
                    >
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      {t.profile.contact.phone}
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="95323456"
                      value={formValues.phone}
                      onChange={updateField("phone")}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="location"
                      className="flex items-center gap-2 text-sm font-medium"
                    >
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      {t.profile.contact.location}
                    </Label>
                    <Input
                      id="location"
                      name="location"
                      placeholder="Trondheim, Norway"
                      value={formValues.location}
                      onChange={updateField("location")}
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="linkedin_url"
                      className="flex items-center gap-2 text-sm font-medium"
                    >
                      <Linkedin className="w-4 h-4 text-muted-foreground" />
                      {t.profile.contact.linkedin}
                    </Label>
                    <Input
                      id="linkedin_url"
                      name="linkedin_url"
                      type="url"
                      placeholder="https://linkedin.com/in/yourprofile"
                      value={formValues.linkedin_url}
                      onChange={updateField("linkedin_url")}
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="github_url"
                      className="flex items-center gap-2 text-sm font-medium"
                    >
                      <Github className="w-4 h-4 text-muted-foreground" />
                      {t.profile.contact.github}
                    </Label>
                    <Input
                      id="github_url"
                      name="github_url"
                      type="url"
                      placeholder="https://github.com/yourusername"
                      value={formValues.github_url}
                      onChange={updateField("github_url")}
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="portfolio_url"
                      className="flex items-center gap-2 text-sm font-medium"
                    >
                      <Globe className="w-4 h-4 text-muted-foreground" />
                      {t.profile.contact.portfolio}
                    </Label>
                    <Input
                      id="portfolio_url"
                      name="portfolio_url"
                      type="url"
                      placeholder="https://yourportfolio.com"
                      value={formValues.portfolio_url}
                      onChange={updateField("portfolio_url")}
                      className="h-11"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <SubmitButton>{t.common.save}</SubmitButton>
            </div>
          </form>
        </TabsContent>

        {/* PROFESSIONAL */}
        <TabsContent value="professional" className="space-y-6 mt-6">
          <Card className="border-2">
            <CardHeader className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                  <Briefcase className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <CardTitle className="text-xl">
                    {t.profile.professional.title}
                  </CardTitle>
                  <CardDescription>
                    {t.profile.professional.desc}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <div className="w-1 h-6 bg-accent rounded-full" />
                  <h3 className="text-lg font-semibold">
                    {t.profile.professional.skills}
                  </h3>
                </div>
                <SkillsManager profileId={profile.id} />
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <div className="w-1 h-6 bg-accent rounded-full" />
                  <h3 className="text-lg font-semibold">
                    {t.profile.professional.workExperience}
                  </h3>
                </div>
                <ExperienceManager
                  profileId={profile.id}
                  initialExperiences={initialExperiences}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <div className="w-1 h-6 bg-accent rounded-full" />
                  <h3 className="text-lg font-semibold">
                    {t.profile.professional.education}
                  </h3>
                </div>
                <EducationManager
                  profileId={profile.id}
                  initialEducations={initialEducations}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AVAILABILITY */}
        <TabsContent value="availability" className="space-y-6 mt-6">
          {availabilityContent}
        </TabsContent>
      </Tabs>
    </div>
  );
}
