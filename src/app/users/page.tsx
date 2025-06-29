'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useNavigation } from '../NavigationLoaderProvider'; // Adjust path as necessary
import AnimatedLoader from '@/components/utils/AnimatedLoader';
interface User {
  name: string;
  accountNumber: string;
  bank: string;
  currentBalance: number;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingUser, setDeletingUser] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
     const { navigate } = useNavigation();
  
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    setLoading(true);
    fetch('/api/get-users')
      .then(res => res.json())
      .then(data => {
        setUsers(data.users || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const openDeleteModal = (username: string) => {
    setUserToDelete(username);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    setDeletingUser(userToDelete);
    try {
      const res = await fetch(`/api/${userToDelete}/delete`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        fetchUsers(); // refresh list
        closeDeleteModal();
      } else {
        console.error(data.error || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Failed to delete user');
    } finally {
      setDeletingUser(null);
    }
  };

  const getCardGradient = (index: number) => {
    const gradients = [
      'bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800',
      'bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-800',
      'bg-gradient-to-br from-emerald-600 via-teal-700 to-cyan-800',
      'bg-gradient-to-br from-rose-600 via-pink-700 to-purple-800',
      'bg-gradient-to-br from-amber-600 via-orange-700 to-red-800',
      'bg-gradient-to-br from-slate-600 via-gray-700 to-zinc-800'
    ];
    return gradients[index % gradients.length];
  };

  const formatAccountNumber = (accountNumber: string) => {
    // Format as **** **** **** 1234
    const cleaned = accountNumber.replace(/\s/g, '');
    const masked = '**** **** **** ' + cleaned.slice(-4);
    return masked;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header Section */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
           Accounts
          </h1>
          <p className="text-gray-600 text-lg mb-8">Manage all user accounts and transactions</p>
          
          {/* Create User Button */}
          <Link href="/create-user">
            <button onClick={() => navigate('/create-user')} className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-2xl bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-300">
              <span className="absolute inset-0 w-full h-full transition duration-300 ease-out transform translate-x-1 translate-y-1 bg-gradient-to-r from-blue-800 to-purple-800 rounded-2xl group-hover:translate-x-0 group-hover:translate-y-0"></span>
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl"></span>
              <span className="relative flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Account
              </span>
            </button>
          </Link>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-start justify-center ">
            <AnimatedLoader showText variant="cosmic" text="Loading Accounts..." />
          </div>
        )}

        {/* No Users State */}
        {!loading && users.length === 0 && (
          <div className="text-center py-20 animate-bounce-in">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">No Account Found</h3>
            <p className="text-gray-500">Create your first account to get started</p>
          </div>
        )}

        {/* Users Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {users.map((user, idx) => (
            <div
              key={idx}
              className="group relative transform transition-all duration-500 hover:scale-105 animate-slide-up"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              {/* Credit Card */}
              <div className={`relative w-full h-56 rounded-2xl shadow-2xl transition-all duration-300 hover:shadow-3xl ${getCardGradient(idx)}`}>
                {/* Card Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-4 right-4 w-16 h-16 rounded-full border-2 border-white"></div>
                  <div className="absolute top-8 right-8 w-8 h-8 rounded-full border-2 border-white"></div>
                  <div className="absolute bottom-4 left-4 w-12 h-12 rounded-full bg-white opacity-20"></div>
                </div>

                {/* Card Content */}
                <div className="relative h-full p-6 flex flex-col justify-between text-white">
                  {/* Top Section */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold mb-1 tracking-wide">
                        {user.bank}
                      </h3>
                      <p className="text-sm opacity-90">Banking Card</p>
                    </div>
                    <div className="flex gap-1">
                      <div className="w-8 h-5 bg-white rounded-sm opacity-80"></div>
                      <div className="w-8 h-5 bg-yellow-400 rounded-sm"></div>
                    </div>
                  </div>

                  {/* Middle Section - Account Number */}
                  <div className="my-4">
                    <p className="text-lg font-mono tracking-widest">
                      {formatAccountNumber(user.accountNumber)}
                    </p>
                  </div>

                  {/* Bottom Section */}
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xs opacity-75 mb-1">CARDHOLDER</p>
                      <p className="font-semibold text-lg capitalize">
                        {user.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs opacity-75 mb-1">BALANCE</p>
                      <p className="font-bold text-xl">
                        ₹{(user.currentBalance ?? 0).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Shine Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-all duration-1000 ease-out"></div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex gap-3">
                <Link href={`/users/${user.name}`} className="flex-1">
                  <button onClick={() => navigate(`/users/${user.name}`)} className="w-full bg-white border-2 border-blue-200 text-blue-700 px-4 py-3 rounded-xl font-medium transition-all duration-300 hover:bg-blue-50 hover:border-blue-300 hover:shadow-lg transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-300">
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Transactions
                    </span>
                  </button>
                </Link>
                <button
                  onClick={() => openDeleteModal(user.name)}
                  disabled={deletingUser === user.name}
                  className="bg-red-500 text-white px-4 py-3 rounded-xl font-medium transition-all duration-300 hover:bg-red-600 hover:shadow-lg transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deletingUser === user.name ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 animate-bounce-in">
              <div className="p-6">
                {/* Icon */}
                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>

                {/* Content */}
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Delete User Account</h3>
                  <p className="text-gray-600 mb-6">
                    Are you sure you want to delete <span className="font-semibold text-gray-900">"{userToDelete}"</span>? 
                    This action cannot be undone and will permanently remove all associated data.
                  </p>

                  {/* Buttons */}
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={closeDeleteModal}
                      className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium transition-all duration-200 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmDelete}
                      disabled={deletingUser === userToDelete}
                      className="px-6 py-3 bg-red-600 text-white rounded-xl font-medium transition-all duration-200 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {deletingUser === userToDelete ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Deleting...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete User
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes bounce-in {
          0% { opacity: 0; transform: scale(0.3); }
          50% { opacity: 1; transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { opacity: 1; transform: scale(1); }
        }
        
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        
        .animate-bounce-in {
          animation: bounce-in 0.8s ease-out;
        }
        
        .animate-slide-up {
          animation: slide-up 0.6s ease-out forwards;
          opacity: 0;
        }
        
        .shadow-3xl {
          box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25);
        }
      `}</style>
    </div>
  );
}