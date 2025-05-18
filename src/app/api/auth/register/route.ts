import { Prisma, PrismaClient } from "@prisma/client";
import { error } from "console";
import { NextResponse } from "next/server";
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function POST(req:Request) {
    const {email, password, name} = await req.json();

    // ✅ Validate required fields
    if (!email || !password || typeof password !== 'string') {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    
    const exsitingUser = await prisma.users.findUnique({
        where: {email: email}
    });
    if(exsitingUser) {
        return NextResponse.json({error: 'User already exists'}, {status:400});
    }

    const hashedpassword = await bcrypt.hash(password, 10);

    const user = await prisma.users.create({
        data: {email, password: hashedpassword, name}
    });

    return NextResponse.json({message: 'User created', user : {
        id: user.id,
        email: user.email,
    }})
}