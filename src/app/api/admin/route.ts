import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { adminMiddleware } from "../../middleware/auth-middleware";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  // Check if the user is an admin
  const middlewareResponse = await adminMiddleware(req);
  if (middlewareResponse instanceof NextResponse) {
    return middlewareResponse; // Return the error response if not admin
  }

  try {
    // Fetch all users with pagination
    const page = parseInt(req.nextUrl.searchParams.get('page') || '1');
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Get total count for pagination info
    const totalUsers = await prisma.users.count();

    // Get users with pagination, excluding password field
    const users = await prisma.users.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        // password explicitly omitted for security
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc', // Most recent users first
      },
    });

    return NextResponse.json({
      users,
      pagination: {
        totalUsers,
        totalPages: Math.ceil(totalUsers / limit),
        currentPage: page,
        limit,
      }
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" }, 
      { status: 500 }
    );
  }
}

// Add an endpoint to get a single user by ID
export async function POST(req: NextRequest) {
  // Check if the user is an admin
  const middlewareResponse = await adminMiddleware(req);
  if (middlewareResponse instanceof NextResponse) {
    return middlewareResponse;
  }

  try {
    const { userId } = await req.json();
    
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" }, 
        { status: 400 }
      );
    }

    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" }, 
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" }, 
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  // Check if the user is an admin
  const middlewareResponse = await adminMiddleware(req);
  if (middlewareResponse instanceof NextResponse) {
    return middlewareResponse;
  }

  try {
    const { userId, role } = await req.json();
    
    if (!userId || !role) {
      return NextResponse.json(
        { error: "User ID and role are required" }, 
        { status: 400 }
      );
    }

    // Validate role
    if (role !== "user" && role !== "admin") {
      return NextResponse.json(
        { error: "Invalid role. Must be 'user' or 'admin'" }, 
        { status: 400 }
      );
    }

    // Update user role
    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      },
    });

    return NextResponse.json({ 
      message: "User role updated successfully", 
      user: updatedUser 
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    
    // Check if the error is due to user not found
    if (typeof error === "object" && error !== null && "code" in error && (error as any).code === 'P2025') {
      return NextResponse.json(
        { error: "User not found" }, 
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to update user role" }, 
      { status: 500 }
    );
  }
}

// Add ability to delete users
export async function DELETE(req: NextRequest) {
  // Check if the user is an admin
  const middlewareResponse = await adminMiddleware(req);
  if (middlewareResponse instanceof NextResponse) {
    return middlewareResponse;
  }

  try {
    const { userId } = await req.json();
    
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" }, 
        { status: 400 }
      );
    }

    // Delete the user
    await prisma.users.delete({
      where: { id: userId },
    });

    return NextResponse.json({ 
      message: "User deleted successfully" 
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    
    // Check if the error is due to user not found
    if (typeof error === "object" && error !== null && "code" in error && (error as any).code === 'P2025') {
      return NextResponse.json(
        { error: "User not found" }, 
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to delete user" }, 
      { status: 500 }
    );
  }
}