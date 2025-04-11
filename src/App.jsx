import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Hidrico from "./pages/Hidrico";
import Lixo from "./pages/Lixo";
import Header from "./components/Header";
import Footer from "./components/FooterComponent";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import Data from "./pages/Data";
import Error from "./pages/404";
import Iluminacao from "./pages/Iluminacao";
import PaginaLogin from "./pages/PaginaLogin";
import { AuthProvider } from "./context/AuthContext"; // << aqui agora
import "leaflet/dist/leaflet.css";
import "../src/index.css";

const App = () => {
    return (
        <AuthProvider>
            <Router>
                <Header />
                <Routes>
                    <Route path="/home" element={<Home />} />
                    <Route path="/hidrico" element={<Hidrico />} />
                    <Route path="/lixo" element={<Lixo />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/cadastro" element={<Cadastro />} />
                    <Route path="/iluminacao" element={<Iluminacao />} />
                    <Route path="/data" element={<Data />} />
                    <Route path="/404" element={<Error />} />
                    <Route path="/paginaLogin" element={<PaginaLogin />} />
                </Routes>
                <Footer />
            </Router>
        </AuthProvider>
    );
};

export default App;
