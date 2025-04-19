import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import { 
  FiCheckCircle, 
  FiDollarSign, 
  FiPackage, 
  FiRefreshCw, 
  FiXCircle 
} from "react-icons/fi";

// Import your types and hooks from external files
import { AdminRefundApproval, ShippingStatus } from "@/types/orders";
import { useSocket } from "@/components/hooks/useSocket";
import { useOrderStore } from "@/stores/useOrderStore";
import { useUserStore } from "@/stores/useUserStore";
import useDebounce from "@/components/hooks/useDebounce";

const OrdersPage = () => {
  const socket = useSocket();
  // Read initial query parameters from the URL
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const initialPage = Number(searchParams.get("page")) || 1;

  // Local state for search and pagination
  const [search, setSearch] = useState(initialSearch);
  const [page, setPage] = useState(initialPage);
  const limit = 10; // orders per page

  // Use your custom debounce hook (300ms delay)
  const debouncedSearch = useDebounce(search, 300);

  // Extract functions and state from your stores
  const {
    orders,
    pagination,
    getAllOrders,
    getUserOrders,
    updateStatus,
    cancelOrder,
    refundOrder,
    approveRefund,
    processRefund,
  } = useOrderStore();
  const { user } = useUserStore();
  const isAdmin = user?.role === "admin";

  // Ref for the orders container (used for scrolling to a matched order in mobile view)
  const ordersListRef = useRef<HTMLDivElement>(null);

  // Set up real-time socket listeners for order updates
  useEffect(() => {
    if (!socket) return;

    const handleOrderUpdate = () => {
      if (isAdmin) {
        getAllOrders({ page, limit, search: debouncedSearch });
      } else {
        getUserOrders({ page, limit, search: debouncedSearch });
      }
    };

    socket.on("orderStatusUpdated", handleOrderUpdate);
    socket.on("newOrder", handleOrderUpdate);

    return () => {
      socket.off("orderStatusUpdated", handleOrderUpdate);
      socket.off("newOrder", handleOrderUpdate);
    };
  }, [socket, isAdmin, getAllOrders, getUserOrders, page, limit, debouncedSearch]);



  useEffect(() => {
    if (isAdmin) {
      getAllOrders({ page, limit, search: debouncedSearch });
    } else {
      getUserOrders({ page, limit, search: debouncedSearch });
    }
  }, [isAdmin, getAllOrders, getUserOrders, page, limit, debouncedSearch]);


  useEffect(() => {
    if (debouncedSearch && ordersListRef.current) {
      // Look for an element with a data attribute matching the order ID
      const matchingElement = ordersListRef.current.querySelector(
        `[data-order-id="${debouncedSearch}"]`
      );
      if (matchingElement) {
        matchingElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [debouncedSearch]);

  useEffect(() => {
    setSearchParams(() => {
      const newParams = new URLSearchParams();
      
      // Only include the page parameter if page > 1
      if (page > 1) {
        newParams.set("page", page.toString());
      }
      
      // Only include the search parameter if the user is admin and there is a value
      if (isAdmin && debouncedSearch) {
        newParams.set("search", debouncedSearch);
      }
      
      return newParams;
    }, { replace: true });
  }, [page, debouncedSearch, isAdmin, setSearchParams]);
  // Handler for pagination navigation
  const goToPage = (newPage: number) => {
    setPage(newPage);
  };

  // Admin-only: update order status
  const handleStatusChange = async (orderId: string, newStatus: ShippingStatus) => {
    if (!isAdmin) return;
    await updateStatus(orderId, newStatus);
    isAdmin 
      ? await getAllOrders({ page, limit, search: debouncedSearch }) 
      : await getUserOrders({ page, limit, search: debouncedSearch });
  };

  // Admin-only: handle refund actions
  const handleRefundAction = async (orderId: string, decision: "Approved" | "Rejected") => {
    if (!isAdmin) return;
    const mappedDecision: AdminRefundApproval =
      decision === "Approved" ? AdminRefundApproval.Approved : AdminRefundApproval.Rejected;
    await approveRefund(orderId, mappedDecision);
    if (mappedDecision === AdminRefundApproval.Approved) {
      await processRefund(orderId);
      await updateStatus(orderId, ShippingStatus.Refunded);
    }
    isAdmin 
      ? await getAllOrders({ page, limit, search: debouncedSearch }) 
      : await getUserOrders({ page, limit, search: debouncedSearch });
  };

  // Handle user request actions (cancellation or refund request)
  const handleRequestAction = (orderId: string, requestType: "cancel" | "refund") => {
    const CONFIRM_CONFIG = {
      cancel: {
        title: "Confirm Cancellation",
        message: "A 6% cancellation fee will be applied to your order. Are you sure you want to cancel?",
        action: () => cancelOrder(orderId),
      },
      refund: {
        title: "Confirm Refund Request",
        message: "Are you sure you want to request a refund? Please note that a fee may be applied (10%).",
        action: () => refundOrder(orderId),
      },
    };

    const { title, message, action } = CONFIRM_CONFIG[requestType];

    confirmAlert({
      title,
      message,
      buttons: [
        {
          label: "Yes",
          onClick: async () => {
            await action();
            if (!isAdmin) {
              getUserOrders({ page, limit, search: debouncedSearch });
            }
          },
        },
        { label: "No", onClick: () => {} },
      ],
    });
  };

  // Calculate display numbers for pagination
  const startItem = (pagination.page - 1) * limit + 1;
  const endItem = Math.min(pagination.page * limit, pagination.total || 0);

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800 flex items-center gap-2 justify-center">
          <FiPackage className="text-blue-600" />
          {isAdmin ? "Order Management" : "My Orders"}
        </h1>

        {/* Search Input (admin-only) */}
        {isAdmin && <div className="mb-4 flex justify-end relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="border p-2 pr-8 rounded"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute inset-y-0 right-0 flex items-center pr-2 text-gray-500 hover:text-gray-700"
                >
                  <FiXCircle />
                </button>
              )}
            </div>
        }

        {orders.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <FiPackage className="mx-auto h-12 w-12 mb-4 text-gray-400" />
            <p className="text-lg font-medium">
              {isAdmin ? "No orders found" : "You have no orders"}
            </p>
            <p className="mt-1">
              {isAdmin
                ? "New orders will appear here once placed."
                : "Your orders will appear here after you make a purchase."}
            </p>
          </div>
        ) : (
          <>
            {/* Mobile View */}
            <div ref={ordersListRef} className="sm:hidden">
              {orders.map((order: any) => (
                <div
                  key={order._id + order.receiptUrl} 
                  data-order-id={order._id}  // used for scrolling to the matching order
                  className="bg-white rounded-xl shadow-lg p-4 mb-4"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        #{order._id.toUpperCase()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        order.shippingStatus === "Delivered"
                          ? "bg-green-100 text-green-800"
                          : order.shippingStatus === "Cancelled"
                          ? "bg-red-100 text-red-800"
                          : order.shippingStatus === "Refunded"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {order.shippingStatus === "Delivered" && <FiCheckCircle className="mr-1" />}
                      {order.shippingStatus === "Cancelled" && <FiXCircle className="mr-1" />}
                      {order.shippingStatus === "Refunded" && <FiRefreshCw className="mr-1" />}
                      {order.shippingStatus}
                    </span>
                  </div>

                  {isAdmin && (
                    <div className="mt-2">
                      <div className="text-sm text-gray-900 font-medium">
                        {order.user?.username}
                      </div>
                      <div className="text-xs text-gray-500">
                        {order.user?.email}
                      </div>
                      {order?.shippingDetails.phone && (
                        <div className="text-xs text-blue-600 mt-1">
                          {order?.shippingDetails.phone}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-2">
                    {order.products.map((prod: any) => (
                      <div key={prod.product + prod.title + prod.color + prod.size} className="flex items-center gap-2 mb-2">
                        <img
                          src={prod.image}
                          alt={prod.title}
                          className="w-12 h-12 object-cover rounded-lg border-2 border-white shadow-sm"
                        />
                        <div>
                          <div className="text-sm font-medium">{prod.title}</div>
                          <div className="text-xs text-gray-500">{prod.quantity}x</div>
                          <div className="flex gap-1">
                            {prod.color && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                {prod.color}
                              </span>
                            )}
                            {prod.size && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                {prod.size}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-2 flex items-center gap-1">
                    <FiDollarSign className="text-green-600" />
                    <span className="font-semibold text-gray-900">
                      {(order.totalAmount / 100).toFixed(2)}
                    </span>
                  </div>

                  {isAdmin ? (
                    <>
                      <div className="mt-2">
                        <select
                          value={order.shippingStatus}
                          onChange={(e) =>
                            handleStatusChange(order._id, e.target.value as ShippingStatus)
                          }
                          className="block w-full pl-2 pr-8 py-1 text-xs border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        >
                          {Object.values(ShippingStatus).map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </div>
                      {order.shippingStatus === "Delivered" &&
                        order.refundDetails &&
                        order.refundDetails.adminRefundApproval === "Pending" && (
                          <div className="mt-2 flex gap-2">
                            <button
                              onClick={() => handleRefundAction(order._id, "Approved")}
                              className="flex items-center gap-1 w-full px-3 py-2 text-sm bg-green-50 text-green-700 rounded-md hover:bg-green-100 transition"
                            >
                              <FiCheckCircle />
                              Approve Refund
                            </button>
                            <button
                              onClick={() => handleRefundAction(order._id, "Rejected")}
                              className="flex items-center gap-1 w-full px-3 py-2 text-sm bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition"
                            >
                              <FiXCircle />
                              Reject Refund
                            </button>
                          </div>
                        )}
                    </>
                  ) : (
                    <div className="mt-2">
                      {order.shippingStatus === "Pending" && (
                        <button
                          onClick={() => handleRequestAction(order._id, "cancel")}
                          className="w-full px-3 py-2 text-sm bg-yellow-50 text-yellow-700 rounded-md hover:bg-yellow-100 transition"
                        >
                          Request Cancellation
                        </button>
                      )}
                      {(order.shippingStatus === "Delivered" || order.shippingStatus === "Refunded") && (
                        <>
                          {order.shippingStatus === "Refunded" ? (
                            <span className="block px-3 py-2 text-sm text-green-600">
                              Refund Approved
                            </span>
                          ) : order.refundDetails?.adminRefundApproval ? (
                            order.refundDetails.adminRefundApproval === "Pending" ? (
                              <span className="block px-3 py-2 text-sm text-blue-600">
                                Refund Request Submitted
                              </span>
                            ) : order.refundDetails.adminRefundApproval === "Rejected" ? (
                              <span className="block px-3 py-2 text-sm text-red-600">
                                Refund Request Rejected
                              </span>
                            ) : null
                          ) : (
                            <button
                              onClick={() => handleRequestAction(order._id, "refund")}
                              className="w-full px-3 py-2 text-sm bg-yellow-50 text-yellow-700 rounded-md hover:bg-yellow-100 transition"
                            >
                              Request Refund
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop View */}
            <div className="hidden sm:block">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Order
                        </th>
                        {isAdmin && (
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Customer
                          </th>
                        )}
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Products
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          {isAdmin ? "Actions" : "Request"}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {orders.map((order: any) => (
                        <tr key={order._id + order.receiptUrl} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium text-gray-900">
                              #{order._id.toUpperCase().slice(0, 8)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </div>
                          </td>
                          {isAdmin && (
                            <td className="px-4 py-3">
                              <div className="flex flex-col">
                                <span className="font-medium text-gray-900">
                                  {order.user?.username}
                                </span>
                                <span className="text-xs text-gray-500 truncate">
                                  {order.user?.email}
                                </span>
                                {order?.shippingDetails.phone && (
                                  <span className="text-xs text-blue-600 mt-1">
                                    {order?.shippingDetails.phone}
                                  </span>
                                )}
                              </div>
                            </td>
                          )}
                          <td className="px-4 py-3 max-w-xs">
                            {order.products.map((prod: any) => (
                              <div key={prod.product + prod.title + prod.color + prod.quantity + prod.size} className="flex items-start gap-3 py-2">
                                <div className="relative flex-shrink-0">
                                  <img
                                    src={prod.image}
                                    alt={prod.title}
                                    className="w-14 h-14 object-cover rounded-lg border-2 border-white shadow-sm"
                                  />
                                  <span className="absolute -bottom-1 -right-1 bg-white px-1.5 py-0.5 rounded-full text-xs shadow border">
                                    {prod.quantity}x
                                  </span>
                                </div>
                                <div className="flex-1">
                                  <h4 className="text-sm font-medium text-gray-900">
                                    {prod.title}
                                  </h4>
                                  <div className="flex gap-2 mt-1">
                                    {prod.color && (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                        {prod.color}
                                      </span>
                                    )}
                                    {prod.size && (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                        {prod.size}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <FiDollarSign className="text-green-600" />
                              <span className="font-semibold text-gray-900">
                                {(order.totalAmount / 100).toFixed(2)}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                  order.shippingStatus === "Delivered"
                                    ? "bg-green-100 text-green-800"
                                    : order.shippingStatus === "Cancelled"
                                    ? "bg-red-100 text-red-800"
                                    : order.shippingStatus === "Refunded"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {order.shippingStatus === "Delivered" && <FiCheckCircle className="mr-1" />}
                                {order.shippingStatus === "Cancelled" && <FiXCircle className="mr-1" />}
                                {order.shippingStatus === "Refunded" && <FiRefreshCw className="mr-1" />}
                                {order.shippingStatus}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 space-y-2 min-w-[200px]">
                            {isAdmin ? (
                              <>
                                <select
                                  value={order.shippingStatus}
                                  onChange={(e) =>
                                    handleStatusChange(order._id, e.target.value as ShippingStatus)
                                  }
                                  className="block w-full pl-3 pr-8 py-2 text-sm border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white hover:bg-gray-50 transition-colors"
                                >
                                  {Object.values(ShippingStatus).map((status) => (
                                    <option key={status} value={status}>
                                      {status}
                                    </option>
                                  ))}
                                </select>
                                {order.shippingStatus === "Delivered" &&
                                  order.refundDetails &&
                                  order.refundDetails.adminRefundApproval === "Pending" && (
                                    <div className="flex flex-col gap-2 mt-2">
                                      <button
                                        onClick={() => handleRefundAction(order._id, "Approved")}
                                        className="flex items-center justify-center gap-1 w-full px-3 py-2 text-sm bg-green-50 text-green-700 rounded-md hover:bg-green-100 transition"
                                      >
                                        <FiCheckCircle />
                                        Approve Refund
                                      </button>
                                      <button
                                        onClick={() => handleRefundAction(order._id, "Rejected")}
                                        className="flex items-center justify-center gap-1 w-full px-3 py-2 text-sm bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition"
                                      >
                                        <FiXCircle />
                                        Reject Refund
                                      </button>
                                    </div>
                                  )}
                              </>
                            ) : (
                              <>
                                {order.shippingStatus === "Pending" && (
                                  <button
                                    onClick={() => handleRequestAction(order._id, "cancel")}
                                    className="w-full px-3 py-2 text-sm bg-yellow-50 text-yellow-700 rounded-md hover:bg-yellow-100 transition"
                                  >
                                    Request Cancellation
                                  </button>
                                )}
                                {(order.shippingStatus === "Delivered" ||
                                  order.shippingStatus === "Refunded") && (
                                  <>
                                    {order.shippingStatus === "Refunded" ? (
                                      <span className="block px-3 py-2 text-sm text-green-600">
                                        Refund Approved
                                      </span>
                                    ) : order.refundDetails?.adminRefundApproval ? (
                                      order.refundDetails.adminRefundApproval === "Pending" ? (
                                        <span className="block px-3 py-2 text-sm text-blue-600">
                                          Refund Request Submitted
                                        </span>
                                      ) : order.refundDetails.adminRefundApproval === "Rejected" ? (
                                        <span className="block px-3 py-2 text-sm text-red-600">
                                          Refund Request Rejected
                                        </span>
                                      ) : null
                                    ) : (
                                      <button
                                        onClick={() => handleRequestAction(order._id, "refund")}
                                        className="w-full px-3 py-2 text-sm bg-yellow-50 text-yellow-700 rounded-md hover:bg-yellow-100 transition"
                                      >
                                        Request Refund
                                      </button>
                                    )}
                                  </>
                                )}
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                <div className="mt-6 flex flex-col sm:flex-row justify-between items-center px-4 py-3 bg-white border-t border-gray-200 rounded-b-lg">
                  <div className="mb-2 sm:mb-0">
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{startItem}</span> to{" "}
                      <span className="font-medium">{endItem}</span> of{" "}
                      <span className="font-medium">{pagination.total || 0}</span> results
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => goToPage(page - 1)}
                      disabled={page <= 1}
                      className="px-3 py-1 rounded-md bg-gray-50 text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    {Array.from({ length: pagination.pages || 1 }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => goToPage(i + 1)}
                        className={`px-3 py-1 rounded-md ${
                          page === i + 1
                            ? "bg-blue-500 text-white"
                            : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => goToPage(page + 1)}
                      disabled={page >= (pagination.pages || 1)}
                      className="px-3 py-1 rounded-md bg-gray-50 text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
