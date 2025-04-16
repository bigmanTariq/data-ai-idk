import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import ModuleForm from '@/components/admin/ModuleForm';

export default async function NewModulePage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user.isAdmin) {
    redirect('/login');
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Module</h1>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <ModuleForm />
        </div>
      </div>
    </div>
  );
}
