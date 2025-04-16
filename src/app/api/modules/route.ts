import { getServerSession } from 'next-auth/next';
import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { generateAllModules, getModuleById } from '@/lib/moduleGenerator';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const moduleId = searchParams.get('id');
    const useGenerated = searchParams.get('generated') === 'true';

    // Use generated modules if specified or if database is empty
    if (useGenerated) {
      if (moduleId) {
        const module = getModuleById(moduleId);
        if (!module) {
          return NextResponse.json({ error: 'Module not found' }, { status: 404 });
        }
        return NextResponse.json(module);
      }

      const modules = generateAllModules();
      return NextResponse.json(modules);
    }

    // Otherwise, try to get modules from the database
    try {
      const modules = await prisma.module.findMany({
        orderBy: {
          order: 'asc',
        },
        include: {
          activities: {
            orderBy: {
              order: 'asc',
            },
            select: {
              id: true,
              title: true,
              type: true,
              order: true,
            },
          },
        },
      });

      // If no modules in database, fall back to generated modules
      if (modules.length === 0) {
        const generatedModules = generateAllModules();
        return NextResponse.json(generatedModules);
      }

      return NextResponse.json(modules);
    } catch (dbError) {
      console.error('Database error, falling back to generated modules:', dbError);
      const generatedModules = generateAllModules();
      return NextResponse.json(generatedModules);
    }
  } catch (error) {
    console.error('Error fetching modules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch modules' },
      { status: 500 }
    );
  }
}
