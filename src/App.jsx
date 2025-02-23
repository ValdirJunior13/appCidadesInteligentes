
import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Hidrico from "./pages/Hidrico";
import Lixo from "./pages/Lixo";
import Header from "./components/Header";
import Footer from "./components/FooterComponent";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro"
import '../src/index.css';
import Iluminacao from "./pages/Iluminacao";

const App = () => {
    return (
        <Router>
        <Header />
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/hidrico" element={<Hidrico />} />
            <Route path="/lixo" element={<Lixo />} />
            <Route path="/login" element={<Login />} />
            <Route path ="/cadastro" element ={<Cadastro />}/>
            <Route path ="/Iluminacao" element ={<Iluminacao />}/>
            </Routes>
        <Footer />
        </Router>
    );
    };

export default App;
