import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(_: any, { params }: { params: { username: string, name: string } }) {
  const { username, name } = params;

  try {
    const filePath = path.join(process.cwd(), 'data', 'users', `${username}.json`);
    const fileData = await fs.readFile(filePath, 'utf-8');
    const parsed = JSON.parse(fileData);

    const filtered = parsed.transactions.filter((txn: any) => txn.belongsTo === name);

    // Calculate net balance from these transactions
    let balance = 0;
    filtered.forEach((txn: any) => {
      balance += txn.type === 'credit' ? txn.amount : -txn.amount;
    });

    return NextResponse.json({ transactions: filtered, netBalance: balance.toFixed(2) });
  } catch (err) {
    console.error('Error:', err);
    return NextResponse.json({ error: 'Could not load transactions' }, { status: 500 });
  }
}
