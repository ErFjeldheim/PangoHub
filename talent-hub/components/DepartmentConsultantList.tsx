'use client';

import { FC, useState } from 'react';
import { addConsultantToDepartment, removeConsultantFromDepartment } from '@/app/actions/departments';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Mail, Trash2 } from 'lucide-react';

interface Consultant {
  id: string;
  display_name: string;
  title: string;
  email: string;
}

interface DepartmentConsultantListProps {
  departmentId: string;
  initialConsultants: Consultant[];
}

const DepartmentConsultantList: FC<DepartmentConsultantListProps> = ({ departmentId, initialConsultants }) => {
  const [consultants, setConsultants] = useState(initialConsultants);

  const handleAddConsultant = async () => {
    // This would ideally open a dialog to search for and select a consultant
    const profileId = prompt('Enter the ID of the consultant to add:');
    if (profileId) {
      await addConsultantToDepartment(departmentId, profileId);
      // For now, we just refetch, but ideally we would update the state optimistically
      window.location.reload();
    }
  };

  const handleRemoveConsultant = async (profileId: string) => {
    if (confirm('Are you sure you want to remove this consultant from the department?')) {
      await removeConsultantFromDepartment(departmentId, profileId);
      setConsultants(consultants.filter(c => c.id !== profileId));
    }
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={handleAddConsultant}>Add Consultant</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {consultants.map(consultant => (
          <Card key={consultant.id}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">{consultant.display_name}</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => handleRemoveConsultant(consultant.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{consultant.title}</p>
              <div className="flex items-center pt-2">
                <Mail className="mr-2 h-4 w-4 text-muted-foreground"/>
                <a href={`mailto:${consultant.email}`} className="text-xs text-muted-foreground hover:text-primary">
                  {consultant.email}
                </a>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DepartmentConsultantList;
