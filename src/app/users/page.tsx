'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface User {
  name: string;
  accountNumber: string;
  bank: string;
  currentBalance: number;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/get-users')
      .then(res => res.json())
      .then(data => {
        setUsers(data.users || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-blue-700">All Users</h1>

      {loading && <p className="text-gray-500">Loading users...</p>}

      {!loading && users.length === 0 && (
        <p className="text-red-500">No users found.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {users.map((user, idx) => (
          <div key={idx} className="border rounded-xl p-6 shadow-md bg-white hover:shadow-lg transition">
            <h2 className="text-xl font-semibold text-blue-800">{user.name}</h2>
            <p className="text-sm text-gray-600">Account #: {user.accountNumber}</p>
            <p className="text-sm text-gray-600">Bank: {user.bank}</p>
            <p className="text-lg font-bold text-green-600 mt-2">
              ₹ {(user.currentBalance ?? 0).toFixed(2)}
            </p>

            <div className="mt-4 flex gap-4">
              <Link href={`/users/${user.name}`}>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                  View Transactions
                </button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
