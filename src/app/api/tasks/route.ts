import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, description, completed, dueDate, dueTime } = body;

  const authHeader = req.headers.get('authorization');
  if (!authHeader) {
    return NextResponse.json({ error: 'No token provided' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;

    const task = await prisma.tasks.create({
      data: {
        title,
        description,
        completed,
        dueDate: new Date(dueDate),
        dueTime: new Date(dueTime),
        userId, // associate with logged-in user
      },
    });

    return NextResponse.json(task, { status: 201 });

  } catch (err) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 403 });
  }
}
