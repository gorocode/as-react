import React from "react";
import { motion, AnimatePresence } from "framer-motion";

import { useLanguage } from "../context/LanguageContext";

const ConfirmModal = ({ isOpen, onClose, onConfirm, message }) => {
    const { language } = useLanguage();

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div 
                    className="fixed inset-0 flex justify-center items-center z-50"
                    style={{ backgroundColor: "rgba(0, 0, 0, 0.67)" }}
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className="bg-gray-800 text-white p-6 rounded-lg shadow-lg w-[300px] text-center"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                        <p className="mb-4 font-semibold">{message}</p>
                        <div className="flex justify-around">
                            <button
                                className="bg-green-600 font-semibold hover:bg-green-800 text-white px-4 py-2 rounded"
                                onClick={onConfirm}
                            >
                                {language === "EN" ? "Confirm" : "Confirmar"}
                            </button>
                            <button
                                className="bg-red-600 font-semibold hover:bg-red-800 text-white px-4 py-2 rounded"
                                onClick={onClose}
                            >
                                {language === "EN" ? "Cancel" : "Cancelar"}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ConfirmModal;
