import { useState } from "react";

import { useLanguage } from "../context/LanguageContext";
import { sendContactForm } from "../api/api";

import HomeButton from "../components/HomeButton";

const Contact = ({ setMessageModal }) => {
    const { language } = useLanguage();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        message: ""
    });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleBlur = (e) => {
        if (!e.target.value.trim()) {
            setErrors(prev => ({ ...prev, [e.target.name]: language === 'EN' ? 'This field is required' : 'Este campo es obligatorio' }));
        } else if (e.target.name === 'email' && !/\S+@\S+\.\S+/.test(e.target.value)) {
            setErrors(prev => ({ ...prev, [e.target.name]: language === 'EN' ? 'Invalid email' : 'Correo inválido' }));
        } else {
            setErrors(prev => ({ ...prev, [e.target.name]: "" }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await sendContactForm(formData);
            setMessageModal(language === 'EN' ? response.messageEn : response.messageEs);

        } catch (error) {
            setMessageModal(language === 'EN' ? error.messageEn : error.messageEs);
        }
    };

    return (
        <>
            <HomeButton position={700} />
            <div className="p-4 bg-gray-900 text-white rounded-lg w-[80%] max-w-[700px]">
                <h2 className="text-xl font-bold mb-4 text-center">
                    {language === 'EN' ? 'Contact Us' : 'Contáctanos'}
                </h2>
                <hr className="mb-5" />
                <div className="flex flex-wrap justify-center gap-4">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-[400px] mx-auto">
                        {['name', 'email', 'message'].map(field => (
                            <div key={field}>
                                {errors[field] && <p className="text-red-500 text-center text-sm whitespace-nowrap mb-[-28px] sm:ml-[130px] sm:mb-1">{errors[field]}</p>}
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                    <label className="text-md font-semibold w-full sm:w-40 sm:text-right">
                                        {language === 'EN' ? field.charAt(0).toUpperCase() + field.slice(1) : field === 'name' ? 'Nombre' : field === 'email' ? 'Correo' : 'Mensaje'}
                                    </label>
                                    {field === 'message' ? (
                                        <textarea
                                            name={field}
                                            value={formData[field]}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            className={`p-2 w-full sm:max-w-[250px] rounded bg-gray-800 border ${errors[field] ? 'border-red-500' : 'border-gray-600'} text-white h-28`}
                                        />
                                    ) : (
                                        <input
                                            type={field === 'email' ? 'email' : 'text'}
                                            name={field}
                                            value={formData[field]}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            className={`p-2 w-full sm:max-w-[250px] rounded bg-gray-800 border ${errors[field] ? 'border-red-500' : 'border-gray-600'} text-white`}
                                        />
                                    )}
                                </div>
                            </div>
                        ))}
                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-md cursor-pointer"
                        >
                            {language === 'EN' ? 'Send Message' : 'Enviar Mensaje'}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default Contact;