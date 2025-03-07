import { useEffect, useState } from "react";

import { updateUser, duplicatedEmail } from "../api/api";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

import config from "../config";
import HomeButton from "../components/HomeButton";

const EditUser = ({ setMessageModal }) => {
    const { user } = useAuth();
    const { language } = useLanguage();
    const [formData, setFormData] = useState({
        id: "",
        name: "",
        username: "",
        email: "",
        profilePicture: ""
    });
    const [errors, setErrors] = useState({});
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        if (user) {
            setFormData({
                id: user.id || "",
                name: user.name || "",
                username: user.username || "",
                email: user.email || "",
                profilePicture: user.profilePicture || ""
            });
            setImagePreview(user.profilePicture || "");
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleBlur = async (e) => {
        if (!e.target.value.trim()) {
            setErrors(prev => ({ ...prev, [e.target.name]: language === 'EN' ? 'This field is required' : 'Este campo es obligatorio' }));
        } else if (e.target.name === 'email' && !/\S+@\S+\.\S+/.test(e.target.value)) {
            setErrors(prev => ({ ...prev, [e.target.name]: language === 'EN' ? 'Invalid email' : 'Correo inválido' })); 
        } else if (e.target.name === 'email' && !e.target.value.includes('@gmail.')) {
            setErrors(prev => ({ ...prev, [e.target.name]: language === 'EN' ? 'Only Gmail accounts are allowed' : 'Solo se permiten cuentas de Gmail' }));
        } else if (e.target.name === 'email' && e.target.value !== user.email && await duplicatedEmail(e.target.value)) {
            setErrors(prev => ({ ...prev, [e.target.name]: language === 'EN' ? 'This email is already in use' : 'Este correo ya está en uso' })); 
        } else if (e.target.name === 'name' && e.target.value.length < 3) {
            setErrors(prev => ({ ...prev, [e.target.name]: language === 'EN' ? 'Name must be at least 3 characters long' : 'El nombre debe tener al menos 3 caracteres' }));
        } else if (e.target.name === 'username' && e.target.value.length < 3) {
            setErrors(prev => ({ ...prev, [e.target.name]: language === 'EN' ? 'Username must be at least 3 characters long' : 'El usuario debe tener al menos 3 caracteres' }));
        } else {
            setErrors(prev => ({ ...prev, [e.target.name]: "" }));
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const updatedUser = { ...formData };
            if (imageFile) {
                const newUrl = await uploadImage();
                setFormData({ ...formData, profilePicture: newUrl});
                updatedUser.profilePicture = newUrl;
            }
            await updateUser(updatedUser);
            setMessageModal(language === 'EN' ? 'User updated successfully!' : '¡Usuario actualizado con éxito!');
        } catch (error) {
            setMessageModal(language === 'EN' ? error.messageEn : error.messageEs);
        }
    };

    const uploadImage = async () => {
        if (!imageFile) return;
        const formData = new FormData();
        formData.append("file", imageFile);
        formData.append("upload_preset", config.CLOUDINARY_PRESENT);

        try {
            const response = await fetch(`https://api.cloudinary.com/v1_1/${config.CLOUDINARY_NAME}/image/upload`, {
                method: "POST",
                body: formData
            });
            const data = await response.json();
            return data.secure_url;
        } catch (error) {
            setMessageModal(language === 'EN' ? 'Error uploading image' : 'Error al subir la imagen');
        }
    };

    if (!user) return <p>{language === 'EN' ? 'Loading user...' : 'Cargando usuario...'}</p>;

    return (
        <>
            <HomeButton position={700}/>
            
            <div className="p-4 bg-gray-900 text-white rounded-lg w-[80%] max-w-[700px]">
                <h2 className="text-xl font-bold mb-4 text-center">
                    {language === 'EN' ? 'Edit User' : 'Editar usuario'}
                </h2>
                <hr className="mb-5" />
                <div className="flex flex-wrap justify-center gap-4">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-[400px] mx-auto">
                        {['name', 'username', 'email'].map(field => (
                            <div key={field}>
                                {errors[field] && <p className="text-red-500 text-center text-sm whitespace-nowrap mb-[-28px] sm:ml-[130px] sm:mb-1">{errors[field]}</p>}
                                <div  className="flex flex-col sm:flex-row sm:items-center gap-2">
                                    <label className="text-md font-semibold w-full sm:w-40 sm:text-right">
                                        {language === 'EN' ? field.charAt(0).toUpperCase() + field.slice(1) : field === 'name' ? 'Nombre' : field === 'username' ? 'Usuario' : 'Correo'}
                                    </label>
                                    <input
                                        type={field === 'email' ? 'email' : 'text'}
                                        name={field}
                                        value={formData[field]}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        className={`p-2 w-full sm:max-w-[250px] rounded bg-gray-800 border ${errors[field] ? 'border-red-500' : 'border-gray-600'} text-white`}
                                    />
                                </div>
                            </div>
                        ))}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            <label className="text-md font-semibold w-full sm:w-40 sm:text-right">{language === 'EN' ? 'Profile Picture' : 'Foto de Perfil'}</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="cursor-pointer p-2 w-full sm:max-w-[250px] rounded bg-gray-800 border border-gray-600 text-white"
                            />
                        </div>
                        {imagePreview && (
                            <>
                                <label className="text-md font-semibold w-full sm:text-center">{language === 'EN' ? 'Picture Preview' : 'Previsualización'}</label>
                                <img src={imagePreview} alt="Profile" className="w-25 h-25 rounded-full mx-auto" />
                            </>
                        )}
                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-md cursor-pointer"
                        >
                            {language === 'EN' ? 'Update' : 'Actualizar'}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default EditUser;
