import { Navigate, Outlet } from "react-router-dom";
import { useState, useRef } from "react";
import { motion } from 'framer-motion';
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

const ProtectedRoute = ({ allowedRoles }) => {
    const { user, loading } = useAuth();
    const { language } = useLanguage();
    const loadingRef = useRef();
    const [mousePosition, setMousePosition] = useState({x:0, y:0});

    const handleMouseMove = (e) => {
        const { clientX, clientY } = e;
        const loadingRect = loadingRef.current.getBoundingClientRect();
        
        const newX = clientX - loadingRect.x;
        const newY = clientY - loadingRect.y;

        const offsetX = (newX - loadingRect.width / 2) / 20;
        const offsetY = (newY - loadingRect.height / 2) / 20;

        setMousePosition({ x: -offsetX, y: -offsetY });
    };

    const shakeVariants = {
        animate: {
            x: ["0", "-10px", "10px", "-10px", "10px", "-5px", "5px", "0"],
            transition: {
                duration: 1.2,
                repeat: Infinity,
                repeatType: "loop",
                ease: "easeInOut",
                repeatDelay: 4,
            },
        },
    };

    const glitchVariants = {
        animate: {
            textShadow: [
                "1px 1px 5px rgba(255, 0, 0, 0.7), -1px -1px 5px rgba(0, 255, 0, 0.7)",
                "2px 2px 5px rgba(0, 255, 255, 0.7), -2px -2px 5px rgba(255, 255, 0, 0.7)",
                "3px 3px 5px rgba(255, 0, 255, 0.7), -3px -3px 5px rgba(255, 0, 0, 0.7)",
                "2px 2px 5px rgba(0, 255, 255, 0.7), -2px -2px 5px rgba(0, 255, 0, 0.7)",
                "1px 1px 5px rgba(255, 0, 0, 0.7), -1px -1px 5px rgba(255, 0, 0, 0.7)",
            ],
            transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
        },
    };

    if (loading) {
        return (
            <motion.div
                ref={loadingRef}
                className="flex items-center justify-center text-white text-center font-bold select-none w-full h-[80vh]"
                variants={shakeVariants}
                animate="animate"
                style={{
                    fontSize: "3rem",
                    letterSpacing: "0.2rem",
                }}
                onMouseMove={handleMouseMove}
            >
                <motion.div 

                    className="relative pointer-events-none"
                    variants={glitchVariants} 
                    animate="animate"
                    style={{
                        x: mousePosition.x,
                        y: mousePosition.y,
                    }}    
                >
                    {language === 'EN' ? 'Loading...' : 'Cargando...'}
                </motion.div>
            </motion.div>
        );
    }

    if (!user) return <Navigate to="/login" replace />;
    if (user.role === "GUEST") return <Navigate to="/login" replace />;
    if (!allowedRoles.includes(user.role)) return <Navigate to="/home" replace />;

    return <Outlet />;
};

export default ProtectedRoute;
