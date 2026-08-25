import DashboardNavbar from "@/components/dashboardnavbar";

export default function DashboardLayout({ children }) {
    return(
        <div className="flex bg-stone-50 h-screen overflow-hidden">
            <DashboardNavbar />
            <div className="bg-white flex-1 m-2 ms-0 rounded-xl border border-gray-200 px-4 pb-4 pt-0 flex flex-col overflow-y-auto">
                <div className="pt-4 flex flex-col gap-4 flex-1">
                    {children}
                </div>
            </div>
        </div>
    );
}