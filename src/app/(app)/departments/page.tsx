import type { Metadata } from 'next';
import { getDepartments } from '@/features/departments/actions/departments';
import { getMembers } from '@/features/organizations/actions/data';
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { Building2 } from 'lucide-react';
import CreateDepartmentModal from '@/features/departments/components/CreateDepartmentModal';
import { DepartmentTableList } from '@/features/departments/components/DepartmentTableList';

export const metadata: Metadata = {
  title: 'Departments',
  description: "Manage your organization's departments.",
};

export const dynamic = 'force-dynamic';

export default async function DepartmentsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Retrieve user organization membership role
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single();

  const organizationId = profile?.organization_id;
  let userRole = 'Employee';

  if (organizationId) {
    const { data: membership } = await supabase
      .from('organization_members')
      .select('roles(name)')
      .eq('profile_id', user.id)
      .eq('organization_id', organizationId)
      .single();
    if (membership?.roles && typeof membership.roles === 'object' && 'name' in membership.roles) {
      userRole = membership.roles.name as string;
    }
  }

  // Fetch active + archived departments
  const activeDepartments = await getDepartments(false);
  const archivedDepartments = await getDepartments(true);
  const allDepartments = archivedDepartments;

  const members = await getMembers();

  return (
    <div className="flex-1 px-6 py-8 lg:px-10 max-w-7xl mx-auto w-full">
      <PageHeader
        title="Departments"
        description="Organize your workforce into departments for compliance tracking."
      >
        <CreateDepartmentModal members={members} />
      </PageHeader>

      {allDepartments.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No departments yet"
          description="Create your first department to start organizing your team for compliance assessments."
        >
          <CreateDepartmentModal variant="cta" members={members} />
        </EmptyState>
      ) : (
        <div className="mt-8 space-y-6">
          <DepartmentTableList
            active={activeDepartments}
            all={allDepartments}
            members={members}
            userRole={userRole}
          />
        </div>
      )}
    </div>
  );
}
