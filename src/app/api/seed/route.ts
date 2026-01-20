import { NextResponse } from 'next/server';
import { seedUsers } from '@/seeds/users';

export async function POST() {
  try {
    await seedUsers();
    return NextResponse.json({ success: true, message: 'Users seeded successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to seed users' }, { status: 500 });
  }
}