import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Hidrico from './pages/Hidrico';
import MainContent from './components/MainContent';
import Header from './components/Header';
import Footer from './components/Footer';

const App = () => {
    return (
        <Router>
            <Header />
            <MainContent />  {/* <- Aqui está sendo usado */}
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/hidrico" element={<Hidrico />} />
            </Routes>
            <Footer />
        </Router>
    );
};

export default App;
