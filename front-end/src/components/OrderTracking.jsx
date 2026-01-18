import React from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Circle, XCircle } from "lucide-react";

const getStatusVariant = (status) => {
  switch (status) {
    case "pending":
      return "secondary";
    case "processing":
      return "outline";
    case "shipped":
      return "default";
    case "delivered":
      return "success";
    case "cancelled":
      return "destructive";
    default:
      return "secondary";
  }
};

const getStatusInfo = (statusType) => {
  switch (statusType) {
    case "pending":
      return {
        label: "Pedido Realizado",
        description: "Seu pedido foi recebido.",
      };
    case "processing":
      return {
        label: "Processando",
        description: "Seu pedido está sendo preparado.",
      };
    case "shipped":
      return {
        label: "Enviado",
        description: "Seu pedido foi enviado.",
      };
    case "delivered":
      return {
        label: "Entregue",
        description: "Seu pedido foi entregue.",
      };
    default:
      return { label: statusType, description: "" };
  }
};

const OrderTracking = ({ status, createdAt, updatedAt }) => {
  const statuses = ["pending", "processing", "shipped", "delivered"];
  const currentIndex = statuses.indexOf(status);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Rastreamento do Pedido</h3>
      <div className="relative">
        <div
          className="absolute left-4 top-4 -bottom-4 w-0.5 bg-gray-200"
          aria-hidden="true"
        />
        <div className="space-y-8">
          {statuses.map((statusType, index) => {
            const isCompleted = index <= currentIndex && status !== "cancelled";
            const isCurrent = index === currentIndex && status !== "cancelled";
            const info = getStatusInfo(statusType);

            return (
              <div key={statusType} className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  {isCompleted ? (
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  ) : (
                    <Circle className="h-8 w-8 text-gray-300" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4
                        className={`text-md font-medium ${
                          isCompleted || isCurrent
                            ? "text-gray-900"
                            : "text-gray-500"
                        }`}
                      >
                        {info.label}
                      </h4>
                      <p
                        className={`text-sm ${
                          isCompleted || isCurrent
                            ? "text-gray-600"
                            : "text-gray-400"
                        }`}
                      >
                        {info.description}
                      </p>
                    </div>
                    {isCurrent && (
                      <Badge variant={getStatusVariant(status)}>
                        {status}
                      </Badge>
                    )}
                  </div>
                  {isCompleted && (
                    <p className="text-xs text-gray-500 mt-1">
                      {index === 0
                        ? new Date(createdAt).toLocaleDateString()
                        : index === currentIndex
                        ? new Date(updatedAt).toLocaleDateString()
                        : ""}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {status === "cancelled" && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <XCircle className="h-6 w-6 text-red-500" />
            <div>
              <h4 className="text-red-800 font-semibold">Pedido Cancelado</h4>
              <p className="text-red-700 text-sm mt-1">
                Este pedido foi cancelado e não pode ser processado.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTracking;