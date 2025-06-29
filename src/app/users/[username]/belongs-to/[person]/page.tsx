'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Trash2, ArrowUpCircle, ArrowDownCircle, User, Calendar, StickyNote, Loader2, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useNavigation } from '../../../../NavigationLoaderProvider'; // Adjust path as necessary

interface Transaction {
  id?: string;
  amount: number;
  from: string;
  note: string;
  belongsTo: string;
  date: string;
  type: 'credit' | 'debit';
}
export default function BelongsToTransactionsPage() {
  const { username, person } = useParams();
  const { navigate } = useNavigation();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);

  useEffect(() => {
    if (!username || !person) return;
    
    const fetchTransactions = async () => {
      try {
        const response = await fetch(`/api/${username}/transactions`);
        if (!response.ok) throw new Error('Failed to fetch transactions');
        
        const data = await response.json();
        const filtered = (data.transactions || []).filter(
          (txn: Transaction) => txn.belongsTo.trim().toLowerCase() === 
          decodeURIComponent(Array.isArray(person) ? person[0] : person).toLowerCase()
        );
        setTransactions(filtered);
      } catch (err) {
        console.error('Error fetching transactions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [username, person]);
  const router = useRouter();
  const getTotalAmount = () => {
    let total = 0;
    transactions.forEach(txn => {
      if (txn.type === 'credit') total += txn.amount;
      else total -= txn.amount;
    });
    return total;
  };

  const handleDeleteClick = (transaction: Transaction) => {
    setTransactionToDelete(transaction);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!transactionToDelete || !username) return;
    
    setDeleteLoading(transactionToDelete.id || 'unknown');
    
    try {
      const response = await fetch(`/api/${username}/transactions/${transactionToDelete.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete transaction');
      
      // Remove from local state
      setTransactions(prev => prev.filter(txn => txn.id !== transactionToDelete.id));
      setShowDeleteModal(false);
      setTransactionToDelete(null);
    } catch (err) {
      console.error('Error deleting transaction:', err);
      alert('Failed to delete transaction. Please try again.');
    } finally {
      setDeleteLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const totalAmount = getTotalAmount();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-800 text-lg font-medium">Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-4 -left-4 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
          <div className="absolute top-32 -right-4 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-4000"></div>
        </div>

        <div className="relative z-10 py-4 sm:py-8 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            {/* Header Section */}
            <div className="text-center mb-8 sm:mb-12 animate-fade-in">
               <button
              onClick={() => navigate(`/users/${username}/belongs-to`)}
              className="group bg-white/80 backdrop-blur-lg hover:bg-white text-purple-700 hover:text-purple-800 w-12 h-12 rounded-2xl shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-300 transform hover:-translate-y-1 hover:scale-110 border border-purple-200"
              title="Back to Transactions"
            >
              <span className="text-xl group-hover:animate-bounce-x">←</span>
            </button>
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-full mb-4 sm:mb-6 shadow-2xl">
                <User className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">
                Transactions with
              </h1>
              <p className="text-xl sm:text-2xl text-indigo-700 font-semibold mb-4 sm:mb-6">
                {decodeURIComponent(person as string)}
              </p>
              
              {/* Total Amount Card */}
              <div className="inline-block bg-white/80 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-gray-200 shadow-2xl">
                <p className="text-gray-700 text-sm sm:text-lg font-medium mb-2">Total Net Amount</p>
                <div className="flex items-center justify-center gap-2 sm:gap-3">
                  {totalAmount >= 0 ? (
                    <ArrowUpCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-400" />
                  ) : (
                    <ArrowDownCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-400" />
                  )}
                  <span className={`text-2xl sm:text-4xl font-bold ${
                    totalAmount >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    ₹{Math.abs(totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <p className="text-gray-500 text-xs sm:text-sm mt-1 sm:mt-2">
                  {totalAmount >= 0 ? 'You are owed' : 'You owe'}
                </p>
              </div>
            </div>

            {/* Transactions List */}
            {transactions.length === 0 ? (
              <div className="text-center py-12 sm:py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full mb-4 sm:mb-6">
                  <AlertTriangle className="w-8 h-8 sm:w-10 sm:h-10 text-gray-500" />
                </div>
                <p className="text-gray-800 text-lg sm:text-xl font-medium">No transactions found</p>
                <p className="text-gray-600 text-sm sm:text-base mt-2">Start by adding your first transaction</p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {transactions.map((txn, idx) => (
                  <div
                    key={txn.id || idx}
                    className={`group relative bg-white/90 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:bg-white/95 animate-slide-up`}
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    {/* Transaction Type Indicator */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 sm:w-2 rounded-l-xl sm:rounded-l-2xl ${
                      txn.type === 'credit' ? 'bg-gradient-to-b from-green-400 to-green-600' : 'bg-gradient-to-b from-red-400 to-red-600'
                    }`}></div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                      {/* Amount and Type */}
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full ${
                          txn.type === 'credit' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {txn.type === 'credit' ? (
                            <ArrowUpCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                          ) : (
                            <ArrowDownCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                          )}
                        </div>
                        <div>
                          <p className={`text-xl sm:text-2xl font-bold ${
                            txn.type === 'credit' ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {txn.type === 'credit' ? '+' : '-'}₹{txn.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </p>
                          <p className="text-gray-500 text-xs sm:text-sm font-medium uppercase tracking-wide">
                            {txn.type === 'credit' ? 'Credit' : 'Debit'}
                          </p>
                        </div>
                      </div>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDeleteClick(txn)}
                        disabled={deleteLoading === txn.id}
                        className="self-end sm:self-center p-2 sm:p-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg sm:rounded-xl transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed group-hover:opacity-100 opacity-0 sm:opacity-100"
                      >
                        {deleteLoading === txn.id ? (
                          <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                        )}
                      </button>
                    </div>

                    {/* Transaction Details */}
                    <div className="mt-4 space-y-2 sm:space-y-3">
                      <div className="flex items-center gap-2 sm:gap-3 text-gray-700">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-sm sm:text-base font-medium">From: {txn.from}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 sm:gap-3 text-gray-700">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-sm sm:text-base">{formatDate(txn.date)}</span>
                      </div>

                      {txn.note && (
                        <div className="flex items-start gap-2 sm:gap-3 text-gray-700">
                          <StickyNote className="w-4 h-4 text-gray-500 mt-0.5" />
                          <span className="text-sm sm:text-base italic">{txn.note}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl animate-scale-in">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Transaction</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this transaction of ₹{Number(transactionToDelete?.amount).toFixed(2)}? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setTransactionToDelete(null);
                  }}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-xl transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deleteLoading !== null}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {deleteLoading !== null ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.6s ease-out both;
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </>
  );
}