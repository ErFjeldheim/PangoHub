"use client";

import { FC, useEffect, useState } from "react";
import Link from "next/link";
import { getDepartments } from "@/app/actions/departments";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import DepartmentForm from "./DepartmentForm";
import { Users, User } from "lucide-react";

interface Department {
  id: string;
  name: string;
  description: string;
  consultant_count: number;
  leader_name: string | null;
}

const DepartmentList: FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);

  const fetchDepartments = async () => {
    const data = await getDepartments();
    console.log(data);
    setDepartments(data);
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Departments</h2>
        <DepartmentForm onSuccess={fetchDepartments} />
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {departments.map((department) => (
          <Link
            href={`/dashboard/departments/${department.id}`}
            key={department.id}
          >
            <Card className="h-full hover:shadow-lg transition-shadow duration-200 cursor-pointer flex flex-col">
              <CardHeader>
                <CardTitle className="text-xl">{department.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col justify-between">
                <p className="text-muted-foreground mb-4">
                  {department.description}
                </p>
                <div className="flex items-center text-sm text-muted-foreground">
                  <div className="flex items-center mr-4">
                    <Users className="h-4 w-4 mr-2" />
                    <span>{department.consultant_count} Consultants</span>
                  </div>
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    <span>
                      {department.leader_name || "No leader assigned"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default DepartmentList;
