import TopNav from "./TopNav";
import Sidebar from "./Sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <Sidebar />
      <main className="ml-[240px] mt-14 p-8 max-w-[1600px] print:ml-0 print:mt-0 print:p-0 print:max-w-none">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
