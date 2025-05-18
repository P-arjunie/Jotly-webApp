// app/api/tasks/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// PATCH /api/tasks/[id]
export async function PATCH(req: NextRequest, context: any) {
  const { params } = context;
  const taskId = params?.id;

  if (!taskId) {
    return NextResponse.json({ error: 'Task ID missing' }, { status: 400 });
  }

  const authHeader = req.headers.get('authorization');
  if (!authHeader) {
    return NextResponse.json({ error: 'No token provided' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;

    const task = await prisma.tasks.findUnique({
      where: { id: parseInt(taskId) },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    if (task.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { completed } = await req.json();

    const updatedTask = await prisma.tasks.update({
      where: { id: parseInt(taskId) },
      data: { completed },
    });

    return NextResponse.json(updatedTask);
  } catch (err) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 403 });
  }
}



// DELETE /api/tasks/[id]
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const taskId = params.id;
  const authHeader = req.headers.get('authorization');

  if (!authHeader) {
    return NextResponse.json({ error: 'No token provided' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;

    const task = await prisma.tasks.findUnique({
      where: { id: parseInt(taskId) },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    if (task.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await prisma.tasks.delete({
      where: { id: parseInt(taskId) },
    });

    return NextResponse.json({ message: 'Task deleted' }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 403 });
  }
}
