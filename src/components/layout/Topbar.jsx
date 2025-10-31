import { Search, ChevronDown, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import ModeToggle from "../theme/ModeToggle";
import NotificationsButton from "../ui/NotificationsButton";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export default function Topbar() {
  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-neutral-900 px-6 py-3 flex justify-between items-center border-b-[1px] border-black/10">
      {/* left side S + StoreAdmin + searchbar */}
      <div className="flex justify-center items-center w-5/12">
        <div className="bg-indigo-600  px-3 py-1 rounded-lg">
          <span className="text-white font-medium text-lg">S</span>
        </div>
        <span className="mx-3">StoreAdmin</span>
        <div className="relative hidden md:block w-full max-w-[520px]">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search products, orders, customers..."
            // value={searchTerm}
            // onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-1.5 pl-10 border border-slate-300 
            bg-gray-200
            rounded-xl focus:outline-none focus:ring-3 focus:ring-gray-200
            dark:bg-neutral-700"
          />
        </div>
      </div>
      {/*=== left side S + StoreAdmin + searchbar ===*/}

      {/* right side light/dark mode icon + notifications icon*/}
      <div className="flex justify-between items-center gap-x-3">
        <ModeToggle />
        <NotificationsButton />
        {/* SM + Sarah M. + CaretDown and list */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-9 px-2 gap-2">
              <span
                className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-indigo-100 text-indigo-600
                         dark:bg-indigo-900 dark:text-indigo-300"
              >
                SM
              </span>
              <span className="text-sm font-semibold">Sarah M.</span>
              <ChevronDown className="h-4 w-4 opacity-70" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600 focus:text-red-700"
              onSelect={(e) => {
                e.preventDefault();
                // TODO: call your logout handler here
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {/*=== right side light/dark mode icon + notifications icon ===*/}
    </header>
  );
}
