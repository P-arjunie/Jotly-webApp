import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { adminMiddleware } from "../../../../middleware/auth-middleware";

const prisma = new PrismaClient();

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