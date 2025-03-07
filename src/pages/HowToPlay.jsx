import { useEffect, useState } from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import HomeButton from "../components/HomeButton";
import text from "../texts";
import { useLanguage } from "../context/LanguageContext";

const HowToPlay = () => {
    const [page, setPage] = useState(1);
    const { language } = useLanguage();
    const [content, setContent] = useState(text.HTP_EN);
    const [direction, setDirection] = useState(1); // 1 = right, -1 = left

    useEffect(() => {
        setContent(language === 'EN' ? text.HTP_EN : text.HTP_ES);
    }, [language]);

    const nextPage = () => {
        if (page < content.length) {
            setDirection(1);
            setPage(page + 1);
        }
    };

    const prevPage = () => {
        if (page > 1) {
            setDirection(-1);
            setPage(page - 1);
        }
    };

    const variants = {
        enter: (dir) => ({
            x: dir > 0 ? "100%" : "-100%",
            opacity: 0,
        }),
        center: {
            x: 0,
            opacity: 1,
            scale: 1,
            transition: { duration: 0.6, ease: "easeInOut" },
        },
        exit: (dir) => ({
            x: dir > 0 ? "-100%" : "100%",
            opacity: 0,
        }),
    };

    return (
        <div className="w-full max-w-3xl p-8 select-none overflow-hidden">
            <HomeButton />
            <div className="p-6 bg-gray-900 text-white rounded-lg w-[100%] max-w-[800px] min-h-[550px] text-center relative flex items-center justify-center overflow-hidden">
                <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                        key={page}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        custom={direction}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        className="w-full h-full absolute top-0 left-0 flex flex-col items-center"
                    >
                        <h2 className="text-2xl font-bold mt-6 mb-2">{content[page - 1].title}</h2>
                        <hr className="border-gray-500 w-100" />
                        <p className="m-4 text-lg">
                            {content[page - 1].text.split("\n").map((line, index) => (
                                <span key={index}>
                                    {line}
                                    <br />
                                </ span>
                                    
                            ))}
                        </p>
                        <img src={content[page - 1].img} className="w-[90%] max-h-[350px] object-contain rounded-lg" alt="Tutorial step" />
                    </motion.div>
                </AnimatePresence>

                {/* Left */}
                <div className="absolute top-1/2 left-4 -translate-y-1/2">
                    <button
                        onClick={prevPage}
                        disabled={page === 1}
                        className={`p-3 rounded-full transition-all ${page === 1 ? "opacity-50 cursor-not-allowed" : "cursor-pointer bg-blue-500 hover:bg-blue-600"}`}
                    >
                        <FaArrowLeft size={30} />
                    </button>
                </div>

                {/* Right */}
                <div className="absolute top-1/2 right-4 -translate-y-1/2">
                    <button
                        onClick={nextPage}
                        disabled={page === content.length}
                        className={`p-3 rounded-full transition-all ${page === content.length ? "opacity-50 cursor-not-allowed" : "cursor-pointer bg-blue-500 hover:bg-blue-600"}`}
                    >
                        <FaArrowRight size={30} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HowToPlay;
