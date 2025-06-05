import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Hidrico from "./pages/Hidrico";
import Lixo from "./pages/Lixo";
import Header from "./components/Header";
import Footer from "./components/FooterComponent";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import Data from "./pages/Data";
import NotFoundPage from "./pages/404";
import Iluminacao from "./pages/Iluminacao";
import LoginPage from "./pages/PaginaLogin";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import "leaflet/dist/leaflet.css";
import "./index.css";
import PropTypes from "prop-types";
import GerenciarCidades from "./pages/GerenciarCidades";
import IrrigacaoControl from "./pages/IrrigacaoControl";
import IluminacaoControl from "./pages/IluminacaoControl";
import DrenagemControl from "./pages/DrenagemControl";
import ConfiguracaoComponent from "./pages/ConfiguracaoComponent";    


const App = () => {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route
                        path="/home"
                        element={
                            <WithFullHeader>
                                <Home />
                            </WithFullHeader>
                        }
                    />
                    <Route
                path="/hidrico"
                element={
                    <WithFullHeader>
                    <Hidrico />
                    </WithFullHeader>
                }
                />
            <Route
            path="/lixo"
            element={
            <WithFullHeader>
                <Lixo />
            </WithFullHeader>
        }
    />
    <Route
        path="/iluminacaoinicio"
        element={
            <WithFullHeader>
                <Iluminacao />
            </WithFullHeader>
        }
    />
    <Route
        path="/data"
        element={
            <WithFullHeader>
                <Data />
            </WithFullHeader>
        }
    />

                    <Route
                path="/hidrico"
                element={
                    <WithFullHeader>
                    <Hidrico />
                    </WithFullHeader>
                }
                />
            <Route
            path="/lixo"
            element={
            <WithFullHeader>
                <Lixo />
            </WithFullHeader>
        }
    />
    <Route
        path="/iluminacaoinicio"
        element={
            <WithFullHeader>
                <Iluminacao />
            </WithFullHeader>
        }
    />
    <Route
        path="/data"
        element={
            <WithFullHeader>
                <Data />
            </WithFullHeader>
        }
    />
                    
                    <Route
                        path="/login"
                        element={
                            <WithHeader hideLogin>
                                <Login />
                            </WithHeader>
                        }
                    />
                    <Route
                        path="/register"
                        element={
                            <WithHeader hideRegister>
                                <Cadastro />
                            </WithHeader>
                        }
                    />
                    <Route
                        path="/404"
                        element={
                            <WithFullHeader>
                                <NotFoundPage />
                            </WithFullHeader>
                        }
                    />

                    {/* Rotas protegidas */}
        <Route element={<ProtectedRoute />}>
            <Route path ="/drenagem" element = {<DrenagemControl />} />
            <Route path = "/iluminacao" element = {<IluminacaoControl />} />
            <Route path = "/irrigacao" element={<IrrigacaoControl />} />
            <Route path = "/configuracoes" element = {<ConfiguracaoComponent />} />

    <Route
        path="/paginalogin"
        element={
                <LoginPage />
        }
    />
    <Route
        path="/gerenciamentocidades"
        element={

                <GerenciarCidades />
        }
    />
</Route>

{/* Redirecionamentos */}
<Route path="/" element={<Navigate to="/home" replace />} />
<Route path="*" element={<Navigate to="/404" replace />} />
                </Routes>

                <Footer />
            </Router>
        </AuthProvider>
    );
};

const WithFullHeader = ({ children }) => (
    <>
        <Header showLogin showRegister />
        {children}
    </>
);

WithFullHeader.propTypes = {
    children: PropTypes.node.isRequired,
};

const WithHeader = ({ children, hideLogin = false, hideRegister = false, hideBoth = false }) => (
    <>
        <Header
            showLogin={!hideLogin && !hideBoth}
            showRegister={!hideRegister && !hideBoth}
        />
        {children}
    </>
);

WithHeader.propTypes = {
    children: PropTypes.node.isRequired,
    hideLogin: PropTypes.bool,
    hideRegister: PropTypes.bool,
    hideBoth: PropTypes.bool,
};

export default App;
