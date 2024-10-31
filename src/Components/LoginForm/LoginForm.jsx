import React, { useState } from "react";
import axiosInstance from '../services/axiosConfig';
import Notification from '../Notification/Notification';
import { FaUserCircle, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const LoginForm = () => {
    const [showLogin, setShowLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const [notification, setNotification] = useState(null);

    const toggleForm = () => {
        setShowLogin(!showLogin);
    };

    const [registerData, setRegisterData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        roleName: 'User' // Valor predeterminado
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setRegisterData({
            ...registerData,
            [name]: value
        });
    };

    const validatePassword = (password) => {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_])[A-Za-z\d@$!%*?&_]{7,}$/;
        return passwordRegex.test(password);
    };

    const handleRegister = async (e) => {
        e.preventDefault();
    
        if (!registerData.username) {
            setNotification({ type: 'error', message: 'Por favor, completa el campo de usuario' });
            return;
        }
    
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(registerData.email) || !registerData.email.endsWith("@finanzauto.com.co")) {
            setNotification({ type: 'error', message: 'El correo electrónico debe pertenecer al dominio finanzauto' });
            return;
        }
    
        if (registerData.password !== registerData.confirmPassword) {
            setNotification({ type: 'error', message: 'Las contraseñas no coinciden' });
            return;
        }
    
        if (!validatePassword(registerData.password)) {
            setNotification({ type: 'error', message: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial' });
            return;
        }
    
        try {
            const response = await axiosInstance.post('/api/Auth/register', {
                username: registerData.username,
                email: registerData.email,
                password: registerData.password,
                roleName: registerData.roleName // Enviar el nombre del rol directamente
            });
    
            if (response.status === 200) {
                setNotification({ type: 'success', message: 'Registro exitoso. Redirigiendo al inicio de sesión...' });
                setRegisterData({
                    username: '',
                    email: '',
                    password: '',
                    confirmPassword: '',
                    roleName: 'User'
                });
                setTimeout(() => {
                    toggleForm();
                }, 3000);
            }
        } catch (error) {
            setNotification({ type: 'error', message: error.response?.data || 'Error al registrarse' });
        }
    };

    const [loginData, setLoginData] = useState({
        username: '',
        password: ''
    });

    const handleLoginInputChange = (e) => {
        const { name, value } = e.target;
        setLoginData({
            ...loginData,
            [name]: value
        });
    };    

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axiosInstance.post('/api/Auth/login', {
                username: loginData.username,
                password: loginData.password
            });

            if (response.status === 200) {
                console.log('Response Data:', response.data);
                setNotification({ type: 'success', message: 'Inicio de sesión exitoso. Redirigiendo...' });
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('userId',response.data.userId);
                localStorage.setItem('username', response.data.userName);
                localStorage.setItem('role', response.data.role);
                setTimeout(() => {
                    navigate('/boards');
                }, 2000);
            }
        } catch (error) {
            setNotification({ type: 'error', message: 'Credenciales incorrectas o servidor no disponible.' });
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-green-500 to-green-950">
            <div className="w-[420px] bg-white border-4 border-white/20 shadow-lg text-gray-800 rounded-lg p-8">
                {notification && (
                    <Notification
                        type={notification.type}
                        message={notification.message}
                        onClose={() => setNotification(null)}
                    />
                )}
    
                {showLogin ? (
                    <div className="form-box-login">
                        <form onSubmit={handleLogin}>
                            <h1 className="text-3xl text-center mb-6">Inicio</h1>
                            <div className="relative mb-6">
                                <input
                                    type="text"
                                    name="username"
                                    placeholder="Usuario"
                                    value={loginData.username}
                                    onChange={handleLoginInputChange}
                                    required
                                    className="w-full h-12 bg-transparent border-2 border-gray-300 rounded-full px-4 focus:outline-none placeholder-gray-600"
                                />
                                <FaUserCircle className='absolute right-3 top-4 text-gray-600' />
                            </div>
                            <div className="relative mb-6">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="Contraseña"
                                    value={loginData.password}
                                    onChange={handleLoginInputChange}
                                    required
                                    className="w-full h-12 bg-transparent border-2 border-gray-300 rounded-full px-4 focus:outline-none placeholder-gray-600"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-2 text-gray-600 text-sm h-8 flex items-center bg-transparent"
                                    aria-label="Toggle password visibility"
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                            <button type="submit" className="w-full h-12 bg-gray-800 text-white font-bold rounded-full shadow-md hover:bg-gray-600 transition">Iniciar</button>
                            <div className="text-center mt-4">
                                <p>¿No tienes una cuenta? <span onClick={toggleForm} className="text-blue-600 cursor-pointer underline">Regístrate aquí</span></p>
                            </div>
                        </form>
                    </div>
                ) : (
                    <div className="form-box-register">
                        <form onSubmit={handleRegister}>
                            <h1 className="text-3xl text-center mb-6">Registro</h1>
                            <div className="relative mb-6">
                                <input
                                    type="text"
                                    name="username"
                                    placeholder="Usuario"
                                    value={registerData.username}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full h-12 bg-transparent border-2 border-gray-300 rounded-full px-4 focus:outline-none placeholder-gray-600"
                                />
                                <FaUserCircle className='absolute right-3 top-4 text-gray-600' />
                            </div>
                            <div className="relative mb-6">
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Correo electrónico"
                                    value={registerData.email}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full h-12 bg-transparent border-2 border-gray-300 rounded-full px-4 focus:outline-none placeholder-gray-600"
                                />
                                <FaUserCircle className='absolute right-3 top-4 text-gray-600' />
                            </div>
                            <div className="relative mb-6">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="Contraseña"
                                    value={registerData.password}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full h-12 bg-transparent border-2 border-gray-300 rounded-full px-4 focus:outline-none placeholder-gray-600"
                                />
                                <FaLock className='absolute right-3 top-4 text-gray-600' />
                            </div>
                            <div className="relative mb-6">
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    placeholder="Confirmar Contraseña"
                                    value={registerData.confirmPassword}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full h-12 bg-transparent border-2 border-gray-300 rounded-full px-4 focus:outline-none placeholder-gray-600"
                                />
                                <FaLock className='absolute right-3 top-4 text-gray-600' />
                            </div>
    
                            {/* Select para el rol */}
                            <div className="relative mb-6">
                                <select
                                    name="roleName"
                                    value={registerData.roleName}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full h-12 bg-transparent border-2 border-gray-300 rounded-full px-4 focus:outline-none text-gray-600"
                                >
                                    <option value="User">Usuario</option>
                                    <option value="Admin">Administrador</option>
                                </select>
                            </div>
    
                            <button type="submit" className="w-full h-12 bg-gray-800 text-white font-bold rounded-full shadow-md hover:bg-gray-600 transition">Registrarse</button>
                            <div className="text-center mt-4">
                                <p>¿Ya tienes una cuenta? <span onClick={toggleForm} className="text-blue-600 cursor-pointer underline">Inicia sesión aquí</span></p>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LoginForm;
