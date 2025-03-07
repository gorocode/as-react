import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

const MessageModal = ({ message, onClose }) => {
    const [visible, setVisible] = useState(!!message);

    useEffect(() => {
        if (message) {
            setVisible(true);
            const timer = setTimeout(() => {
                setVisible(false);
                onClose();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [message, onClose]);

    if (!visible) return null;

    return (
        <AnimatePresence>
        {visible && (
            <motion.div
                initial={{ opacity: 0, scale: 0.8, y: -50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -50 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="fixed top-1/10 left-1/2 transform -translate-x-1/2 -translate-y-1/2
                           bg-red-800 text-white px-6 py-3 rounded-lg shadow-lg text-center"
            >
                {message}
            </motion.div>
        )}
    </AnimatePresence>
    );
};

export default MessageModal;
