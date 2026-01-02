import React from 'react';
import StatusBadge from './ui/StatusBadge';

const OrderTracking = ({ status, createdAt, updatedAt }) => {
    const statuses = ['pending', 'processing', 'shipped', 'delivered'];
    const currentIndex = statuses.indexOf(status);

    const getStatusInfo = (statusType) => {
        switch (statusType) {
            case 'pending':
                return { label: 'Order Placed', description: 'Your order has been received' };
            case 'processing':
                return { label: 'Processing', description: 'Your order is being prepared' };
            case 'shipped':
                return { label: 'Shipped', description: 'Your order has been shipped' };
            case 'delivered':
                return { label: 'Delivered', description: 'Your order has been delivered' };
            default:
                return { label: statusType, description: '' };
        }
    };

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">Order Tracking</h3>
            <div className="space-y-3">
                {statuses.map((statusType, index) => {
                    const isCompleted = index <= currentIndex && status !== 'cancelled';
                    const isCurrent = index === currentIndex && status !== 'cancelled';
                    const info = getStatusInfo(statusType);

                    return (
                        <div key={statusType} className="flex items-start space-x-3">
                            <div className="flex flex-col items-center">
                                <div className={`w-4 h-4 rounded-full border-2 ${
                                    isCompleted
                                        ? 'bg-green-500 border-green-500'
                                        : isCurrent
                                            ? 'bg-blue-500 border-blue-500'
                                            : 'bg-gray-200 border-gray-300'
                                }`}>
                                    {isCompleted && (
                                        <svg className="w-3 h-3 text-white mx-auto mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </div>
                                {index < statuses.length - 1 && (
                                    <div className={`w-0.5 h-8 mt-2 ${
                                        index < currentIndex && status !== 'cancelled' ? 'bg-green-500' : 'bg-gray-300'
                                    }`} />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2">
                                    <h4 className={`text-sm font-medium ${
                                        isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-500'
                                    }`}>
                                        {info.label}
                                    </h4>
                                    {isCurrent && <StatusBadge status={status} />}
                                </div>
                                <p className={`text-sm ${
                                    isCompleted || isCurrent ? 'text-gray-600' : 'text-gray-400'
                                }`}>
                                    {info.description}
                                </p>
                                {isCompleted && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        {index === 0 ? new Date(createdAt).toLocaleDateString() :
                                         index === currentIndex ? new Date(updatedAt).toLocaleDateString() : ''}
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
            {status === 'cancelled' && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <span className="text-red-800 font-medium">Order Cancelled</span>
                    </div>
                    <p className="text-red-700 text-sm mt-1">
                        This order has been cancelled and cannot be processed further.
                    </p>
                </div>
            )}
        </div>
    );
};

export default OrderTracking;