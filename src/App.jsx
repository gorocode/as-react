import { useState } from "react";
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from "framer-motion";

import { LanguageProvider } from './context/LanguageContext';

import Home from "./pages/Home";
import Login from "./pages/Login";
import Game from "./pages/Game";
import UserSettings from "./components/UserSettings";
import ProtectedRoute from "./components/ProtectedRoute";
import MyPlayers from "./pages/MyPlayers";
import EditUser from "./pages/EditUser";
import PageTransition from "./components/PageTransition";
import Footer from "./components/Footer";
import GameOver from "./pages/GameOver";
import Contact from "./pages/Contact";
import MessageModal from "./components/MessageModal";
import HowToPlay from "./pages/HowToPlay";

export default function App() {
	const location = useLocation();
	const [messageModal, setMessageModal] = useState(null);

	return (
		<LanguageProvider>
			<MessageModal message={messageModal} onClose={() => setMessageModal(null)}/>
			<div className="flex flex-col items-center justify-center min-h-screen bg-gray-800 text-white overflow-hidden">
				<UserSettings />
				<div className="flex flex-col items-center justify-center w-full h-full flex-grow overflow-hidden">
				<AnimatePresence mode="wait">
					<Routes location={location} key={location.pathname}>

						<Route path="/login" element={<PageTransition><Login /></PageTransition>} />

						<Route element={<ProtectedRoute allowedRoles={["USER", "ADMIN"]} />}>
							<Route path="/edit-user" element={<PageTransition><EditUser setMessageModal={setMessageModal} /></PageTransition>} />
						</Route>

						<Route element={<ProtectedRoute allowedRoles={["USER", "ADMIN"]} />}>
							<Route path="/my-players" element={<PageTransition><MyPlayers setMessageModal={setMessageModal} /></PageTransition>} />
						</Route>

						<Route path="/home" element={<PageTransition><Home setMessageModal={setMessageModal} /></PageTransition>} />
						
						<Route path="/how-to-play" element={<PageTransition><HowToPlay /></PageTransition>} />

						<Route path="/game" element={<PageTransition><Game setMessageModal={setMessageModal} /></PageTransition>} />
						
						<Route path="/game-over" element={<PageTransition><GameOver /></PageTransition>} />
					
						<Route path="/contact" element={<PageTransition><Contact setMessageModal={setMessageModal} /></PageTransition>} />

						{/* Redirect to home when unknown route */}
						<Route element={<ProtectedRoute allowedRoles={["USER", "ADMIN"]} />}>
							<Route path="*" element={<Navigate to="/home" replace />} />
						</Route>
					</Routes>
				</AnimatePresence>
				</div>
				<Footer />
			</div>
		</LanguageProvider>
	);
}
