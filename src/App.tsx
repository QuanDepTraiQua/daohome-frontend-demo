import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Rooms from './pages/Rooms';

const App: React.FC = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                

                <Route path="/login" element={<Login />} />
                

                <Route path="/rooms" element={<Rooms />} />
            </Routes>
        </BrowserRouter>
    );
};

export default App;