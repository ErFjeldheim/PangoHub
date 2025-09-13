"use client"

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Plus, X } from 'lucide-react';

interface Experience {
  id?: string;
  org: string;
  role: string;
  start_date: string;
  end_date?: string;
  type: 'job' | 'internship' | 'freelance';
  description?: string;
}

interface ExperienceManagerProps {
  profileId: string;
}

export function ExperienceManager({ profileId }: ExperienceManagerProps) {
  const supabase = createClient();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentExperience, setCurrentExperience] = useState<Experience | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchExperiences() {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('experiences')
        .select('*')
        .eq('profile_id', profileId)
        .order('start_date', { ascending: false });

      if (error) {
        console.error('Error fetching experiences:', error);
        toast.error('Failed to fetch experiences');
      } else {
        setExperiences(data);
      }
      setIsLoading(false);
    }

    fetchExperiences();
  }, [profileId, supabase]);

  const handleAddNew = () => {
    setCurrentExperience({
      org: '',
      role: '',
      start_date: '',
      type: 'job',
    });
    setIsEditing(true);
  };

  const handleEdit = (experience: Experience) => {
    setCurrentExperience(experience);
    setIsEditing(true);
  };

  const handleDelete = async (experienceId: string) => {
    const { error } = await supabase.from('experiences').delete().eq('id', experienceId);
    if (error) {
      toast.error('Failed to delete experience');
    } else {
      setExperiences(experiences.filter(exp => exp.id !== experienceId));
      toast.success('Experience deleted');
    }
  };

  const handleSave = async () => {
    if (!currentExperience) return;

    const experienceToSave = {
      ...currentExperience,
      profile_id: profileId,
    };

    const { data, error } = await supabase.from('experiences').upsert(experienceToSave).select().single();

    if (error) {
      toast.error('Failed to save experience');
      console.error('Error saving experience:', error);
    } else {
      if (currentExperience.id) {
        // Update existing
        setExperiences(experiences.map(exp => exp.id === data.id ? data : exp));
      } else {
        // Add new
        setExperiences([data, ...experiences]);
      }
      toast.success('Experience saved');
      setIsEditing(false);
      setCurrentExperience(null);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setCurrentExperience(null);
  };

  if (isLoading) {
    return <p>Loading experiences...</p>;
  }

  if (isEditing && currentExperience) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{currentExperience.id ? 'Edit' : 'Add'} Experience</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label>Organization</Label>
                <Input value={currentExperience.org} onChange={(e) => setCurrentExperience({...currentExperience, org: e.target.value})} />
            </div>
            <div className="space-y-2">
                <Label>Role</Label>
                <Input value={currentExperience.role} onChange={(e) => setCurrentExperience({...currentExperience, role: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input type="date" value={currentExperience.start_date} onChange={(e) => setCurrentExperience({...currentExperience, start_date: e.target.value})} />
                </div>
                <div className="space-y-2">
                    <Label>End Date (optional)</Label>
                    <Input type="date" value={currentExperience.end_date || ''} onChange={(e) => setCurrentExperience({...currentExperience, end_date: e.target.value})} />
                </div>
            </div>
            <div className="space-y-2">
                <Label>Type</Label>
                {/* Implement a Select component for type */}
            </div>
            <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={currentExperience.description || ''} onChange={(e) => setCurrentExperience({...currentExperience, description: e.target.value})} />
            </div>
            <div className="flex justify-end space-x-2">
                <Button variant="ghost" onClick={handleCancel}>Cancel</Button>
                <Button onClick={handleSave}>Save</Button>
            </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Work Experience</CardTitle>
        <Button variant="outline" size="sm" onClick={handleAddNew}><Plus className="h-4 w-4 mr-2" /> Add New</Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {experiences.map(exp => (
          <div key={exp.id} className="flex items-start justify-between p-2 border-b">
            <div>
              <h3 className="font-semibold">{exp.role} at {exp.org}</h3>
              <p className="text-sm text-muted-foreground">{new Date(exp.start_date).getFullYear()} - {exp.end_date ? new Date(exp.end_date).getFullYear() : 'Present'}</p>
            </div>
            <div className="flex space-x-2">
                <Button variant="ghost" size="sm" onClick={() => handleEdit(exp)}>Edit</Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(exp.id!)}>Delete</Button>
            </div>
          </div>
        ))}
        {experiences.length === 0 && <p className="text-muted-foreground italic">No work experience added yet.</p>}
      </CardContent>
    </Card>
  );
}
