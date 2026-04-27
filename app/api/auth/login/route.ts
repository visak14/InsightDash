import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { login } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const { password: _, ...userWithoutPassword } = user;
    await login(userWithoutPassword);

    return NextResponse.json({ message: 'Logged in', user: userWithoutPassword });
  } catch (error: any) {
    console.error('Login Error:', error);
    return NextResponse.json({ 
      error: error.message || 'Internal Server Error',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}
