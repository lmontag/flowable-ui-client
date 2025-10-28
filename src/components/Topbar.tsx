
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { checkFlowableStatus } from '../api/status'
import { LucideUser, LucideInfo, LucideLogOut } from 'lucide-react';

export default function Topbar() {
	const [online, setOnline] = useState<boolean | null>(null);
	const [showUser, setShowUser] = useState(false);
	const [showInfo, setShowInfo] = useState(false);
	const userRef = useRef<HTMLDivElement>(null);
	const infoRef = useRef<HTMLDivElement>(null);
	// Chiudi popup se clic fuori
	useEffect(() => {
		function handleClick(e: MouseEvent) {
			if (showUser && userRef.current && !userRef.current.contains(e.target as Node)) {
				setShowUser(false);
			}
			if (showInfo && infoRef.current && !infoRef.current.contains(e.target as Node)) {
				setShowInfo(false);
			}
		}
		if (showUser || showInfo) {
			document.addEventListener('mousedown', handleClick);
		}
		return () => document.removeEventListener('mousedown', handleClick);
	}, [showUser, showInfo]);
	const navigate = useNavigate();
	const username = sessionStorage.getItem('authUser') || '';

	useEffect(() => {
		let mounted = true;
		checkFlowableStatus().then(ok => { if (mounted) setOnline(ok) });
		const interval = setInterval(() => { checkFlowableStatus().then(ok => { if (mounted) setOnline(ok) }) }, 10000);
		return () => { mounted = false; clearInterval(interval) }
	}, []);

	function handleLogout() {
		sessionStorage.removeItem('authUser');
		sessionStorage.removeItem('authPass');
		navigate('/login');
	}

	return (
		<header className="h-14 bg-white shadow-sm flex items-center px-6 justify-between border-b">
			<div className="flex items-center gap-3">
				<img src="/flowable-logo.png" alt="Flowable" className="w-8 h-8" />
				<span className="text-lg font-bold tracking-wide text-gray-700">Flowable Work UI</span>
			</div>
			<div className="flex-1 flex justify-center">
				{/* Titolo centrale opzionale */}
			</div>
			<div className="flex items-center gap-4">
				<div className="relative group flex items-center">
									<div className="w-3 h-3 rounded-full" style={{ background: online == null ? 'gray' : online ? '#22c55e' : '#ef4444' }} />
									<span className="absolute left-1/2 -translate-x-1/2 top-7 px-2 py-1 rounded bg-gray-800 text-white text-xs opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10 pointer-events-none">
										{online == null ? 'Checking...' : online ? 'Flowable online' : 'Flowable offline'}
									</span>
				</div>
				{/* User icon with username popup */}
						<div className="relative" ref={userRef}>
											<button
												className="text-gray-500 hover:text-blue-500"
												onClick={() => setShowUser(v => !v)}
												aria-label="Logged in user"
											>
												<LucideUser size={22} />
											</button>
											{showUser && (
												<div className="absolute right-0 mt-2 bg-white border rounded shadow-lg px-4 py-2 text-sm z-20 min-w-[120px] text-gray-700">
													<div className="font-semibold mb-1">User</div>
													<div>{username || <span className="italic text-gray-400">None</span>}</div>
												</div>
											)}
						</div>
				{/* Settings icon with version info */}
						<div className="relative" ref={infoRef}>
											<button
												className="text-gray-500 hover:text-blue-500"
												onClick={() => setShowInfo(v => !v)}
												aria-label="Info"
											>
												<LucideInfo size={22} />
											</button>
											{showInfo && (
												<div className="absolute right-0 mt-2 bg-white border rounded shadow-lg px-4 py-2 text-sm z-20 min-w-[180px] text-gray-700">
													<div className="font-semibold mb-1">Information</div>
													<div>UI Version v0.1</div>
													<div>Compatible with Flowable API 7.x</div>
												</div>
											)}
						</div>
				{/* Logout icon */}
				<button
					className="text-gray-500 hover:text-blue-500"
					onClick={handleLogout}
					aria-label="Logout"
				>
					<LucideLogOut size={22} />
				</button>
			</div>
		</header>
	);
}