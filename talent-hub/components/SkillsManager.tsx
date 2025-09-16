"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { X, Plus } from "lucide-react";

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
  // createSkill, // <- available if you later add an "Add & create" flow
} from "@/app/actions/skills";

interface SkillsManagerProps {
  profileId: string;
}

export function SkillsManager({ profileId }: SkillsManagerProps) {
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [profileSkills, setProfileSkills] = useState<ProfileSkill[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  // under your other useMemos/state
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
      // 1) Only attach if it already exists (no auto-create)
      let skill = skillsByLowerName.get(raw.toLowerCase());
      if (!skill) {
        const found = await findSkillByName(raw);
        skill = found ?? undefined; // normalize null to undefined
      }
      if (!skill) {
        setInputError(`No existing skill named "${raw}".`);
        return;
      }

      // 2) Already attached?
      if (profileSkills.some((ps) => ps.skill_id === skill!.id)) {
        setNewSkill("");
        return;
      }

      // 3) Attach with default proficiency
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
      // double-check it doesn't already exist
      const existing = await findSkillByName(raw);
      const skill = existing ?? (await createSkill(raw)); // explicit create

      // attach if not already attached
      if (!profileSkills.some((ps) => ps.skill_id === skill.id)) {
        const added = await addProfileSkill({
          profileId,
          skillId: skill.id,
          proficiency: 3,
        });
        setProfileSkills((prev) => [...prev, added]);
      }
      setNewSkill("");
    } catch (e: any) {
      // surface unique constraint nicely if two people create same name
      const message =
        typeof e?.message === "string" && e.message.includes("duplicate")
          ? "Skill already exists."
          : "Could not create skill.";
      setInputError(message);
      console.error(e);
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

  if (isLoading) return <div>Loading skills...</div>;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            placeholder="Add a skill..."
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
            <div className="absolute z-20 mt-1 w-full rounded-md border bg-background shadow">
              {filteredSkills.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className="w-full text-left px-3 py-2 hover:bg-accent hover:text-accent-foreground"
                  onClick={() => attachExistingSkill(s)}
                >
                  {s.name}
                </button>
              ))}
            </div>
          )}
        </div>
        {filteredSkills.length === 0 && newSkill.trim() && (
          <div className="absolute z-20 mt-10 w-half rounded-md border bg-background shadow">
            <button
              type="button"
              className="w-full text-left px-3 py-2 hover:bg-accent hover:text-accent-foreground"
              onClick={createAndAttach}
              disabled={creating || adding || isPending}
            >
              Create “{newSkill.trim()}” and add to your skills
            </button>
          </div>
        )}

        <Button onClick={addSkill} size="sm" disabled={adding || isPending}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {inputError && (
        <p className="text-sm text-destructive -mt-2">{inputError}</p>
      )}

      <div className="flex flex-wrap gap-2">
        {profileSkills.map((ps) => (
          <Badge
            key={ps.skill_id}
            variant="secondary"
            className="flex items-center gap-1"
            title={`Proficiency: ${ps.proficiency}`}
          >
            {ps.name}
            <span className="text-muted-foreground ml-1">
              ({ps.proficiency})
            </span>
            <button
              onClick={() => removeSkill(ps.skill_id)}
              className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
              disabled={removing === ps.skill_id || isPending}
              aria-label={`Remove ${ps.name}`}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        {profileSkills.length === 0 && (
          <span className="text-sm text-muted-foreground">
            No skills added yet.
          </span>
        )}
      </div>

      {profileSkills.length > 0 && (
        <div className="space-y-3">
          {profileSkills.map((ps) => (
            <div
              key={`slider-${ps.skill_id}`}
              className="rounded-lg border p-3"
            >
              <div className="flex items-center justify-between mb-2">
                <Label className="font-medium">{ps.name}</Label>
                <span className="text-sm text-muted-foreground">
                  Proficiency:{" "}
                  <span className="font-medium">{ps.proficiency}</span>
                </span>
              </div>
              <Slider
                defaultValue={[ps.proficiency]}
                min={1}
                max={5}
                step={1}
                onValueCommit={(v) => updateProficiency(ps.skill_id, v[0])}
                disabled={updating === ps.skill_id || isPending}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
