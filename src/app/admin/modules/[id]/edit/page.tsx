import { getServerSession } from 'next-auth/next';
import { redirect, notFound } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import ModuleForm from '@/components/admin/ModuleForm';

export default async function EditModulePage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user.isAdmin) {
    redirect('/login');
  }

  const moduleId = params.id;

  // Fetch the module
  const module = await prisma.module.findUnique({
    where: { id: moduleId },
  });

  if (!module) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Module</h1>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <ModuleForm module={module} isEditing={true} />
        </div>
      </div>
    </div>
  );
}
