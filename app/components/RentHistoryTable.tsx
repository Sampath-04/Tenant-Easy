import React from "react";
import { RentHistoryItem } from "@/lib/api/rentHistory";

interface RentHistoryTableProps {
  records: RentHistoryItem[];
  emptyMessage: string;
  showUnits?: boolean; // optional flag for units
}

const RentHistoryTable: React.FC<RentHistoryTableProps> = ({
  records,
  emptyMessage,
  showUnits = true,
}) => {
  return (
    <div className="p-2">
      {records?.length === 0 ? (
        <div className="text-center py-8">
          <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
            {emptyMessage}
          </h3>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700/50">
            <tr>
                <th className="px-2 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[160px] whitespace-nowrap">
                Cycle
                </th>
                <th className="px-2 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[140px] whitespace-nowrap">
                Room No.
                </th>
                <th className="px-2 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[120px] whitespace-nowrap">
                Rent (₹)
                </th>
                <th className="px-2 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[160px] whitespace-nowrap">
                Electricity (₹)
                </th>
                <th className="px-2 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[120px] whitespace-nowrap">
                Total (₹)
                </th>
                <th className="px-2 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[140px] whitespace-nowrap">
                Due Date
                </th>
                <th className="px-2 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[180px] whitespace-nowrap">
                Status
                </th>
            </tr>
            </thead>

            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {records.map((record) => (
                <tr
                  key={record._id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <td className="px-2 md:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatDate(record.startDate)} - {formatDate(record.endDate)}
                    </div>
                  </td>
                  <td className="px-2 md:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {record.room?.roomNo || "-"}
                    </div>
                  </td>
                  <td className="px-2 md:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatCurrency(record.rent)}
                    </div>
                  </td>
                  <td className="px-2 md:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(record.electricityBill)}
                      </div>
                      {showUnits && record.electricityUnits !== undefined && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 rounded-md px-2 py-1">
                          {record.electricityUnits} units
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-2 md:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(record.totalAmount)}
                    </div>
                  </td>
                  <td className="px-2 md:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      {formatDate(record.dueDate)}
                    </div>
                  </td>
                  <td className="px-2 md:px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        record.paymentStatus === "FULLY_PAID"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : record.isOverdue
                          ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                      }`}
                    >
                      {record.paymentStatus === "FULLY_PAID"
                        ? "Paid"
                        : record.isOverdue
                        ? "Overdue"
                        : "Pending"}
                      {record.isOverdue && (
                        <span className="ml-1 text-xs">
                          ({record.daysOverdue} day
                          {record.daysOverdue && record.daysOverdue > 1 ? "s" : ""})
                        </span>
                      )}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RentHistoryTable;

// helpers assumed available
function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
function formatCurrency(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}
