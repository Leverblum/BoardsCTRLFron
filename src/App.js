import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginForm from './Components/LoginForm/LoginForm'; 
import CategoriesForm from './Components/CategoriesForm/CategoriesForm';
import BoardsForm from './Components/BoardsForm/BoardsForm';
import SlidesForm from './Components/SlidesForm/SlidesForm';
import './index.css';

const PrivateRoute = ({ children }) => {
    const isAuthenticated = !!localStorage.getItem('token');
    return isAuthenticated ? children : <Navigate to="/" />;
};

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LoginForm />} />
                <Route path="/categories" element={<PrivateRoute><CategoriesForm /></PrivateRoute>} />
                <Route path='/boards' element={<PrivateRoute><BoardsForm /></PrivateRoute>} />
                <Route path="/slides/:boardId" element={<PrivateRoute><SlidesForm /></PrivateRoute>} />
            </Routes>
        </Router>
    );
};

export default App;
