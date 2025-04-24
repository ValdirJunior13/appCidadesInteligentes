
import PropTypes from "prop-types";

const Quadrado = ({ imagem, alt, titulo, descricao }) => {
  return (
    <div className="p-6 border rounded-lg flex flex-col items-center text-center transition-colors duration-300 hover:bg-[#ffe999] hover:text-black relative bg-[#ffffff">
    
      <div className="w-28 h-28 bg-[#ffd952] rounded-full flex items-center justify-center">
      
        {imagem ? (
          <img
            src={imagem}
            alt={alt}
            className="w-20 h-20 object-cover "
          />
        ) : (
          <p>Erro ao carregar imagem</p>
        )}
      </div>

      <h3 className="text-lg font-bold mb-2 mt-4">{titulo}</h3>
      <p className="text-gray-600 text-sm">{descricao}</p>
    </div>
  );
};

Quadrado.propTypes = {
  imagem: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  titulo: PropTypes.string.isRequired,
  descricao: PropTypes.string.isRequired,
};

export default Quadrado;