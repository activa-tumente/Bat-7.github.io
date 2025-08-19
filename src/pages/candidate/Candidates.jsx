import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Table } from '../../components/ui/Table';
import { useToast } from '../../hooks/useToast';

const Candidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [currentCandidate, setCurrentCandidate] = useState(null);
  const [formData, setFormData] = useState({
    id: null,
    firstName: '',
    lastName: '',
    email: '',
    gender: '',
    age: '',
    phone: '',
    education: '',
    position: ''
  });
  const { showSuccess, showError, showInfo } = useToast();

  // Datos de ejemplo para simular una API
  useEffect(() => {
    setIsLoading(true);
    // Simulación de carga de datos
    setTimeout(() => {
      const mockCandidates = [
        {
          id: 1,
          firstName: 'Juan',
          lastName: 'Pérez',
          email: 'juan.perez@example.com',
          gender: 'male',
          age: 28,
          phone: '+591 72345678',
          education: 'Licenciatura en Psicología',
          position: 'Psicólogo Clínico'
        },
        {
          id: 2,
          firstName: 'María',
          lastName: 'González',
          email: 'maria.gonzalez@example.com',
          gender: 'female',
          age: 32,
          phone: '+591 73456789',
          education: 'Maestría en Recursos Humanos',
          position: 'Especialista en RRHH'
        },
        {
          id: 3,
          firstName: 'Carlos',
          lastName: 'Rodríguez',
          email: 'carlos.rodriguez@example.com',
          gender: 'male',
          age: 25,
          phone: '+591 74567890',
          education: 'Ingeniería en Sistemas',
          position: 'Desarrollador Web'
        }
      ];
      setCandidates(mockCandidates);
      setIsLoading(false);
    }, 800);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSelectChange = (value, name) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const resetForm = () => {
    setFormData({
      id: null,
      firstName: '',
      lastName: '',
      email: '',
      gender: '',
      age: '',
      phone: '',
      education: '',
      position: ''
    });
    setCurrentCandidate(null);
  };

  const openModal = (candidate = null) => {
    if (candidate) {
      setFormData({
        id: candidate.id,
        firstName: candidate.firstName,
        lastName: candidate.lastName,
        email: candidate.email,
        gender: candidate.gender,
        age: candidate.age.toString(),
        phone: candidate.phone,
        education: candidate.education,
        position: candidate.position
      });
      setCurrentCandidate(candidate);
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      showError('El nombre es obligatorio');
      return false;
    }
    if (!formData.lastName.trim()) {
      showError('El apellido es obligatorio');
      return false;
    }
    if (!formData.email.trim()) {
      showError('El email es obligatorio');
      return false;
    }
    // Validación básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showError('El formato de email no es válido');
      return false;
    }
    if (!formData.gender) {
      showError('El género es obligatorio');
      return false;
    }
    if (!formData.age.trim()) {
      showError('La edad es obligatoria');
      return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    // Simulación de operación con la API
    setIsLoading(true);
    
    setTimeout(() => {
      const newCandidate = {
        ...formData,
        id: formData.id || Date.now(),
        age: parseInt(formData.age, 10)
      };
      
      if (currentCandidate) {
        // Actualizar candidato existente
        setCandidates(candidates.map(c => 
          c.id === newCandidate.id ? newCandidate : c
        ));
        showSuccess('Candidato actualizado correctamente');
      } else {
        // Agregar nuevo candidato
        setCandidates([...candidates, newCandidate]);
        showSuccess('Candidato creado correctamente');
      }
      
      setIsLoading(false);
      closeModal();
    }, 600);
  };

  const handleDelete = (candidateId) => {
    if (window.confirm('¿Está seguro de eliminar este candidato?')) {
      setIsLoading(true);
      
      // Simulación de eliminación
      setTimeout(() => {
        setCandidates(candidates.filter(c => c.id !== candidateId));
        showInfo('Candidato eliminado correctamente');
        setIsLoading(false);
      }, 600);
    }
  };

  // Definir las columnas para la tabla
  const columns = [
    {
      header: '',
      accessor: 'gender',
      cell: ({ value }) => (
        <div className="flex justify-center">
          {value === 'male' ? (
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <i className="fas fa-mars text-blue-600"></i>
            </div>
          ) : value === 'female' ? (
            <div className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center">
              <i className="fas fa-venus text-pink-600"></i>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
              <i className="fas fa-genderless text-purple-600"></i>
            </div>
          )}
        </div>
      )
    },
    {
      header: 'Nombre',
      accessor: 'firstName',
      cell: ({ value, row }) => (
        <div>
          <div className="font-medium text-gray-900">
            {value} {row.lastName}
          </div>
          <div className="text-xs text-gray-500">
            {row.position || 'Sin cargo asignado'}
          </div>
        </div>
      )
    },
    {
      header: 'Email',
      accessor: 'email',
      cell: ({ value }) => (
        <div>
          <div className="text-gray-900">{value}</div>
          <div className="text-xs text-gray-500">
            <i className="fas fa-envelope mr-1"></i> Contacto principal
          </div>
        </div>
      )
    },
    {
      header: 'Teléfono',
      accessor: 'phone'
    },
    {
      header: 'Edad',
      accessor: 'age',
      cell: ({ value }) => (
        <div className="text-center bg-gray-100 rounded-lg py-1 px-2 w-12">
          {value}
        </div>
      )
    },
    {
      header: 'Formación',
      accessor: 'education'
    },
    {
      header: 'Acciones',
      accessor: 'id',
      cell: ({ value, row }) => (
        <div className="flex space-x-2">
          <button
            onClick={() => openModal(row)}
            className="text-blue-600 hover:text-sky-800 bg-blue-100 p-2 rounded-lg focus:outline-none transition-all duration-200"
            title="Editar"
          >
            <i className="fas fa-edit"></i>
          </button>
          <button
            onClick={() => handleDelete(value)}
            className="text-red-600 hover:text-red-800 bg-red-100 p-2 rounded-lg focus:outline-none transition-all duration-200"
            title="Eliminar"
          >
            <i className="fas fa-trash-alt"></i>
          </button>
        </div>
      )
    }
  ];

  // Opciones para el select de género
  const genderOptions = [
    { value: 'male', label: 'Masculino' },
    { value: 'female', label: 'Femenino' },
    { value: 'other', label: 'Otro' }
  ];

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Gestión de Candidatos</h1>
          <p className="text-gray-600">Administre la información de los candidatos para pruebas psicométricas</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button
            variant="primary"
            onClick={() => openModal()}
            className="flex items-center"
          >
            <i className="fas fa-plus mr-2"></i>
            Nuevo Candidato
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden shadow-lg border-0 rounded-xl">
        <CardHeader className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white border-0">
          <div className="flex items-center">
            <div className="bg-white/20 p-2 rounded-lg mr-3">
              <i className="fas fa-user-tie text-xl"></i>
            </div>
            <h2 className="text-xl font-semibold">Lista de Candidatos</h2>
          </div>
        </CardHeader>
        <CardBody>
          {isLoading ? (
            <div className="py-16 text-center">
              <div className="flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                <p className="text-gray-500">Cargando datos...</p>
              </div>
            </div>
          ) : (
            <Table
              data={candidates}
              columns={columns}
              pagination={{ pageSize: 5 }}
              searchable={true}
            />
          )}
        </CardBody>
      </Card>

      {/* Modal para crear/editar candidato */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative mx-auto p-5 w-full max-w-md md:max-w-lg">
            <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white py-4 px-6 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-white/20 h-8 w-8 rounded-lg flex items-center justify-center mr-3">
                    <i className="fas fa-user-tie"></i>
                  </div>
                  <h3 className="text-lg font-medium">
                    {currentCandidate ? 'Editar Candidato' : 'Nuevo Candidato'}
                  </h3>
                </div>
                <button 
                  onClick={closeModal}
                  className="text-white hover:text-gray-200 focus:outline-none"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="Nombre"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      Apellido <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Apellido"
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Email"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                      Género <span className="text-red-500">*</span>
                    </label>
                    <Select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleSelectChange}
                      options={genderOptions}
                      placeholder="Seleccionar género"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                      Edad <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      id="age"
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      placeholder="Edad"
                      min="18"
                      max="100"
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono
                  </label>
                  <Input
                    type="text"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Teléfono"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="education" className="block text-sm font-medium text-gray-700 mb-1">
                    Formación Académica
                  </label>
                  <Input
                    type="text"
                    id="education"
                    name="education"
                    value={formData.education}
                    onChange={handleInputChange}
                    placeholder="Formación académica"
                  />
                </div>
                
                <div className="mb-6">
                  <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
                    Cargo o Posición
                  </label>
                  <Input
                    type="text"
                    id="position"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    placeholder="Cargo o posición"
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeModal}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Guardando...
                      </>
                    ) : (
                      'Guardar'
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Candidates;