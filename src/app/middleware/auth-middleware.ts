import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "your-default-secret-key";

// Middleware to verify if the user is authenticated
export async function authMiddleware(req: NextRequest) {
  try {
    // Get the token from the Authorization header
    const authHeader = req.headers.get("Authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    
    // Verify and decode the token
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    
    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }

    // Check if user exists
    const user = await prisma.users.findUnique({
      where: { id: Number(decoded.userId) },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 401 }
      );
    }

    // Attach the user to the request for further use
    return { userId: user.id, userRole: user.role };
  } catch (error) {
    console.error("Auth middleware error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 401 }
    );
  }
}

// Middleware to verify if the user is an admin
export async function adminMiddleware(req: NextRequest) {
  const authResult = await authMiddleware(req);
  
  if (authResult instanceof NextResponse) {
    return authResult; // Return the error response if authentication failed
  }

  // Check if the user has admin role
  if (authResult.userRole !== "admin") {
    return NextResponse.json(
      { error: "Forbidden: Admin access required" },
      { status: 403 }
    );
  }

  return authResult; // Return the user info for further use
}