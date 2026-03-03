import React from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Circle, XCircle } from "lucide-react";
import { useI18n } from "@/i18n";

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

const OrderTracking = ({ status, createdAt, updatedAt }) => {
  const { t } = useI18n();

  const getStatusInfo = (statusType) => {
    switch (statusType) {
      case "pending":
        return {
          label: t("admin.orderPlaced"),
          description: t("admin.orderPlacedDesc"),
        };
      case "processing":
        return {
          label: t("orders.processing"),
          description: t("admin.processingDesc"),
        };
      case "shipped":
        return {
          label: t("orders.shipped"),
          description: t("admin.shippedDesc"),
        };
      case "delivered":
        return {
          label: t("orders.delivered"),
          description: t("admin.deliveredDesc"),
        };
      default:
        return { label: statusType, description: "" };
    }
  };

  const statuses = ["pending", "processing", "shipped", "delivered"];
  const currentIndex = statuses.indexOf(status);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-foreground">{t("admin.orderTracking")}</h3>
      <div className="relative">
        <div
          className="absolute left-4 top-4 -bottom-4 w-0.5 bg-border"
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
                    <Circle className="h-8 w-8 text-muted-foreground/40" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4
                        className={`text-md font-medium ${isCompleted || isCurrent
                          ? "text-foreground"
                          : "text-muted-foreground"
                          }`}
                      >
                        {info.label}
                      </h4>
                      <p
                        className={`text-sm ${isCompleted || isCurrent
                          ? "text-muted-foreground"
                          : "text-muted-foreground/60"
                          }`}
                      >
                        {info.description}
                      </p>
                    </div>
                    {isCurrent && (
                      <Badge variant={getStatusVariant(status)}>
                        {t(`orders.statuses.${status}`)}
                      </Badge>
                    )}
                  </div>
                  {isCompleted && (
                    <p className="text-xs text-muted-foreground mt-1">
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
        <div className="mt-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <div className="flex items-center space-x-3">
            <XCircle className="h-6 w-6 text-destructive" />
            <div>
              <h4 className="text-destructive font-semibold">{t("admin.orderCancelled")}</h4>
              <p className="text-destructive/80 text-sm mt-1">
                {t("admin.orderCancelledDesc")}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTracking;