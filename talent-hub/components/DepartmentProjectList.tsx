'use client';

import { FC } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface Project {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
}

interface DepartmentProjectListProps {
  projects: Project[];
}

const DepartmentProjectList: FC<DepartmentProjectListProps> = ({ projects }) => {
  if (projects.length === 0) {
    return <p className="text-muted-foreground">No projects found for this department.</p>;
  }

  return (
    <div className="grid gap-4">
      {projects.map(project => (
        <Card key={project.id}>
          <CardHeader>
            <CardTitle>{project.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{project.description}</p>
            <div className="flex items-center text-sm text-muted-foreground mt-4">
              <span>{new Date(project.start_date).toLocaleDateString()}</span>
              <span className="mx-2">-</span>
              <span>{project.end_date ? new Date(project.end_date).toLocaleDateString() : 'Ongoing'}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DepartmentProjectList;
