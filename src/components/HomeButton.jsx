import { MdArrowBackIos } from "react-icons/md";
import { useNavigate } from "react-router-dom";

import { useLanguage } from "../context/LanguageContext";

const HomeButton = ({ position }) => {
    const navigate = useNavigate();
    const { language } = useLanguage();

    return (
        <div className={`w-[80%] max-w-[${position}px] flex items-left`}>
            <button
                onClick={() => navigate("/home")}
                className="flex items-center gap-2 text-white bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-md mb-4 cursor-pointer"
            >
                <MdArrowBackIos />

                {language === 'EN' ? 'Home' : 'Inicio'}
            </button>
        </div>
    )
}

export default HomeButton;