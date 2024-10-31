import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../services/axiosConfig';
import Notification from '../Notification/Notification';
import HeaderForm from '../HeaderForm/HeaderForm';

const SlidesForm = () => {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const [slides, setSlides] = useState([]);
  const [newSlideTitle, setNewSlideTitle] = useState('');
  const [newSlideUrl, setNewSlideUrl] = useState('');
  const [newSlideTime, setNewSlideTime] = useState('');
  const [notification, setNotification] = useState(null);
  const [boardTitle, setBoardTitle] = useState('');
  const [editSlideId, setEditSlideId] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(true);
  const [createdBy, setCreatedBy] = useState('');
  const [createdDate, setCreatedDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [slidesPerPage] = useState(5);

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const response = await axiosInstance.get(`/api/Slides/List-Slide-by-board?boardId=${boardId}`);
        if (Array.isArray(response.data) && response.data.length > 0) {
          setSlides(response.data);
          setBoardTitle(response.data[0].board.titleBoard);
        } else {
          setSlides([]);
          setNotification({
            type: 'info',
            message: 'No hay Slides en este tablero.',
          });
          setTimeout(() => setNotification(null), 3000); // Eliminar la notificación después de 3 segundos
        }
      } catch (error) {
        setNotification({
          type: 'error',
          message: 'No hay Slides en este tablero.',
        });
        setTimeout(() => setNotification(null), 3000); // Eliminar la notificación después de 3 segundos
      }
    };

    if (boardId) {
      fetchSlides();
    } else {
      setNotification({
        type: 'error',
        message: 'ID de tablero no válido',
      });
      setTimeout(() => setNotification(null), 3000); // Eliminar la notificación después de 3 segundos
    }
  }, [boardId]);

  const isValidUrl = (url) => {
    const urlPattern = new RegExp(
      '^(https?:\\/\\/)?' +
      '((([a-zA-Z\\d]([a-zA-Z\\d-]*[a-zA-Z\\d])*)\\.)+[a-zA-Z]{2,}|' +
      '((\\d{1,3}\\.){3}\\d{1,3}))' +
      '(\\:\\d+)?(\\/[-a-zA-Z\\d%@_.~+&:]*)*' +
      '(\\?[;&a-zA-Z\\d%@_.,~+&:=-]*)?' +
      '(\\#[-a-zA-Z\\d_]*)?$', 'i'
    );
    return !!urlPattern.test(url);
  };

  const handleUrlFormat = (url) => {
    if (!url.startsWith('https:')) {
      return `https://${url}`;
    }
    return url;
  };

  const handleAddSlide = async () => {
    if (!newSlideTitle || !newSlideUrl || !newSlideTime) {
      setNotification({
        type: 'error',
        message: 'Por favor, complete todos los campos.',
      });
      setTimeout(() => setNotification(null), 3000); // Eliminar la notificación después de 3 segundos
      return;
    }

    const formattedUrl = handleUrlFormat(newSlideUrl);

    if (!isValidUrl(formattedUrl)) {
      setNotification({
        type: 'error',
        message: 'URL no válida. Por favor, ingrese una URL correcta.',
      });
      setTimeout(() => setNotification(null), 3000); // Eliminar la notificación después de 3 segundos
      return;
    }

    const slideTime = parseFloat(newSlideTime);
    if (isNaN(slideTime) || slideTime <= 0) {
      setNotification({
        type: 'error',
        message: 'El tiempo debe ser un número mayor a 0.',
      });
      setTimeout(() => setNotification(null), 3000); // Eliminar la notificación después de 3 segundos
      return;
    }

    try {
      const createdBy = localStorage.getItem('userId');

      const newSlide = {
        slideTitle: newSlideTitle,
        url: formattedUrl,
        time: slideTime,
        boardId: parseInt(boardId),
        slideStatus: true,
        createdBy: createdBy,
        editedBy: createdBy,
        createdDate: new Date().toISOString(),
        editedDate: new Date().toISOString(),
      };

      const response = await axiosInstance.post(`/api/Slides`, newSlide);
      setSlides([...slides, response.data]);
      setNotification({
        type: 'success',
        message: 'Slide agregada exitosamente.',
      });
      setTimeout(() => setNotification(null), 3000); // Eliminar la notificación después de 3 segundos
      resetForm();
    } catch (error) {
      if (error.response && error.response.status === 403) {
        setNotification({ type: 'unauthorized', message: 'No tienes permisos para esta acción.' });
      } else {
        setNotification({ type: 'error', message: 'Error al agregar el tablero.' });
      }
    }
  };

  const handleUpdateSlide = async () => {
    // Validaciones iniciales
    if (!newSlideTitle || !newSlideUrl || !newSlideTime) {
      setNotification({
        type: 'error',
        message: 'Por favor, complete todos los campos.',
      });
      setTimeout(() => setNotification(null), 3000);
      return;
    }
  
    const formattedUrl = handleUrlFormat(newSlideUrl);
  
    if (!isValidUrl(formattedUrl)) {
      setNotification({
        type: 'error',
        message: 'URL no válida. Por favor, ingrese una URL correcta.',
      });
      setTimeout(() => setNotification(null), 3000);
      return;
    }
  
    const slideTime = parseFloat(newSlideTime);
    if (isNaN(slideTime) || slideTime <= 0) {
      setNotification({
        type: 'error',
        message: 'El tiempo debe ser un número mayor a 0.',
      });
      setTimeout(() => setNotification(null), 3000);
      return;
    }
  
    const updatedSlide = {
      slideId: editSlideId,
      slideTitle: newSlideTitle,
      url: formattedUrl,
      time: slideTime,
      boardId: parseInt(boardId),
      slideStatus: currentStatus,
      createdBy: createdBy || "defaultUser",
      createdDate: createdDate || new Date().toISOString(),
      editedBy: localStorage.getItem('userId'),
      editedDate: new Date().toISOString(),
    };
  
    const confirmSave = window.confirm("¿Estás seguro de los cambios?");
    if (!confirmSave) {
      return;
    }
  
    // Llamada a la API
    try {
      const token = localStorage.getItem('token');
      const response = await axiosInstance.put(`https://localhost:7289/api/Slides/${editSlideId}`, updatedSlide, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      // Verificación de la respuesta
      console.log(response.data); // Verifica lo que recibes
      if (response.status === 200) {
        setSlides(slides.map(slide => (slide.slideId === editSlideId ? { ...slide, ...updatedSlide } : slide)));
        setNotification({ type: 'success', message: 'Slide actualizada exitosamente.' });
        resetForm();
        setTimeout(() => setNotification(null), 3000);
        setIsEditModalOpen(false); // Cierra el modal
        console.log("Modal cerrado");
      }
    } catch (error) {
      console.error(error); // Verifica el error en consola
      if (error.response && error.response.status === 403) {
        setNotification({ type: 'unauthorized', message: 'No tienes permisos para esta acción.' });
      } else {
        setNotification({ type: 'error', message: 'Error al actualizar el slide.' });
      }
    }
  };
      
  const toggleSlideStatus = async (slideId, currentStatus) => {
    try {
      await axiosInstance.delete(`/api/Slides/${slideId}?activate=${!currentStatus}`);
      setSlides(slides.map(slide => 
        slide.slideId === slideId ? { ...slide, slideStatus: !currentStatus } : slide
      ));
      setNotification({
        type: 'success',
        message: `Slide ${currentStatus ? 'deshabilitada' : 'activada'} exitosamente.`,
      });
      setTimeout(() => setNotification(null), 3000); // Eliminar la notificación después de 3 segundos
    } catch (error) {
      if (error.response && error.response.status === 403) {
        setNotification({ type: 'unauthorized', message: 'No tienes permisos para esta acción.' });
      } else {
        setNotification({ type: 'error', message: 'Error al agregar el tablero.' });
      }
    }
  };


  const openEditModal = (slide) => {
    setNewSlideTitle(slide.slideTitle);
    setNewSlideUrl(slide.url);
    setNewSlideTime(slide.time.toString());
    setEditSlideId(slide.slideId);
    setCurrentStatus(slide.slideStatus);
    setCreatedBy(slide.createdBy);
    setCreatedDate(slide.createdDate);
    setIsEditModalOpen(true);
  };

  const resetForm = () => {
    setNewSlideTitle('');
    setNewSlideUrl('');
    setNewSlideTime('');
    setEditSlideId(null);
    setIsEditModalOpen(false);
  };

  const handleGoBack = () => {
    navigate('/boards');
  };



  const indexOfLastSlide = currentPage * slidesPerPage;
  const indexOfFirstSlide = indexOfLastSlide - slidesPerPage;
  const currentSlides = slides.slice(indexOfFirstSlide, indexOfLastSlide);
  const totalPages = Math.ceil(slides.length / slidesPerPage);
  
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleVerTodasSlides = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axiosInstance.get(`/api/Slides/List-Slide-by-board?boardId=${boardId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
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
          setNotification({ type: 'error', message: 'No hay Slides disponibles.' });
        }
      } else {
        setNotification({ type: 'error', message: 'No hay Slides para mostrar.' });
      }
    } catch (error) {
      setNotification({ type: 'error', message: 'Error al cargar las Slides.' });
    }
  };  

  const handleMostrarSlideSeleccionada = async (slideId) => {
    const selectedSlide = currentSlides.find(slide => slide.slideId === slideId);
  
    if (selectedSlide) {
      try {
        const newTab = window.open(selectedSlide.url, '_blank');
        if (!newTab) {
          // Si el pop-up fue bloqueado
          setNotification({ type: 'error', message: 'Por favor, permite los pop-ups para ver la Slide.' });
        }
      } catch (error) {
        setNotification({ type: 'error', message: 'Error al abrir la Slide.' });
      }
    } else {
      setNotification({ type: 'error', message: 'Slide no encontrada.' });
    }
  };
  

  return (
    <div className="flex flex-col min-h-screen w-full bg-gray-100">
      <HeaderForm title={`Slides del Tablero: ${boardTitle}`} />
      <div className="p-5 flex-1">
        <div className="mb-4 flex items-center">
          <h2 className="text-2xl mb-4 font-normal">Agregar Slide</h2>
        </div>
        <div className="flex flex-col md:flex-row md:items-end md:space-x-3">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Título de la Slide"
              value={newSlideTitle}
              onChange={(e) => setNewSlideTitle(e.target.value)}
              className="p-3 border border-gray-300 rounded mb-2 w-full"
              maxLength={30}
            />
            <input
              type="text"
              placeholder="URL de la Slide"
              value={newSlideUrl}
              onChange={(e) => setNewSlideUrl(e.target.value)}
              className="p-3 border border-gray-300 rounded mb-2 w-full"
            />
            <input
              type="number"
              placeholder="Tiempo de la Slide"
              value={newSlideTime}
              onChange={(e) => {
                const value = parseInt(e.target.value, 10)
                if (value <= 1440){
                  setNewSlideTime(e.target.value)
                }
              }}
              className="p-3 border border-gray-300 rounded mb-2 w-full"
              min={1}
              max={1440}
            />
          </div>
          <div className="flex flex-col space-y-3 md:space-y-0 md:flex-col mb-4">
            <button
              onClick={handleAddSlide}
              className="p-3 mb-3 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Agregar Slide
            </button>
            <button
              onClick={handleVerTodasSlides}
              className="p-3 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Mostrar
            </button>
            <button
              onClick={handleGoBack}
              className="p-3 translate-y-3 bg-gray-600 text-white rounded hover:bg-gray-500"
            >
              Volver a tableros
            </button>
          </div>
        </div>
      </div>
  
      {notification && (
        <Notification type={notification.type} message={notification.message} onClose={() => setNotification(null)} />
      )}
  
      <h2 className="mt-5 text-2xl mb-5 font-normal">Lista de Slides</h2>
      <ul className="space-y-4">
        {currentSlides.map(slide => (
          <li key={slide.slideId} className="p-4 bg-white border rounded shadow font-normal">
            <h3 className="text-xl">{slide.slideTitle}</h3>
            <p className="text-black w-30 truncate">{slide.url}</p>
            <p className="text-black">Tiempo: {slide.time} segundos</p>
            <div className="flex space-x-2 mt-2">
              <button
                onClick={() => openEditModal(slide)}
                className="p-2 bg-yellow-400 text-white rounded hover:bg-yellow-500"
              >
                Editar
              </button>
              <button
                onClick={() => toggleSlideStatus(slide.slideId, slide.slideStatus)}
                className={`p-2 rounded text-white transition-colors duration-200 ${slide.slideStatus ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
              >
                {slide.slideStatus ? 'Deshabilitar' : 'Activar'}
              </button>
              <button
                onClick={() => handleMostrarSlideSeleccionada(slide.slideId)}
                className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Mostrar
              </button>
            </div>
          </li>
        ))}
      </ul>
  
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className={`p-3 rounded text-lg ${currentPage === 1 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-gray-500 hover:bg-gray-600 text-white'} transition duration-300`}
        >
          Anterior
        </button>
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className={`p-3 rounded text-lg ${currentPage === totalPages ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-gray-500 hover:bg-gray-600 text-white'} transition duration-300`}
        >
          Siguiente
        </button>
      </div>
  
      {/* Modal para editar Slide */}
      {isEditModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-5 rounded shadow-lg w-96">
            <h2 className="text-2xl mb-4">Editar Slide</h2>
            <input
              type="text"
              placeholder="Título de la Slide"
              value={newSlideTitle}
              onChange={(e) => setNewSlideTitle(e.target.value)}
              className="p-2 border border-gray-300 rounded mb-2"
              maxLength={30}
            />
            <input
              type="text"
              placeholder="URL de la Slide"
              value={newSlideUrl}
              onChange={(e) => setNewSlideUrl(e.target.value)}
              className="p-2 border border-gray-300 rounded mb-2"
            />
            <input
              type="number"
              placeholder="Tiempo de la Slide (en segundos)"
              value={newSlideTime}
              onChange={(e) => setNewSlideTime(e.target.value)}
              className="p-2 border border-gray-300 rounded mb-2"
            />
            <div className="flex justify-between">
              <button
                onClick={resetForm}
                className="p-2 bg-red-500 rounded hover:bg-gray-400"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdateSlide}
                className="p-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
  
};

export default SlidesForm;
