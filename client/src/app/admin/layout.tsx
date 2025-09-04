import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { getUser } from "@/services/server/auth";
import Particles from "@/components/particles";

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
        <div className="min-h-screen relative overflow-hidden">
            <div className="pointer-events-none absolute inset-0 -z-20">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900" />
                <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-red-500/10 blur-3xl" />
                <div className="absolute bottom-0 -right-20 w-[32rem] h-[32rem] rounded-full bg-gradient-to-tr from-purple-500/15 via-pink-500/10 to-cyan-500/10 blur-3xl" />
            </div>
            <Particles />
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
