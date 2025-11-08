import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Topbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 bg-background">{children}</main>
      </div>
    </div>
  );
}
