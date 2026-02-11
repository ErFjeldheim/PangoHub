"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Plus, Sparkles, TrendingUp, Award } from "lucide-react";

import {
  getAllSkills,
  getProfileSkills,
  findSkillByName,
  addProfileSkill,
  createSkill,
  removeProfileSkill as saRemoveProfileSkill,
  updateProfileSkillProficiency as saUpdateProficiency,
  type Skill,
  type ProfileSkill,
} from "@/app/actions/skills";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface SkillsManagerProps {
  profileId: string;
}

export function SkillsManager({ profileId }: SkillsManagerProps) {
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [profileSkills, setProfileSkills] = useState<ProfileSkill[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useLanguage();

  const [isPending, startTransition] = useTransition();
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const skillsByLowerName = useMemo(() => {
    const map = new Map<string, Skill>();
    for (const s of allSkills) map.set(s.name.toLowerCase(), s);
    return map;
  }, [allSkills]);

  useEffect(() => {
    setIsLoading(true);
    startTransition(async () => {
      try {
        const [skills, pskills] = await Promise.all([
          getAllSkills(),
          getProfileSkills(profileId),
        ]);
        setAllSkills(skills);
        setProfileSkills(pskills);
      } finally {
        setIsLoading(false);
      }
    });
  }, [profileId]);

  const filteredSkills = useMemo(() => {
    const q = newSkill.trim().toLowerCase();
    if (!q) return [];
    const selected = new Set(profileSkills.map((ps) => ps.skill_id));
    return allSkills
      .filter((s) => s.name.toLowerCase().includes(q) && !selected.has(s.id))
      .slice(0, 8);
  }, [newSkill, allSkills, profileSkills]);

  const attachExistingSkill = async (skill: Skill) => {
    setInputError(null);
    setAdding(true);
    try {
      if (profileSkills.some((ps) => ps.skill_id === skill.id)) {
        setNewSkill("");
        return;
      }
      const added = await addProfileSkill({
        profileId,
        skillId: skill.id,
        proficiency: 3,
      });
      setProfileSkills((prev) => [...prev, added]);
      setNewSkill("");
    } catch (e) {
      console.error(e);
      setInputError("Could not add skill.");
    } finally {
      setAdding(false);
    }
  };

  const addSkill = async () => {
    const raw = newSkill.trim();
    if (!raw) return;

    setInputError(null);
    setAdding(true);
    try {
      let skill = skillsByLowerName.get(raw.toLowerCase());
      if (!skill) {
        const found = await findSkillByName(raw);
        skill = found ?? undefined;
      }
      if (!skill) {
        setInputError(`No existing skill named "${raw}".`);
        return;
      }

      if (profileSkills.some((ps) => ps.skill_id === skill!.id)) {
        setNewSkill("");
        return;
      }

      const added = await addProfileSkill({
        profileId,
        skillId: skill.id,
        proficiency: 3,
      });

      setProfileSkills((prev) => [...prev, added]);
      setNewSkill("");
    } catch (e) {
      console.error(e);
      setInputError("Could not add skill.");
    } finally {
      setAdding(false);
    }
  };

  const createAndAttach = async () => {
    const raw = newSkill.trim();
    if (!raw) return;
    setInputError(null);
    setCreating(true);
    try {
      const existing = await findSkillByName(raw);
      const skill = existing ?? (await createSkill(raw));

      if (!profileSkills.some((ps) => ps.skill_id === skill.id)) {
        const added = await addProfileSkill({
          profileId,
          skillId: skill.id,
          proficiency: 3,
        });
        setProfileSkills((prev) => [...prev, added]);
      }
      setNewSkill("");
    } catch (error: unknown) {
      const message =
        error instanceof Error && error.message.includes("duplicate")
          ? "Skill already exists."
          : "Could not create skill.";
      setInputError(message);
      console.error(error);
    } finally {
      setCreating(false);
    }
  };

  const removeSkill = async (skillId: string) => {
    setRemoving(skillId);
    try {
      await saRemoveProfileSkill({ profileId, skillId });
      setProfileSkills((prev) => prev.filter((ps) => ps.skill_id !== skillId));
    } catch (e) {
      console.error(e);
    } finally {
      setRemoving(null);
    }
  };

  const updateProficiency = async (skillId: string, proficiency: number) => {
    setUpdating(skillId);
    try {
      await saUpdateProficiency({ profileId, skillId, proficiency });
      setProfileSkills((prev) =>
        prev.map((ps) =>
          ps.skill_id === skillId ? { ...ps, proficiency } : ps
        )
      );
    } catch (e) {
      console.error(e);
    } finally {
      setUpdating(null);
    }
  };

  const getProficiencyLabel = (level: number) => {
    const labels = {
      1: "Beginner",
      2: "Basic",
      3: "Intermediate",
      4: "Advanced",
      5: "Expert",
    };
    return labels[level as keyof typeof labels] || "Intermediate";
  };

  const getProficiencyColor = (level: number) => {
    if (level >= 4) return "text-green-600 dark:text-green-400";
    if (level >= 3) return "text-blue-600 dark:text-blue-400";
    return "text-orange-600 dark:text-orange-400";
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            <span>Loading skills...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-teal-500 text-white">
            <Sparkles className="h-5 w-5" />
          </div>
          <CardTitle className="text-xl">{t.profile.professional.skills}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label className="text-sm font-medium">{t.profile.professional.addSkill}</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                className="h-11"
                placeholder={t.common.search}
                value={newSkill}
                onChange={(e) => {
                  setNewSkill(e.target.value);
                  if (inputError) setInputError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addSkill();
                }}
                disabled={adding || isPending}
              />

              {filteredSkills.length > 0 && (
                <div className="absolute z-20 mt-1 w-full rounded-lg border bg-background shadow-lg">
                  {filteredSkills.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      className="w-full text-left px-4 py-2.5 hover:bg-accent hover:text-accent-foreground transition-colors first:rounded-t-lg last:rounded-b-lg"
                      onClick={() => attachExistingSkill(s)}
                    >
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-muted-foreground" />
                        <span>{s.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {filteredSkills.length === 0 && newSkill.trim() && (
                <div className="absolute z-20 mt-1 w-full rounded-lg border bg-background shadow-lg">
                  <button
                    type="button"
                    className="w-full text-left px-4 py-2.5 hover:bg-accent hover:text-accent-foreground transition-colors rounded-lg"
                    onClick={createAndAttach}
                    disabled={creating || adding || isPending}
                  >
                    <div className="flex items-center gap-2">
                      <Plus className="h-4 w-4 text-muted-foreground" />
                      <span>
                        Create{" "}
                        <span className="font-medium">{newSkill.trim()}</span>{" "}
                        and add to your skills
                      </span>
                    </div>
                  </button>
                </div>
              )}
            </div>

            <Button
              onClick={addSkill}
              size="sm"
              disabled={adding || isPending}
              className="h-11 px-4"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>

          {inputError && (
            <p className="text-sm text-destructive flex items-center gap-1.5">
              <X className="h-3.5 w-3.5" />
              {inputError}
            </p>
          )}
        </div>

        <div>
          <Label className="text-sm font-medium mb-3 block">{t.profile.professional.yourSkills}</Label>
          <div className="flex flex-wrap gap-2">
            {profileSkills.map((ps) => (
              <Badge
                key={ps.skill_id}
                variant="secondary"
                className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-secondary/80 transition-colors"
              >
                <Award className="h-3.5 w-3.5" />
                <span>{ps.name}</span>
                <span
                  className={`text-xs font-medium ${getProficiencyColor(
                    ps.proficiency
                  )}`}
                >
                  {getProficiencyLabel(ps.proficiency)}
                </span>
                <button
                  onClick={() => removeSkill(ps.skill_id)}
                  className="ml-1 hover:bg-destructive/20 rounded-full p-0.5 transition-colors"
                  disabled={removing === ps.skill_id || isPending}
                  aria-label={`Remove ${ps.name}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </Badge>
            ))}
            {profileSkills.length === 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                <Sparkles className="h-4 w-4" />
                <span>
                  {t.profile.professional.noSkills}
                </span>
              </div>
            )}
          </div>
        </div>

        {profileSkills.length > 0 && (
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              {t.profile.professional.adjustProficiency}
            </Label>
            <div className="space-y-4">
              {profileSkills.map((ps) => (
                <div
                  key={`slider-${ps.skill_id}`}
                  className="rounded-lg border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-sm"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-muted-foreground" />
                      <Label className="font-medium">{ps.name}</Label>
                    </div>
                    <div className="text-right">
                      <div
                        className={`text-sm font-semibold ${getProficiencyColor(
                          ps.proficiency
                        )}`}
                      >
                        {getProficiencyLabel(ps.proficiency)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Level {ps.proficiency}/5
                      </div>
                    </div>
                  </div>
                  <Slider
                    defaultValue={[ps.proficiency]}
                    min={1}
                    max={5}
                    step={1}
                    onValueCommit={(v) => updateProficiency(ps.skill_id, v[0])}
                    disabled={updating === ps.skill_id || isPending}
                    className="cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
