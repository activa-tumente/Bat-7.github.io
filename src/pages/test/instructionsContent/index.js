// Archivo índice para exportar todos los contenidos de instrucciones
import verbalInstructions from './verbalInstructions';
import ortografiaInstructions from './ortografiaInstructions';
import razonamientoInstructions from './razonamientoInstructions';
import atencionInstructions from './atencionInstructions';
import espacialInstructions from './espacialInstructions';
import mecanicoInstructions from './mecanicoInstructions';
import numericoInstructions from './numericoInstructions';
import bat7Instructions from './bat7Instructions';

// Objeto de mapeo de tipo de test a sus instrucciones
const instructionsMap = {
  verbal: verbalInstructions,
  ortografia: ortografiaInstructions,
  razonamiento: razonamientoInstructions,
  atencion: atencionInstructions,
  espacial: espacialInstructions,
  mecanico: mecanicoInstructions,
  numerico: numericoInstructions,
  bat7: bat7Instructions,
};

export default instructionsMap;
