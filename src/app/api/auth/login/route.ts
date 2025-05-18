import { PrismaClient } from "@prisma/client"; 
import { error } from "console"; 
import jwt from "jsonwebtoken"; 
import { NextResponse } from "next/server"; 
import bcrypt from 'bcrypt';  

const prisma = new PrismaClient(); 
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret'; // Replace with your actual secret  

export async function POST(req: Request){
    const {email, password} = await req.json();
    
    const user = await prisma.users.findUnique({
        where: { email },
        select: {
            id: true,
            email: true,
            password: true,
            name: true,
            createdAt: true,
            role: true // Ensure role is selected
        }
    });
    if(!user){
        return NextResponse.json({error: 'Invalid credentials'}, {status: 401});
    }
    
    console.log("User from DB:", user);
    console.log("Input password:", password);
    console.log("Stored password:", user.password);
    
    const valid = await bcrypt.compare(password, user.password);
    if(!valid){
        return NextResponse.json({error: 'Invalid credentials'}, {status: 401});
    }
    
    // Include role in the JWT payload
    const token = jwt.sign(
        {
            userId: user.id, 
            email: user.email,
            role: user.role // Include the role in JWT token
        }, 
        JWT_SECRET, 
        {
            expiresIn:'1h',
        }
    );
    
    return NextResponse.json({
        message: 'Login successful', 
        token,
        user: {
            id: user.id,
            email: user.email,
            role: user.role // Include role in the response
        }
    }); 
}