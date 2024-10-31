import React, { useState, useEffect } from 'react';
import axiosInstance from '../services/axiosConfig';
import Notification from '../Notification/Notification';
import { useNavigate } from 'react-router-dom';
import HeaderForm from '../HeaderForm/HeaderForm';

const BoardsForm = () => {
  const [categories, setCategories] = useState([]);
  const [boards, setBoards] = useState([]);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState({});
  const [expandedCategory, setExpandedCategory] = useState(null);
  const boardsPerPage = 4;

  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [newBoardDescription, setNewBoardDescription] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [editBoardId, setEditBoardId] = useState(null);
  const [editBoardTitle, setEditBoardTitle] = useState('');
  const [editBoardDescription, setEditBoardDescription] = useState('');
  const [editBoardCategoryId, setEditBoardCategoryId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategoriesAndBoards = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const categoriesResponse = await axiosInstance.get('https://localhost:7289/api/Categories?pageNumber=1&pageSize=100',{
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const activeCategories = categoriesResponse.data.categories.filter(category => category.categoryStatus);
        setCategories(activeCategories);

        console.log('Categorías cargadas:', activeCategories);

        const boardsResponse = await axiosInstance.get('https://localhost:7289/api/Boards?pageNumber=1&pageSize=100', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        setBoards(Array.isArray(boardsResponse.data.boards) ? boardsResponse.data.boards : []);
        
        // Agrega este console.log para verificar los tableros
        console.log('Tableros cargados:', boardsResponse.data.boards);
      } catch (error) {
        setNotification({ type: 'error', message: 'Error al cargar categorías o tableros.' });
      } finally {
        setLoading(false);
      }
    };
  
    fetchCategoriesAndBoards();
  }, []);
  

  const handleCategoryClick = (categoryId) => {
    setExpandedCategory((prevCategoryId) => (prevCategoryId === categoryId ? null : categoryId));
    if (expandedCategory !== categoryId) {
      paginateBoards(categoryId, 1);
    }
  };

  const paginateBoards = (categoryId, pageNumber) => {
    setCurrentPage((prevPages) => ({
      ...prevPages,
      [categoryId]: pageNumber,
    }));
  };

  const openModal = (categoryId) => {
    setSelectedCategoryId(categoryId);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setNewBoardTitle('');
    setNewBoardDescription('');
    setSelectedCategoryId(null);
  };

  const handleAddBoard = async () => {
    if (!newBoardTitle.trim() || !newBoardDescription.trim() || !selectedCategoryId) {
      setNotification({ type: 'error', message: 'Por favor, completa todos los campos.' });
      return;
    }

    if (newBoardTitle.length > 30 || newBoardDescription.length > 50) {
      setNotification({
        type: 'error',
        message: 'El título no debe exceder los 30 caracteres y la descripción no debe exceder los 50 caracteres.',
      });
      return;
    }

    const token = localStorage.getItem('token'); // Obtenemos el token

    try {
      const newBoard = {
        boardTitle: newBoardTitle.trim(),
        boardDescription: newBoardDescription.trim(),
        categoryId: selectedCategoryId,
        boardStatus: true,
      };
      const response = await axiosInstance.post('https://localhost:7289/api/Boards', newBoard, {
        headers: { Authorization: `Bearer ${token}` }, // Añadimos el token a los headers
      });

      setBoards((prevBoards) => [...prevBoards, response.data]);
      setNotification({ type: 'success', message: 'Tablero agregado exitosamente.' });
      closeModal();
    } catch (error) {
      if (error.response && error.response.status === 403) {
        setNotification({ type: 'unauthorized', message: 'No tienes permisos para esta acción.' });
      } else {
        setNotification({ type: 'error', message: 'Error al agregar el tablero.' });
      }
    }
  };

  const handleEditBoard = (boardId, boardTitle, boardDescription, categoryId) => {
    setEditBoardId(boardId);
    setEditBoardTitle(boardTitle);
    setEditBoardDescription(boardDescription);
    setEditBoardCategoryId(categoryId);
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditBoardTitle('');
    setEditBoardDescription('');
    setEditBoardId(null);
    setEditBoardCategoryId(null);
  };

  const handleUpdateBoard = async () => {
    if (!editBoardTitle.trim() || !editBoardDescription.trim() || !editBoardId || !editBoardCategoryId) {
      setNotification({ type: 'error', message: 'Por favor, completa todos los campos.' });
      return;
    }

    if (editBoardTitle.length > 30 || editBoardDescription.length > 50) {
      setNotification({
        type: 'error',
        message: 'El título no debe exceder los 30 caracteres y la descripción no debe exceder los 50 caracteres.',
      });
      return;
    }

    const token = localStorage.getItem('token'); // Obtenemos el token

    try {
      const updatedBoard = {
        boardTitle: editBoardTitle.trim(),
        boardDescription: editBoardDescription.trim(),
        categoryId: editBoardCategoryId,
        boardStatus: true,
      };
      await axiosInstance.put(`https://localhost:7289/api/Boards/${editBoardId}`, updatedBoard, {
        headers: { Authorization: `Bearer ${token}` }, // Añadimos el token a los headers
      });

      setBoards((prevBoards) =>
        prevBoards.map((board) =>
          board.boardId === editBoardId ? { ...board, ...updatedBoard } : board
        )
      );

      const confirmSave = window.confirm("¿Estás seguro de los cambios?");
      if (!confirmSave) {
        return;
      }
      
      setNotification({ type: 'success', message: 'Tablero actualizado exitosamente.' });
      closeEditModal();
    } catch (error) {
      if (error.response && error.response.status === 403) {
        setNotification({ type: 'unauthorized', message: 'No tienes permisos para esta acción.' });
      } else {
        setNotification({ type: 'error', message: 'Error al agregar el tablero.' });
      }
    }
  };

  const handleMostrar = async (boardId) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axiosInstance.get(`https://localhost:7289/api/Slides/List-Slide-by-board?boardId=${boardId}`, {
        headers: {
          Authorization: `Bearer ${token}`, // Añadimos el token a los headers
        },
      });
      
      if (response.data.length > 0) {
        const slides = response.data.filter(slide => slide.slideStatus === true);
        if (slides.length > 0) {
          let currentIndex = 0;
          const newTab = window.open(slides[currentIndex].url, '_blank');
  
          const showNextSlide = () => {
            const currentSlide = slides[currentIndex];
            const currentUrl = currentSlide.url;
            newTab.location.href = currentUrl;
  
            currentIndex = (currentIndex + 1) % slides.length;
  
            setTimeout(showNextSlide, currentSlide.time * 60 * 1000);
          };
  
          showNextSlide();
        } else {
          navigate(`/slides/${boardId}/add`);
        }
      } else {
        navigate(`/slides/${boardId}/add`);
      }
    } catch (error) {
      setNotification({ type: 'error', message: 'No hay Slides para ver.' });
    }
  };

  return (
    <div className="boards-form h-full min-h-screen min-w-screen flex flex-col bg-gray-100">
      <HeaderForm />
  
      {loading ? (
        <p className="text-gray-600 text-center">Cargando...</p>
      ) : (
        <div className="categories-container w-full flex flex-col gap-4 p-4">
          {categories.length > 0 ? (
            categories.map((category) => {
              const categoryBoards = boards.filter(
                (board) => board.categoryId === category.categoryId
              );
  
              console.log(`Tableros para la categoria ${category.categoryId}:`, categoryBoards);
  
              const page = currentPage[category.categoryId] || 1;
              const indexOfLastBoard = page * boardsPerPage;
              const indexOfFirstBoard = indexOfLastBoard - boardsPerPage;
              const paginatedCategoryBoards = categoryBoards.slice(
                indexOfFirstBoard,
                indexOfLastBoard
              );
  
              const totalPages = Math.ceil(categoryBoards.length / boardsPerPage);
  
              return (
                <div key={category.categoryId} className="category-board w-full bg-white shadow-md rounded-md p-4">
                  <h2 onClick={() => handleCategoryClick(category.categoryId)} className="text-xl font-normal text-gray-800 cursor-pointer">
                    {category.categoryTitle}
                  </h2>
                  {expandedCategory === category.categoryId && (
                    <div className="boards-list">
                      <button className="add-board-button bg-green-500 text-white py-2 rounded-md w-full mb-2" onClick={() => openModal(category.categoryId)}>+ Agregar Tablero</button>
                      {paginatedCategoryBoards.length > 0 ? (
                        paginatedCategoryBoards.map((board) => (
                          <div key={board.boardId} className="board-card w-full flex flex-col bg-white rounded-md shadow-md p-4 mb-4">
                            <h3 className="text-lg font-normal text-gray-800">{board.boardTitle}</h3>
                            <p className="text-gray-600 mb-2">{board.boardDescription}</p>
                            <div className="board-actions flex flex-col sm:flex-row justify-between">
                              <button
                                className="edit-board-button pl-5 pr-5 bg-yellow-400 text-white py-2 px-4 rounded-md mb-2 sm:mb-0"
                                onClick={() => handleEditBoard(board.boardId, board.boardTitle, board.boardDescription, board.categoryId)}
                              >
                                Editar
                              </button>
                              <button
                                className="view-slides-button pl-5 pr-5 bg-blue-500 text-white py-2 px-4 rounded-md mb-2 sm:mb-0"
                                onClick={() => handleMostrar(board.boardId)}
                              >
                                Ver Slides
                              </button>
                              <button
                                className="enter-board-button pl-5 pr-5 bg-[#00CED1] text-white py-2 px-4 rounded-md"
                                onClick={() => navigate(`/slides/${board.boardId}`)}
                              >
                                Entrar
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-600">No hay tableros disponibles.</p>
                      )}
                      <div className="pagination flex flex-col sm:flex-row justify-between mt-2">
                        <button
                          className="prev-page-button bg-gray-300 text-gray-800 py-1 px-2 rounded-md mb-2 sm:mb-0"
                          disabled={page === 1}
                          onClick={() => paginateBoards(category.categoryId, page - 1)}
                        >
                          Anterior
                        </button>
                        <span>{`Página ${page} de ${totalPages}`}</span>
                        <button
                          className="next-page-button bg-gray-300 text-gray-800 py-1 px-2 rounded-md"
                          disabled={page === totalPages}
                          onClick={() => paginateBoards(category.categoryId, page + 1)}
                        >
                          Siguiente
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-gray-600">No hay categorías disponibles.</p>
          )}
        </div>
      )}
  
      {notification && (
        <Notification type={notification.type} message={notification.message} onClose={() => setNotification(null)} />
      )}
  
  {showModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    {/* Fondo oscuro */}
    <div
      className="absolute inset-0 bg-black bg-opacity-50"
      onClick={closeModal} // Cierra el modal al hacer click en el fondo oscuro
    ></div>

    {/* Contenido del modal */}
    <div className="modal-content relative bg-white rounded-md shadow-lg p-6 z-20">
      <h2 className="text-xl font-normal mb-4">Agregar Tablero</h2>
      <label className="block mb-2">Título:</label>
      <input
        type="text"
        value={newBoardTitle}
        onChange={(e) => setNewBoardTitle(e.target.value)}
        className="border rounded-md w-full p-2 mb-4"
        maxLength={30}
      />
      <label className="block mb-2">Descripción:</label>
      <textarea
        value={newBoardDescription}
        onChange={(e) => setNewBoardDescription(e.target.value)}
        className="border rounded-md w-full p-2 mb-4"
        maxLength={50}
      />
      <div className="modal-actions flex justify-end">
        <button className="cancel-button bg-red-500 text-gray-800 py-2 px-4 rounded-md mr-2" onClick={closeModal}>Cancelar</button>
        <button className="save-button bg-green-500 text-white py-2 px-4 rounded-md" onClick={handleAddBoard}>Guardar</button>
      </div>
    </div>
  </div>
)}

{showEditModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    {/* Fondo oscuro */}
    <div
      className="absolute inset-0 bg-black bg-opacity-50"
      onClick={closeEditModal} // Cierra el modal al hacer click en el fondo oscuro
    ></div>

    {/* Contenido del modal */}
    <div className="modal-content relative bg-white rounded-md shadow-lg p-6 z-20">
      <h2 className="text-xl font-normal mb-4">Editar Tablero</h2>
      <label className="block mb-2">Título:</label>
      <input
        type="text"
        value={editBoardTitle}
        onChange={(e) => setEditBoardTitle(e.target.value)}
        className="border rounded-md w-full p-2 mb-4"
        maxLength={30}
      />
      <label className="block mb-2">Descripción:</label>
      <textarea
        value={editBoardDescription}
        onChange={(e) => setEditBoardDescription(e.target.value)}
        className="border rounded-md w-full p-2 mb-4"
        maxLength={50}
      />
      <div className="modal-actions flex justify-end">
        <button className="cancel-button bg-red-500 text-gray-800 py-2 px-4 rounded-md mr-2" onClick={closeEditModal}>Cancelar</button>
        <button className="save-button bg-green-500 text-white py-2 px-4 rounded-md" onClick={handleUpdateBoard}>Actualizar</button>
      </div>
    </div>
  </div>
)}
    </div>
  );  
};

export default BoardsForm;
