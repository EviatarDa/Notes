import './App.css';
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import NavigationBar from './components/NavigationBar';
import Register from './components/Register';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import {AuthProvider} from "./context/AuthContext";
import Notes from "./components/Notes";
function App() {
    return (
        <AuthProvider>
        <Router>
            <NavigationBar />
            <Routes>
                <Route path="/" element={<Notes  />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
        </Router>
        </AuthProvider>
    );
}
export default App;