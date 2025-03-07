import { motion, AnimatePresence } from "framer-motion";

import { useState, useEffect } from "react";

const SlidingText = ({ texts, interval = 4000 }) => {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const changeText = setInterval(() => {
            setIndex((prevIndex) => (prevIndex + 1) % texts.length);
        }, interval);

        return () => clearInterval(changeText);
    }, [texts, interval]);

    return (
        <div className="relative w-full h-6 flex justify-center items-center overflow-hidden">
            <AnimatePresence mode="wait">
                <motion.div
                    key={texts[index]}
                    initial={{ x: "100%", opacity: 0 }}
                    animate={{ x: "0%", opacity: 1 }}
                    exit={{ x: "-100%", opacity: 0 }}
                    transition={{ duration: 1, ease: "easeInOut" }}
                    className="absolute text-lg font-semibold text-center"
                >
                    {texts[index]}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default SlidingText;
