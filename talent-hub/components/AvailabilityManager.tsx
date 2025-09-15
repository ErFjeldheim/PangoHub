"use client"

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface Availability {
  month: string;
  hours_available: number;
  hours_committed: number;
  status: string;
}

interface AvailabilityManagerProps {
  profileId: string;
}

export function AvailabilityManager({ profileId }: AvailabilityManagerProps) {
  const supabase = createClient();
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAvailability() {
      setIsLoading(true);
      const fromDate = new Date();
      const toDate = new Date();
      toDate.setMonth(toDate.getMonth() + 5);

      const { data, error } = await supabase
        .from('availability_months')
        .select('*')
        .eq('profile_id', profileId)
        .gte('month', fromDate.toISOString().slice(0, 7) + '-01')
        .lte('month', toDate.toISOString().slice(0, 7) + '-01')
        .order('month');

      if (error) {
        console.error('Error fetching availability:', error);
        toast.error('Failed to fetch availability');
      } else {
        // Ensure we have an entry for each of the next 6 months
        const months = Array.from({ length: 6 }, (_, i) => {
          const d = new Date();
          d.setDate(1);
          d.setMonth(d.getMonth() + i);
          return d.toISOString().slice(0, 7) + '-01';
        });

        const availabilityData = months.map(month => {
          const existing = data.find(d => d.month === month);
          return existing || { month, hours_available: 0, hours_committed: 0, status: 'unavailable' };
        });
        setAvailability(availabilityData);
      }
      setIsLoading(false);
    }

    fetchAvailability();
  }, [profileId, supabase]);

  const handleHoursChange = (month: string, hours: string) => {
    const newAvailability = availability.map(a =>
      a.month === month ? { ...a, hours_available: Number(hours) } : a
    );
    setAvailability(newAvailability);
  };

  const handleSave = async (month: string) => {
    const entry = availability.find(a => a.month === month);
    if (!entry) return;

    const { error } = await supabase.from('availability_months').upsert(
      {
        profile_id: profileId,
        month: entry.month,
        hours_available: entry.hours_available,
      },
      { onConflict: 'profile_id, month' }
    );

    if (error) {
      toast.error(`Failed to save availability for ${month}`);
      console.error('Error saving availability:', error);
    } else {
      toast.success(`Availability for ${month} saved`);
      // Re-fetch data to get updated status
      const fromDate = new Date();
      const toDate = new Date();
      toDate.setMonth(toDate.getMonth() + 5);

      const { data: updatedData, error: fetchError } = await supabase
        .from('availability_months')
        .select('*')
        .eq('profile_id', profileId)
        .gte('month', fromDate.toISOString().slice(0, 7) + '-01')
        .lte('month', toDate.toISOString().slice(0, 7) + '-01')
        .order('month');

      if (fetchError) {
        console.error('Error re-fetching availability:', fetchError);
        toast.error('Failed to refresh availability data');
      } else {
        const months = Array.from({ length: 6 }, (_, i) => {
          const d = new Date();
          d.setDate(1);
          d.setMonth(d.getMonth() + i);
          return d.toISOString().slice(0, 7) + '-01';
        });

        const availabilityData = months.map(month => {
          const existing = updatedData.find(d => d.month === month);
          return existing || { month, hours_available: 0, hours_committed: 0, status: 'unavailable' };
        });
        setAvailability(availabilityData);
      }
    }
  };

  if (isLoading) {
    return <p>Loading availability...</p>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Availability</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {availability.map(entry => (
          <div key={entry.month} className="flex items-center justify-between p-2 border rounded-lg">
            <div>
              <Label>{new Date(entry.month).toLocaleString('default', { month: 'long', year: 'numeric' })}</Label>
              <p className="text-sm text-muted-foreground">Status: {entry.status}</p>
            </div>
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                className="w-24"
                value={entry.hours_available}
                onChange={(e) => handleHoursChange(entry.month, e.target.value)}
              />
              <Button onClick={() => handleSave(entry.month)}>Save</Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
