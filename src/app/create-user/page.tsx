'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  CheckCircle, XCircle, Loader2, Plus, User, Building, CreditCard, DollarSign, 
  Calendar, FileText, Users, Trash2, Sparkles, TrendingUp, Shield, Zap, 
  Star, ArrowRight, Eye, EyeOff, Activity, Target, Award, Menu, X
} from 'lucide-react';
import { useNavigation } from '../NavigationLoaderProvider'; // Adjust path as necessary

type Transaction = {
  amount: string;
  from: string;
  note: string;
  belongsTo: string;
  date: string;
};

type TransactionKey = keyof Transaction;

export default function CreateUserPage() {
   const { navigate } = useNavigation();
  const [form, setForm] = useState({
    username: '',
    accountNumber: '',
    bankName: '',
    openingBalance: '',
    useOldBreakup: false,
  });

  const [initialTxns, setInitialTxns] = useState<Transaction[]>([
    { amount: '', from: '', note: '', belongsTo: '', date: '' }
  ]);

  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  const [showBalance, setShowBalance] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [particles, setParticles] = useState<React.JSX.Element[]>([]);


useEffect(() => {
  setIsVisible(true);

  const generatedParticles = [...Array(12)].map((_, i) => (
    <div
      key={i}
      className="absolute w-1 h-1 sm:w-2 sm:h-2 bg-gradient-to-r from-[#c6b7fc] to-purple-400 rounded-full opacity-20"
      style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animation: `float ${3 + Math.random() * 2}s ease-in-out infinite, fadeInOut ${4 + Math.random() * 2}s ease-in-out infinite`,
        animationDelay: `${Math.random() * 2}s`
      }}
    />
  ));
  
  setParticles(generatedParticles);
}, []);

  const showNotification = (type: string, message: string) => {
    setNotification({ show: true, type, message });
    setTimeout(() => setNotification({ show: false, type: '', message: '' }), 5000);
  };

  const handleTxnChange = (index: number, key: TransactionKey, value: string) => {
    const copy = [...initialTxns];
    copy[index][key] = value;
    setInitialTxns(copy);
  };

  const addTxn = () => {
    setInitialTxns([
      ...initialTxns,
      { amount: '', from: '', note: '', belongsTo: '', date: '' },
    ]);
  };

  const removeTxn = (index: number) => {
    if (initialTxns.length > 1) {
      setInitialTxns(initialTxns.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const body = {
        ...form,
        openingBalance: parseFloat(parseFloat(form.openingBalance).toFixed(2)),
        initialTransactions: form.useOldBreakup
          ? initialTxns.map(txn => ({
              ...txn,
              type: 'credit',
              id: '',
            }))
          : [],
      };

      const res = await fetch('/api/create-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const result = await res.json();
      
      if (res.ok) {
        showNotification('success', result.message || 'User created successfully!');
        setTimeout(() => {
          navigate('/users');
        }, 1500);
      } else {
        showNotification('error', result.message || 'Failed to create user. Please try again.');
      }
    } catch (error) {
      showNotification('error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: string) => {
    if (!value) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(parseFloat(value));
  };

  const totalTransactions = initialTxns.reduce(
    (sum, txn) => sum + (parseFloat(txn.amount) || 0), 
    0
  );

  const completedFields = [
    form.username,
    form.accountNumber,
    form.bankName,
    form.openingBalance
  ].filter(Boolean).length;

  const progressPercentage = (completedFields / 4) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 relative overflow-hidden">
      {/* Enhanced Animated Background Elements - Mobile Optimized */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 sm:-top-40 sm:-right-40 w-40 h-40 sm:w-80 sm:h-80 bg-gradient-to-br from-[#c6b7fc]/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-20 -left-20 sm:-bottom-40 sm:-left-40 w-40 h-40 sm:w-80 sm:h-80 bg-gradient-to-br from-indigo-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 sm:w-96 sm:h-96 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
      </div>

{/* Floating Particles rendered only on client to prevent hydration mismatch */}
<div className="absolute inset-0 pointer-events-none">
  {particles}
</div>


      {/* Enhanced Mobile-Optimized Notification */}
      {notification.show && (
        <div className={`fixed top-4 left-4 right-4 sm:top-6 sm:right-6 sm:left-auto z-50 flex items-center p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-2xl backdrop-blur-sm border transition-all duration-500 transform ${
          notification.type === 'success' 
            ? 'bg-emerald-50/95 border-emerald-200 text-emerald-800 translate-y-0' 
            : 'bg-red-50/95 border-red-200 text-red-800 translate-y-0'
        } animate-slideInDown`}>
          <div className={`p-1 rounded-full mr-3 flex-shrink-0 ${
            notification.type === 'success' ? 'bg-emerald-100' : 'bg-red-100'
          }`}>
            {notification.type === 'success' ? (
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
            ) : (
              <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
            )}
          </div>
          <span className="font-semibold text-sm sm:text-base">{notification.message}</span>
        </div>
      )}

      <div className="max-w-5xl mx-auto py-6 px-4 sm:py-12 relative z-10">
        {/* Enhanced Mobile-First Header */}
        <div className={`text-center mb-8 sm:mb-12 transition-all duration-1000 transform ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#c6b7fc] to-purple-600 rounded-2xl sm:rounded-3xl mb-4 sm:mb-6 shadow-lg relative animate-bounce">
            <User className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center animate-pulse">
              <Sparkles className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
            </div>
          </div>
          
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-[#c6b7fc] to-purple-800 bg-clip-text text-transparent mb-3 sm:mb-4 animate-slideInUp">
            Create New User
          </h1>
          <p className="text-base sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed px-4 animate-slideInUp" style={{ animationDelay: '0.2s' }}>
            Set up a new user account with advanced banking features and detailed transaction tracking
          </p>
          
          {/* Enhanced Mobile Progress Bar */}
          <div className="mt-6 sm:mt-8 max-w-md mx-auto px-4 animate-slideInUp" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm font-medium text-gray-600">Form Progress</span>
              <span className="text-xs sm:text-sm font-medium text-[#c6b7fc]">{Math.round(progressPercentage)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-[#c6b7fc] to-purple-600 h-full rounded-full transition-all duration-700 ease-out relative overflow-hidden"
                style={{ width: `${progressPercentage}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Mobile-First Main Form Card */}
        <div className={`bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl border border-white/50 overflow-hidden relative transition-all duration-1000 transform ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
        }`} style={{ animationDelay: '0.5s' }}>
          {/* Enhanced Gradient Border Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#c6b7fc]/20 via-purple-500/20 to-pink-500/20 rounded-2xl sm:rounded-3xl blur-sm -z-10 animate-pulse"></div>
          
          <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-8 sm:space-y-10">
            {/* Enhanced Mobile Basic Information */}
            <div className="space-y-6 sm:space-y-8">
              <div className="flex items-center mb-4 sm:mb-6 animate-slideInLeft">
                <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#c6b7fc] to-purple-600 rounded-xl sm:rounded-2xl mr-3 sm:mr-4 animate-pulse">
                  <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Basic Information</h2>
                  <p className="text-sm sm:text-base text-gray-600">Essential account details</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                {[
                  { key: 'username', label: 'Full Name', icon: User, placeholder: 'Enter your full name', type: 'text', iconColor: 'yellow' },
                  { key: 'accountNumber', label: 'Account Number', icon: CreditCard, placeholder: 'Enter account number', type: 'text', iconColor: 'green' },
                  { key: 'bankName', label: 'Bank Name', icon: Building, placeholder: 'Enter bank name', type: 'text', iconColor: 'purple' },
                  { key: 'openingBalance', label: 'Opening Balance', icon: DollarSign, placeholder: '0.00', type: 'number', iconColor: 'emerald' }
                ].map((field, index) => (
                  <div key={field.key} className="space-y-3 animate-slideInUp" style={{ animationDelay: `${0.1 * (index + 1)}s` }}>
                    <label className="block text-sm font-semibold text-gray-700 flex items-center">
                      <Star className={`w-3 h-3 sm:w-4 sm:h-4 mr-2 text-${field.iconColor}-500`} />
                      {field.label}
                    </label>
                    <div className="relative group">
                      <field.icon className="absolute left-3 sm:left-4 top-3 sm:top-4 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-focus-within:text-[#c6b7fc] transition-all duration-200" />
                      <input
                        className={`w-full pl-10 text-black sm:pl-12 pr-4 py-3 sm:py-4 border-2 rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-[#c6b7fc]/20 focus:border-[#c6b7fc] transition-all duration-200 bg-white/50 backdrop-blur-sm text-sm sm:text-base ${
                          focusedField === field.key ? 'border-[#c6b7fc] shadow-lg transform scale-105' : 'border-gray-200'
                        }`}
                        type={field.type}
                        step={field.type === 'number' ? '0.01' : undefined}
                        placeholder={field.placeholder}
                        value={form[field.key as keyof typeof form] as string}
                        onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                        onFocus={() => setFocusedField(field.key)}
                        onBlur={() => setFocusedField('')}
                        required
                      />
                      {field.key === 'openingBalance' && (
                        <button
                          type="button"
                          onClick={() => setShowBalance(!showBalance)}
                          className="absolute right-3 sm:right-4 top-3 sm:top-4 text-gray-400 hover:text-[#c6b7fc] transition-colors"
                        >
                          {showBalance ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                        </button>
                      )}
                    </div>
                    {field.key === 'openingBalance' && form.openingBalance && (
                      <div className="text-xs sm:text-sm text-gray-600 bg-gray-50 rounded-lg p-2 sm:p-3 animate-fadeIn">
                        Formatted: {formatCurrency(form.openingBalance)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Enhanced Mobile Transaction Toggle */}
            <div className="border-t border-gray-200 pt-8 sm:pt-10">
              <div className="p-4 sm:p-6 bg-gradient-to-r from-[#c6b7fc]to-purple-50 rounded-xl sm:rounded-2xl border border-[#c6b7fc] animate-slideInUp">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 sm:space-x-4 flex-1">
                    <input
                      type="checkbox"
                      id="useOldBreakup"
                      checked={form.useOldBreakup}
                      onChange={e => setForm({ ...form, useOldBreakup: e.target.checked })}
                      className="w-5 h-5 sm:w-6  sm:h-6 text-[#c6b7fc] bg-white border-2 border-gray-300 rounded-lg focus:ring-[#c6b7fc] focus:ring-2 transition-all duration-200"
                    />
                    <div className="flex-1">
                      <label htmlFor="useOldBreakup" className="flex items-center text-base sm:text-lg font-semibold text-gray-800 cursor-pointer">
                        <Zap className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-yellow-500 animate-pulse" />
                        Add Initial Transaction Breakup
                      </label>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1">Break down the opening balance</p>
                    </div>
                  </div>
                  <ArrowRight className={`w-5 h-5 sm:w-6 sm:h-6 text-[#c6b7fc] transition-transform duration-300 ${form.useOldBreakup ? 'rotate-90' : ''}`} />
                </div>
              </div>
            </div>

            {/* Enhanced Mobile Initial Transactions */}
            {form.useOldBreakup && (
              <div className="space-y-6 sm:space-y-8 animate-slideInUp">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 bg-gradient-to-r from-gray-50 to-[#c6b7fc]rounded-xl sm:rounded-2xl gap-4">
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center">
                      <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-[#c6b7fc] mr-2 sm:mr-3" />
                      Initial Transactions
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 mt-1">
                      Total: <span className="font-semibold text-[#c6b7fc]">{formatCurrency(totalTransactions.toString())}</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addTxn}
                    className="w-full sm:w-auto inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 text-sm font-semibold text-white bg-gradient-to-r from-[#c6b7fc] to-purple-600 rounded-lg sm:rounded-xl hover:from-[#c6b7fc] hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Transaction
                  </button>
                </div>

                <div className="space-y-6">
                  {initialTxns.map((txn, i) => (
                    <div key={i} className="bg-gradient-to-br from-white to-gray-50 rounded-xl sm:rounded-2xl p-4 sm:p-8 border-2 border-gray-100 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.01] animate-slideInUp" style={{ animationDelay: `${0.1 * i}s` }}>
                      <div className="flex items-center justify-between mb-4 sm:mb-6">
                        <h4 className="font-semibold text-gray-900 flex items-center text-base sm:text-lg">
                          <span className="inline-flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-[#c6b7fc] to-purple-600 text-white text-xs sm:text-sm font-bold rounded-full mr-2 sm:mr-3 animate-pulse">
                            {i + 1}
                          </span>
                          Transaction Details
                        </h4>
                        {initialTxns.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeTxn(i)}
                            className="text-red-500 hover:text-red-700 p-2 rounded-xl hover:bg-red-50 transition-all duration-200 transform hover:scale-110 active:scale-95"
                          >
                            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {[
                          { key: 'amount', label: 'Amount', icon: DollarSign, type: 'number', placeholder: '0.00' },
                          { key: 'from', label: 'From', icon: User, type: 'text', placeholder: 'Source' },
                          { key: 'belongsTo', label: 'Belongs To', icon: Users, type: 'text', placeholder: 'Owner' },
                          { key: 'date', label: 'Date', icon: Calendar, type: 'date', placeholder: '' },
                          { key: 'note', label: 'Note', icon: FileText, type: 'text', placeholder: 'Transaction note', colSpan: 'sm:col-span-2 lg:col-span-2' }
                        ].map((field, fieldIndex) => (
                          <div key={field.key} className={`space-y-2 sm:space-y-3 ${field.colSpan || ''} animate-slideInUp`} style={{ animationDelay: `${0.05 * fieldIndex}s` }}>
                            <label className="block text-xs sm:text-sm font-semibold text-gray-700">{field.label}</label>
                            <div className="relative">
                              <field.icon className="absolute left-2 sm:left-3 top-2 sm:top-3 w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                              <input
                                className="w-full pl-8 text-black sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 text-xs sm:text-sm border-2 border-gray-200 rounded-lg sm:rounded-xl focus:ring-4 focus:ring-[#c6b7fc]/20 focus:border-[#c6b7fc] transition-all duration-200 bg-white/70 hover:bg-white/90 focus:bg-white"
                                type={field.type}
                                step={field.type === 'number' ? '0.01' : undefined}
                                placeholder={field.placeholder}
                                value={txn[field.key as TransactionKey]}
                                onChange={e => handleTxnChange(i, field.key as TransactionKey, e.target.value)}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Enhanced Mobile Submit Button */}
            <div className="border-t border-gray-200 pt-8 sm:pt-10">
              <button
                type="submit"
                disabled={loading}
                className="w-full group relative overflow-hidden bg-gradient-to-r from-[#c6b7fc] via-purple-600 to-[#c6b7fc] text-white font-bold py-4 sm:py-6 px-6 sm:px-8 rounded-xl sm:rounded-2xl shadow-2xl hover:shadow-3xl focus:outline-none focus:ring-4 focus:ring-[#c6b7fc]/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] animate-slideInUp"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#c6b7fc] via-purple-700 to-[#c6b7fc] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <div className="relative flex items-center justify-center">
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 animate-spin" />
                      <span className="text-sm sm:text-lg">Creating User Account...</span>
                    </>
                  ) : (
                    <>
                      <User className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                      <span className="text-sm sm:text-lg">Create User Account</span>
                      <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 ml-2 sm:ml-3 group-hover:translate-x-1 transition-transform duration-200" />
                    </>
                  )}
                </div>
              </button>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        
        @keyframes fadeInOut {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.6; }
        }
        
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .animate-slideInUp {
          animation: slideInUp 0.6s ease-out forwards;
        }

        .animate-slideInDown {
          animation: slideInDown 0.5s ease-out forwards;
        }

        .animate-slideInLeft {
          animation: slideInLeft 0.6s ease-out forwards;
        }

        .animate-scaleIn {
          animation: scaleIn 0.5s ease
-out forwards;
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }

        .animate-shimmer {
          animation: shimmer 1.5s linear infinite;
        }

        .animate-slideInRight {
          animation: slideInLeft 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
} 

{/* Enhanced Floating Particles */}