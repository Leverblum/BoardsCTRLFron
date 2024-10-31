import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const HeaderForm = ({ headerTitle }) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const navigate = useNavigate();
  const userCircleRef = useRef(null);
  const userOptionsRef = useRef(null);

  const username = localStorage.getItem('username');
  const userRole = localStorage.getItem('role');
  const userInitial = username ? username.charAt(0).toUpperCase() : '';

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const toggleMenu = () => {
    setMenuVisible((prev) => !prev);
  };

  return (
    <header className="flex justify-between items-center bg-gray-800 text-white p-4 md:p-7">
      <div className="header-left flex items-center">
        <h1 className="text-xl md:text-3xl m-0 font-extrabold cursor-pointer" onClick={() => navigate('/boards')}>
          {headerTitle || 'BoardCTRL'}
        </h1>
        <button
          onClick={() => navigate('/categories')}
          className="ml-2 md:ml-8 bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-500 transition"
        >
          Categorías
        </button>
        <button
          onClick={() => navigate('/boards')}
          className="ml-2 md:ml-2 bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-500 transition"
        >
          Tableros
        </button>
      </div>
      <div className="header-right relative flex items-center">
        <div
          className="user-info flex items-center cursor-pointer"
          ref={userCircleRef}
          onClick={toggleMenu}
        >
          <span className="user-circle bg-gray-600 text-white rounded-full flex justify-center items-center w-10 h-10 mr-2">
            {userInitial}
          </span>
          <span className="user-name">{username}</span>
          <span className="user-role">({userRole})</span>
        </div>

        {menuVisible && (
          <div
            className="user-options absolute top-10 -right-7 bg-white text-black border border-gray-300 pl-2 flex flex-col z-10 w-48 md:w-64"
            ref={userOptionsRef}
          >
            <button
              onClick={handleLogout}
              className=" bg-white text-black border-none cursor-pointer py-2 text-center hover:bg-gray-200 transition"
            >
              Cerrar Sesión
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default HeaderForm;
