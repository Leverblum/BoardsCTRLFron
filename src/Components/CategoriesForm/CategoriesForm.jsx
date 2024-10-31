import React, { useState, useEffect } from 'react';
import axiosInstance from '../services/axiosConfig';
import { useParams, useNavigate } from 'react-router-dom';
import Notification from '../Notification/Notification';
import HeaderForm from '../HeaderForm/HeaderForm';

const AddCategoryForm = ({ onAddCategory }) => {
  const [categoryTitle, setTitleCategory] = useState('');
  const [notification, setNotification] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (categoryTitle.trim() === '') {
      setNotification({ type: 'error', message: 'El campo de categoría no puede estar vacío.' });
      return;
    }

    if (categoryTitle.length > 30) {
      setNotification({ type: 'error', message: 'El nombre de la categoría no puede exceder los 30 caracteres.' });
      return;
    }

    const createdBy = localStorage.getItem('userId');

    const newCategory = {
      categoryTitle,
      categoryStatus: true,
      createdBy,
      updatedBy: createdBy,
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString(),
    };

    try {
      const token = localStorage.getItem('token');
      await axiosInstance.post('https://localhost:7289/api/Categories', newCategory, {
        headers: { 'Authorization': `Bearer ${token}` }, // Añadimos el token a los headers
      });
      onAddCategory();
      setTitleCategory('');
      setNotification({ type: 'success', message: 'Categoría agregada con éxito.' });
    } catch (error) {
      if (error.response && error.response.status === 403) {
        setNotification({ type: 'unauthorized', message: 'No tienes permisos para esta acción.' });
      } else {
        setNotification({ type: 'error', message: 'Error al agregar el tablero.' });
      }
    }
  };

  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate('/boards');
  };

  return (
    <>
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          duration={3000}
          onClose={() => setNotification(null)}
        />
      )}
      <form className="flex mb-6 gap-4 w-full mt-6 ml-1" onSubmit={handleSubmit}>
        <input
          type="text"
          value={categoryTitle}
          onChange={(e) => setTitleCategory(e.target.value)}
          placeholder="Nueva Categoría"
          maxLength={30}
          required
          className="border border-gray-300 p-2 rounded w-full"
        />
        <button
          type="submit"
          className="bg-green-500 text-white rounded px-4 py-2 transition-colors hover:bg-green-600"
        >
          Agregar Categoría
        </button>
        <button
            onClick={handleGoBack}
            className="bg-gray-600 text-white rounded mr-4 px-4 py-2 transition-colors hover:bg-gray-500"
          >
            Volver a tableros
          </button>
      </form>
    </>
  );
};

const EditCategoryForm = ({ category, onEditCategory, onClose }) => {
  const [newName, setNewName] = useState(category.categoryTitle);
  const [isActive] = useState(category.categoryStatus);
  const [notification, setNotification] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newName.trim() === '') {
      setNotification({ type: 'error', message: 'El campo de nombre no puede estar vacío.' });
      return;
    }

    if (newName.length > 30) {
      setNotification({ type: 'error', message: 'El nombre de la categoría no puede exceder los 30 caracteres.' });
      return;
    }

    const confirmSave = window.confirm("¿Estás seguro de los cambios?");
    if (!confirmSave) {
      return;
    }

    const editedBy = localStorage.getItem('userId');

    const updatedCategory = {
      categoryId: category.categoryId,
      categoryTitle: newName,
      categoryStatus: isActive,
      createdBy: category.createdBy,
      updatedBy: editedBy,
      createdDate: category.createdDate,
      updatedDate: new Date().toISOString()
    };

    try {
      const token = localStorage.getItem('token');
      await axiosInstance.put(`https://localhost:7289/api/Categories/${category.categoryId}`, updatedCategory, {
        headers: { 'Authorization': `Bearer ${token}` }, // Añadimos el token a los headers
      });
      setNotification({ type: 'success', message: 'Cambio realizado con éxito.' });
      onEditCategory();
      setTimeout(onClose, 3000);
    } catch (error) {
      if (error.response && error.response.status === 403) {
        setNotification({ type: 'unauthorized', message: 'No tienes permisos para esta acción.' });
      } else {
        setNotification({ type: 'error', message: 'Error al agregar el tablero.' });
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
        <h2 className="text-lg font-normal mb-4">Editar categoría: {category.categoryTitle}</h2>
        {notification && (
          <Notification
            type={notification.type}
            message={notification.message}
            duration={3000}
            onClose={() => setNotification(null)}
          />
        )}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            Nombre:
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Editar Categoría"
              maxLength={30}
              required
              className="border border-gray-300 p-2 rounded w-full"
            />
          </label>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-red-600 text-white rounded px-4 py-2"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-green-600 text-white rounded px-4 py-2"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CategoriesForm = () => {
  const [categories, setCategories] = useState([]);
  const [editingCategory, setEditingCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCategories, setTotalCategories] = useState(0);
  const [pageSize] = useState(5);

  const navigate = useNavigate();

  const fetchCategories = async (pageNumber = 1, pageSize = 5) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axiosInstance.get('https://localhost:7289/api/Categories', {
        params: { pageNumber, pageSize },
        headers: { 'Authorization': `Bearer ${token}` },
      });

      setCategories(response.data.categories);
      setTotalCategories(response.data.totalCategories);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setLoading(false);
      setNotification({ type: 'error', message: 'Error al cargar las categorías.' });
    }
  };

  useEffect(() => {
    fetchCategories(currentPage, pageSize);
  }, [currentPage, pageSize]);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages && totalCategories > 0) {
      setCurrentPage(newPage);
      fetchCategories(newPage, pageSize);
    }
  };

  const totalPages = Math.ceil(totalCategories / pageSize);

  const handleToggleActive = async (category) => {
    try {
      const token = localStorage.getItem('token');
      await axiosInstance.delete(`https://localhost:7289/api/Categories/${category.categoryId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      fetchCategories(currentPage, pageSize);
      setNotification({
        type: 'success',
        message: `Categoria ${category.categoryStatus ? 'deshabilitada' : 'activada'} exitosamente.`,
      });    } catch (error) {
        if (error.response && error.response.status === 403) {
          setNotification({ type: 'unauthorized', message: 'No tienes permisos para esta acción.' });
        } else {
          setNotification({ type: 'error', message: 'Error al agregar el tablero.' });
        }
      }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="flex flex-col min-h-screen min-w-screen bg-gray-200 p-0 overflow-hidden">
      <HeaderForm onLogout={handleLogout} />
  
      <AddCategoryForm onAddCategory={() => fetchCategories(currentPage, pageSize)} />
  
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          duration={3000}
          onClose={() => setNotification(null)}
        />
      )}
  
      <div className="bg-white rounded-lg shadow p-6 flex-1 overflow-y-auto">
        {loading ? (
          <p className="text-lg">Cargando categorías...</p>
        ) : (
          categories.length === 0 ? (
            <p className="text-lg">No hay categorías disponibles.</p>
          ) : (
            categories.map((category) => (
              <div className="flex justify-between items-center p-8 text-xl border-b border-gray-300 hover:bg-gray-100" key={category.categoryId}>
                <span className="font-normal">{category.categoryTitle}</span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setEditingCategory(category)}
                    className="bg-yellow-400 hover:bg-yellow-500 text-white rounded px-4 py-2"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleToggleActive(category)}
                    className={`p-2 text-white rounded px-4 py-2 ${category.categoryStatus ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
                  >
                    {category.categoryStatus ? 'Desactivar' : 'Activar'}
                  </button>
                </div>
              </div>
            ))
          )
        )}
      </div>
  
      <div className="mt-4 flex justify-center space-x-4">
        <button
          className="bg-gray-500 hover:bg-gray-600 text-white rounded px-4 py-2"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Anterior
        </button>
        <span className="px-2">{`Página ${currentPage} de ${totalPages}`}</span>
        <button
          className="bg-gray-500 hover:bg-gray-500 text-white rounded px-4 py-2"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Siguiente
        </button>
      </div>
  
      {editingCategory && (
        <EditCategoryForm
          category={editingCategory}
          onEditCategory={() => fetchCategories(currentPage, pageSize)}
          onClose={() => setEditingCategory(null)}
        />
      )}
    </div>
    );
  };

export default CategoriesForm;
