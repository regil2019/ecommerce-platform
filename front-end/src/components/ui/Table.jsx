import React from "react";

export function Table({ children, className = "", ...props }) {
  return (
    <div className="overflow-x-auto">
      <table className={`min-w-full divide-y divide-gray-200 ${className}`} {...props}>
        {children}
      </table>
    </div>
  );
}

export function TableHead({ children, className = "", ...props }) {
  return (
    <thead className={`bg-gray-50 ${className}`} {...props}>
      {children}
    </thead>
  );
}

export function TableRow({ children, className = "", ...props }) {
  return (
    <tr className={className} {...props}>
      {children}
    </tr>
  );
}

export function TableCell({ children, className = "", ...props }) {
  return (
    <td className={`px-6 py-4 whitespace-nowrap ${className}`} {...props}>
      {children}
    </td>
  );
}

export function TableBody({ children, className = "", ...props }) {
  return (
    <tbody className={className} {...props}>
      {children}
    </tbody>
  );
}
