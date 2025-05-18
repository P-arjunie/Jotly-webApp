import { Prisma, PrismaClient } from "@prisma/client";
import { error } from "console";
import { NextResponse } from "next/server";
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function POST(req:Request) {
    const {email, password, name, role} = await req.json();

    // ✅ Validate required fields
    if (!email || !password || typeof password !== 'string') {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    
    // Validate role: must be either "user" or "admin"
    const validRole = role === "admin" ? "admin" : "user"; // Default to "user" if not explicitly "admin"
    
    const exsitingUser = await prisma.users.findUnique({
        where: {email: email}
    });
    if(exsitingUser) {
        return NextResponse.json({error: 'User already exists'}, {status:400});
    }

    const hashedpassword = await bcrypt.hash(password, 10);

    const user = await prisma.users.create({
        data: {
            email, 
            password: hashedpassword, 
            name,
            role: validRole // Add role to the user creation
        }
    });

    return NextResponse.json({message: 'User created', user: {
        id: user.id,
        email: user.email,
        role: user.role
    }});
}