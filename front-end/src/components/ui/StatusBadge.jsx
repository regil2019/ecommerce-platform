import React from 'react';

const StatusBadge = ({ status, className = '' }) => {
    const getStatusConfig = (status) => {
        switch (status) {
            case 'pending':
                return {
                    label: 'Pending',
                    className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
                };
            case 'processing':
                return {
                    label: 'Processing',
                    className: 'bg-blue-100 text-blue-800 border-blue-200'
                };
            case 'shipped':
                return {
                    label: 'Shipped',
                    className: 'bg-purple-100 text-purple-800 border-purple-200'
                };
            case 'delivered':
                return {
                    label: 'Delivered',
                    className: 'bg-green-100 text-green-800 border-green-200'
                };
            case 'cancelled':
                return {
                    label: 'Cancelled',
                    className: 'bg-red-100 text-red-800 border-red-200'
                };
            default:
                return {
                    label: status,
                    className: 'bg-gray-100 text-gray-800 border-gray-200'
                };
        }
    };

    const config = getStatusConfig(status);

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className} ${className}`}>
            {config.label}
        </span>
    );
};

export default StatusBadge;