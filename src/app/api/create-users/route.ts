import { NextRequest, NextResponse } from 'next/server';
import { createUser } from '@/components/utils/fsHelpers';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      username,
      accountNumber,
      bankName,
      openingBalance,
      useOldBreakup = false,
      initialTransactions = []
    } = body;

    if (!username || !accountNumber || !bankName || openingBalance === undefined) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const result = await createUser(
      username,
      accountNumber,
      bankName,
      Number(openingBalance),
      useOldBreakup,
      initialTransactions
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Server error' }, { status: 500 });
  }
}
