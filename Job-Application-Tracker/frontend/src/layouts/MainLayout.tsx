import { NavLink, Outlet } from 'react-router-dom';

const navItems = [
  { path: '/', label: 'Home' },
  { path: '/login', label: 'Login' },
  { path: '/register', label: 'Register' },
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/applications', label: 'Applications' },
  { path: '/profile', label: 'Profile' },
];

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <h2 className="text-xl font-semibold">Job Application Tracker</h2>
            <p className="text-sm text-slate-500">Frontend foundation</p>
          </div>
          <nav className="flex flex-wrap gap-3">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `rounded px-3 py-2 text-sm font-medium transition ${
                    isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
