import * as NavigationMenu from "@radix-ui/react-navigation-menu";

import * as Avatar from "@radix-ui/react-avatar";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useAuth } from "@/context/authentication";

import { useRouter } from "next/navigation";
import { BarChart3, Bell, BookOpen, ChevronDown, LayoutDashboard, Zap } from "lucide-react";

const DashboardHeader = ()=> {
    const router = useRouter()
    const {authDispatch,authState:{user}}=useAuth()
     const handleLogout =()=>{
    authDispatch({type:"LOGOUT"})
    router.replace("/signin")
  }
  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-3">
      <div className="max-w-400 mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <BookOpen size={15} className="text-white" />
          </div>
          <span className="font-bold text-slate-800 text-lg tracking-tight">
            Prep<span className="text-indigo-600">Master</span>
          </span>
        </div>

        {/* Navigation */}
        <NavigationMenu.Root className="hidden md:flex">
          <NavigationMenu.List className="flex items-center gap-1">
            {/* Dashboard */}
            <NavigationMenu.Item>
              <NavigationMenu.Link
                href="#"
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-indigo-600 bg-indigo-50"
              >
                <LayoutDashboard size={15} />
                Dashboard
              </NavigationMenu.Link>
            </NavigationMenu.Item>

            {/* Practice dropdown */}
            <NavigationMenu.Item>
              <NavigationMenu.Trigger className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors data-[state=open]:bg-slate-50 data-[state=open]:text-slate-900 group">
                <BookOpen size={15} />
                Practice
                <ChevronDown
                  size={14}
                  className="transition-transform duration-200 group-data-[state=open]:rotate-180"
                />
              </NavigationMenu.Trigger>
              <NavigationMenu.Content className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl shadow-slate-200/80 border border-slate-100 p-2 z-50">
                {[
                  { label: "SAT Practice", sub: "Full-length tests", icon: "📝" },
                  { label: "Math Drills", sub: "Targeted skill building", icon: "🔢" },
                  { label: "Reading & Writing", sub: "Comprehension focus", icon: "📖" },
                  { label: "Quick Quiz", sub: "10-minute sessions", icon: "⚡" },
                ].map((item) => (
                  <NavigationMenu.Link
                    key={item.label}
                    href="#"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-indigo-50 transition-colors group"
                  >
                    <span className="text-lg">{item.icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-slate-800 group-hover:text-indigo-700">
                        {item.label}
                      </p>
                      <p className="text-xs text-slate-500">{item.sub}</p>
                    </div>
                  </NavigationMenu.Link>
                ))}
              </NavigationMenu.Content>
            </NavigationMenu.Item>

            {/* Progress dropdown */}
            <NavigationMenu.Item>
              <NavigationMenu.Trigger className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors data-[state=open]:bg-slate-50 data-[state=open]:text-slate-900 group">
                <BarChart3 size={15} />
                Progress
                <ChevronDown
                  size={14}
                  className="transition-transform duration-200 group-data-[state=open]:rotate-180"
                />
              </NavigationMenu.Trigger>
              <NavigationMenu.Content className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl shadow-slate-200/80 border border-slate-100 p-2 z-50">
                {[
                  { label: "Score History", sub: "Track improvements", icon: "📈" },
                  { label: "Skill Breakdown", sub: "Strengths & weaknesses", icon: "🎯" },
                  { label: "Study Streaks", sub: "Consistency metrics", icon: "🔥" },
                ].map((item) => (
                  <NavigationMenu.Link
                    key={item.label}
                    href="#"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-indigo-50 transition-colors group"
                  >
                    <span className="text-lg">{item.icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-slate-800 group-hover:text-indigo-700">
                        {item.label}
                      </p>
                      <p className="text-xs text-slate-500">{item.sub}</p>
                    </div>
                  </NavigationMenu.Link>
                ))}
              </NavigationMenu.Content>
            </NavigationMenu.Item>

            <NavigationMenu.Indicator className="top-full flex h-1.5 items-end justify-center overflow-hidden z-50">
              <div className="relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm bg-white shadow-md" />
            </NavigationMenu.Indicator>
          </NavigationMenu.List>

          <NavigationMenu.Viewport className="absolute top-full left-0 mt-1 w-full" />
        </NavigationMenu.Root>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <button className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors">
            <Bell size={18} className="text-slate-600" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
          </button>

          {/* User dropdown */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-xl hover:bg-slate-100 transition-colors">
                <Avatar.Root className="w-8 h-8 rounded-xl overflow-hidden">
                  <Avatar.Fallback className="w-full h-full bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold">
                   {user?.full_name?.split(" ")[0]}    {user?.full_name?.split(" ")[1]}
                  </Avatar.Fallback>
                </Avatar.Root>
                <span className="text-sm font-semibold text-slate-700 hidden sm:block">
                  {user?.full_name}
                </span>
                <ChevronDown size={14} className="text-slate-400" />
              </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="w-52 bg-white rounded-2xl shadow-xl shadow-slate-200/80 border border-slate-100 p-2 z-50 mt-2"
                sideOffset={5}
                align="end"
              >
                {["Profile"].map((item) => (
                  <DropdownMenu.Item
                    key={item}
                    className="px-3 py-2.5 text-sm text-slate-700 font-medium rounded-xl hover:bg-indigo-50 hover:text-indigo-700 cursor-pointer outline-none transition-colors"
                  >
                    {item}
                  </DropdownMenu.Item>
                ))}
                <DropdownMenu.Separator className="my-1 h-px bg-slate-100" />
                <DropdownMenu.Item className="px-3 py-2.5 text-sm text-rose-600 font-medium rounded-xl hover:bg-rose-50 cursor-pointer outline-none transition-colors" onClick={handleLogout}>
                  Sign out
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>

          {/* Upgrade */}
          <button className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl bg-linear-to-r from-amber-400 to-orange-500 text-white text-sm font-bold shadow-sm hover:shadow-md transition-shadow">
            <Zap size={13} />
            Upgrade
          </button>
        </div>
      </div>
    </nav>
  );
}


export default DashboardHeader