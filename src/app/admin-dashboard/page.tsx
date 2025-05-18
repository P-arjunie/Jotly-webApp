'use client';

import React, { useEffect, useState } from 'react';
import { fetchUsers, updateUserRole, deleteUser } from '../utils/admin-api';
import { useRouter } from 'next/navigation';

type User = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
};

type PaginationInfo = {
  totalUsers: number;
  totalPages: number;
  currentPage: number;
  limit: number;
};

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    totalUsers: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 10,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  // Load users on component mount and when pagination changes
  useEffect(() => {
    loadUsers(pagination.currentPage, pagination.limit);
  }, [pagination.currentPage, pagination.limit]);

  const loadUsers = async (page: number, limit: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchUsers(page, limit);
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (err: any) {
      setError(err.message || 'Failed to load users');
      
      // Redirect to login if unauthorized
      if (err.message.includes('Authentication required') || 
          err.message.includes('Unauthorized') ||
          err.message.includes('Forbidden')) {
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, currentPage: newPage }));
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'user' | 'admin') => {
    try {
      setError(null);
      await updateUserRole(userId, newRole);
      
      // Update the user list to reflect the change
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user, role: newRole } : user
        )
      );
    } catch (err: any) {
      setError(err.message || 'Failed to update user role');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    
    try {
      setError(null);
      await deleteUser(userId);
      
      // Remove user from the list
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
      
      // Update pagination if necessary
      if (users.length === 1 && pagination.currentPage > 1) {
        handlePageChange(pagination.currentPage - 1);
      } else {
        // Reload current page to ensure proper pagination
        loadUsers(pagination.currentPage, pagination.limit);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete user');
    }
  };

  const openUserModal = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const closeUserModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">User Management</h2>
          <p className="text-gray-600 text-sm">
            Total Users: {pagination.totalUsers}
          </p>
        </div>

        {/* User Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {user.name || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select 
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value as 'user' | 'admin')}
                      className="text-sm rounded border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => openUserModal(user)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              
              {users.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  pagination.currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  pagination.currentPage === pagination.totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(pagination.currentPage - 1) * pagination.limit + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(pagination.currentPage * pagination.limit, pagination.totalUsers)}
                  </span>{' '}
                  of <span className="font-medium">{pagination.totalUsers}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                      pagination.currentPage === 1
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    &laquo; Previous
                  </button>
                  
                  {/* Page numbers logic */}
                  {[...Array(pagination.totalPages)].map((_, idx) => {
                    const pageNumber = idx + 1;
                    // Show current page, first, last, and pages around current
                    if (
                      pageNumber === 1 ||
                      pageNumber === pagination.totalPages ||
                      (pageNumber >= pagination.currentPage - 1 && pageNumber <= pagination.currentPage + 1)
                    ) {
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => handlePageChange(pageNumber)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            pageNumber === pagination.currentPage
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    } else if (
                      pageNumber === pagination.currentPage - 2 ||
                      pageNumber === pagination.currentPage + 2
                    ) {
                      return (
                        <span
                          key={pageNumber}
                          className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                        >
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                  
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                      pagination.currentPage === pagination.totalPages
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    Next &raquo;
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">User Details</h3>
                <button onClick={closeUserModal} className="text-gray-500 hover:text-gray-700">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">ID</p>
                  <p className="font-medium">{selectedUser.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{selectedUser.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{selectedUser.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Role</p>
                  <p className="font-medium capitalize">{selectedUser.role}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Created At</p>
                  <p className="font-medium">{new Date(selectedUser.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last Updated</p>
                  <p className="font-medium">{new Date(selectedUser.updatedAt).toLocaleString()}</p>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={closeUserModal}
                  className="px-4 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}