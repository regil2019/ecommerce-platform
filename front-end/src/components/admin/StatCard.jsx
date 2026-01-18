import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

const StatCard = ({ title, value, icon, description, colorClass = 'text-gray-900' }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`h-8 w-8 flex items-center justify-center rounded-lg ${colorClass.replace('text-', 'bg-')}/10`}>
          {React.cloneElement(icon, { className: `h-5 w-5 ${colorClass}` })}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;