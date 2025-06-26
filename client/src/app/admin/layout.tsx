import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { getUser } from "@/services/server/auth";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: user } = await getUser();

    if (!user?.is_staff) {
        return redirect('/');
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-indigo-950">
            <div className="flex h-screen overflow-hidden">
                <AdminSidebar />
                
                <div className="flex-1 flex flex-col overflow-hidden">
                    <AdminHeader user={user} />
                    <main className="flex-1 overflow-y-auto p-4 md:p-6">
                        <div className="max-w-7xl mx-auto">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
