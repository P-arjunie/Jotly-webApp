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

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  
  if (!authHeader) {
    return NextResponse.json({ error: 'No token provided' }, { status: 401 });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    // Verify token
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;
    
    // Get tasks for user
    const tasks = await prisma.tasks.findMany({
      where: {
        userId,
      },
      orderBy: {
        dueDate: 'asc',
      },
    });
    
    return NextResponse.json(tasks);
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 403 });
    }
    
    console.error('Error fetching tasks:', err);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' }, 
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const taskId = params.id;
  const authHeader = req.headers.get('authorization');
  
  if (!authHeader) {
    return NextResponse.json({ error: 'No token provided' }, { status: 401 });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    // Verify token
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;
    
    // Get task to verify ownership
    const task = await prisma.tasks.findUnique({
      where: {
        id: parseInt(taskId),
      },
    });
    
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }
    
    if (task.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    // Get update data
    const { completed } = await req.json();
    
    // Update task
    const updatedTask = await prisma.tasks.update({
      where: {
        id: parseInt(taskId),
      },
      data: {
        completed,
      },
    });
    
    return NextResponse.json(updatedTask);
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 403 });
    }
    
    console.error('Error updating task:', err);
    return NextResponse.json(
      { error: 'Failed to update task' }, 
      { status: 500 }
    );
  }
}


