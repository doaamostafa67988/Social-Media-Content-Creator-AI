import Sidebar from "@/components/Sidebar"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#09090f]">
      <Sidebar />
      <div className="flex-1 ml-56 min-h-screen overflow-auto">
        {children}
      </div>
    </div>
  )
}
