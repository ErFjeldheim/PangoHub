'use client';

import { FC } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface MonthlyAvailability {
  month: string;
  total_hours_available: number;
  total_hours_committed: number;
  total_hours_free: number;
}

interface DepartmentAvailabilityProps {
  availability: MonthlyAvailability[];
}

const DepartmentAvailability: FC<DepartmentAvailabilityProps> = ({ availability }) => {
  if (availability.length === 0) {
    return <p className="text-muted-foreground">No availability data found for the consultants in this department for the next 6 months.</p>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Department Availability</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Month</TableHead>
              <TableHead className="text-right">Available Hours</TableHead>
              <TableHead className="text-right">Committed Hours</TableHead>
              <TableHead className="text-right">Free Hours</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {availability.map(monthlyData => (
              <TableRow key={monthlyData.month}>
                <TableCell>{new Date(monthlyData.month + '-02').toLocaleString('default', { month: 'long', year: 'numeric' })}</TableCell>
                <TableCell className="text-right">{monthlyData.total_hours_available}</TableCell>
                <TableCell className="text-right">{monthlyData.total_hours_committed}</TableCell>
                <TableCell className="text-right font-bold text-green-600">{monthlyData.total_hours_free}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default DepartmentAvailability;
