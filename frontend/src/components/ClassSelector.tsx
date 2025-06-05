
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, GraduationCap } from 'lucide-react';
import { getClassInfo } from '@/constants/classData';

interface ClassSelectorProps {
  classes: string[];
  selectedClass: string;
  onClassChange: (classId: string) => void;
  classData: Record<string, any>;
}

const ClassSelector = ({ classes, selectedClass, onClassChange, classData }: ClassSelectorProps) => {
  const formatClassName = (classId: string) => {
    const classInfo = getClassInfo(classId);
    return classInfo ? classInfo.name : classId.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getClassCode = (classId: string) => {
    const classInfo = getClassInfo(classId);
    return classInfo ? classInfo.code : '';
  };

  return (
    <Card className="mb-6 border-teal-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <GraduationCap className="h-5 w-5 text-teal-600" />
            <h3 className="font-semibold text-teal-700">Select Class</h3>
          </div>
          <Select value={selectedClass} onValueChange={onClassChange}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Choose a class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((classId) => (
                <SelectItem key={classId} value={classId}>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <div className="flex flex-col">
                      <span>{classData[classId]?.name || formatClassName(classId)}</span>
                      <span className="text-xs text-teal-500">{getClassCode(classId)}</span>
                    </div>
                    <span className="text-sm text-teal-500">
                      ({classData[classId]?.totalStudents || 0} students)
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClassSelector;
