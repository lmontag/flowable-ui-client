import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { LucideListChecks, LucideLayers, LucideHome, LucideSettings, LucideLogOut, LucideUser, LucideAlertCircle } from 'lucide-react';

const navItems = [
	{ label: 'Processes', icon: <LucideLayers size={24} />, path: '/definitions' },
	{ label: 'Instances', icon: <LucideHome size={24} />, path: '/instances' },
	{ label: 'Tasks', icon: <LucideListChecks size={24} />, path: '/tasks' },
	{ label: 'Admin', icon: <LucideSettings size={24} />, path: '/admin' },
	{ label: 'Incidents', icon: <LucideAlertCircle size={24} />, path: '/incidents' },
];

export default function Sidebar() {
	const loc = useLocation();
	const navigate = useNavigate();
	return (
		<aside className="h-full w-20 bg-[#232a36] flex flex-col items-center py-4 shadow-lg min-h-0" style={{height: '100vh'}}>
			<div className="mb-8 mt-2">
				<img src="/flowable-logo.png" alt="Flowable" className="w-10 h-10" />
			</div>
			<nav className="flex flex-col gap-2 w-full flex-1">
				{navItems.map(item => {
					const active = loc.pathname.startsWith(item.path);
					return (
						<button
							key={item.label}
							className={`group flex flex-col items-center w-full py-3 text-xs font-medium text-gray-200 hover:bg-[#2d3643] relative ${active ? 'bg-[#232a36] border-l-4 border-blue-500 text-blue-400' : ''}`}
							onClick={() => navigate(item.path)}
							style={{ borderRadius: '8px 0 0 8px' }}
						>
							<span className="mb-1">{item.icon}</span>
							<span className="text-[11px] tracking-wide">{item.label}</span>
							{active && <span className="absolute left-0 top-0 h-full w-1 bg-blue-500 rounded-r" />}
						</button>
					);
				})}
			</nav>
		</aside>
	);
}