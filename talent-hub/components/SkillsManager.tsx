"use client"

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { X, ChevronsUpDown } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

interface Skill {
  id: string;
  name: string;
}

interface ProfileSkill {
  skill_id: string;
  proficiency: number;
  name: string;
}

interface SkillsManagerProps {
  profileId: string;
}

export function SkillsManager({ profileId }: SkillsManagerProps) {
  const supabase = createClient();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [profileSkills, setProfileSkills] = useState<ProfileSkill[]>([]);
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      // Fetch all canonical skills
      const { data: skillsData, error: skillsError } = await supabase.from('skills').select('id, name');
      if (skillsError) console.error('Error fetching skills:', skillsError);
      else setSkills(skillsData);

      // Fetch user's skills
      const { data: profileSkillsData, error: profileSkillsError } = await supabase
        .from('profile_skills')
        .select('skill_id, proficiency, skills(name)')
        .eq('profile_id', profileId);

      if (profileSkillsError) console.error('Error fetching profile skills:', profileSkillsError);
      else {
        const formattedSkills = profileSkillsData.map((ps: any) => ({
          skill_id: ps.skill_id,
          proficiency: ps.proficiency,
          name: ps.skills.name,
        }));
        setProfileSkills(formattedSkills);
      }
      setIsLoading(false);
    }
    fetchData();
  }, [profileId, supabase]);

  const addSkill = async (skill: Skill) => {
    if (profileSkills.some((ps) => ps.skill_id === skill.id)) return;

    const newProfileSkill = { profile_id: profileId, skill_id: skill.id, proficiency: 3 };
    const { error } = await supabase.from('profile_skills').insert(newProfileSkill);

    if (error) {
      console.error('Error adding skill:', error);
    } else {
      setProfileSkills([...profileSkills, { ...newProfileSkill, name: skill.name }]);
    }
    setOpen(false);
  };

  const removeSkill = async (skillId: string) => {
    const { error } = await supabase.from('profile_skills').delete().match({ profile_id: profileId, skill_id: skillId });
    if (error) {
      console.error('Error removing skill:', error);
    } else {
      setProfileSkills(profileSkills.filter((ps) => ps.skill_id !== skillId));
    }
  };

  const updateProficiency = async (skillId: string, proficiency: number) => {
    const { error } = await supabase.from('profile_skills').update({ proficiency }).match({ profile_id: profileId, skill_id: skillId });
    if (error) {
      console.error('Error updating proficiency:', error);
    } else {
      setProfileSkills(profileSkills.map((ps) => (ps.skill_id === skillId ? { ...ps, proficiency } : ps)));
    }
  };

  if (isLoading) {
    return <div>Loading skills...</div>;
  }

  return (
    <div className="space-y-4">
        <Label>Skills</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
            Add a skill...
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
          <Command>
            <CommandInput placeholder="Search skill..." />
            <CommandEmpty>No skill found.</CommandEmpty>
            <CommandGroup>
              {skills.map((skill) => (
                <CommandItem
                  key={skill.id}
                  onSelect={() => addSkill(skill)}
                  disabled={profileSkills.some((ps) => ps.skill_id === skill.id)}
                >
                  {skill.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      <div className="space-y-4">
        {profileSkills.map((ps) => (
          <div key={ps.skill_id} className="p-4 border rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <Badge variant="secondary">{ps.name}</Badge>
              <Button variant="ghost" size="icon" onClick={() => removeSkill(ps.skill_id)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
                <Label>Proficiency: {ps.proficiency}</Label>
                <Slider
                    defaultValue={[ps.proficiency]}
                    min={1}
                    max={5}
                    step={1}
                    onValueCommit={(value) => updateProficiency(ps.skill_id, value[0])}
                />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
