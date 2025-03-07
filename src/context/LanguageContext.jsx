import React, { createContext, useContext, useState, useEffect } from "react";

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState(localStorage.getItem("language") || "EN");

    useEffect(() => {
        localStorage.setItem("language", language);
    }, [language]);

    const handleLanguageChange = (lang) => {
        setLanguage(lang);
    };

    return (
        <LanguageContext.Provider value={{ language, handleLanguageChange }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
