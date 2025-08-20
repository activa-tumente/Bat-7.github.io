import React from 'react';
import { Card, CardHeader, CardBody } from '../../ui/Card';

const InformacionPaciente = ({ paciente }) => {
  if (!paciente) return null;

  return (
    <Card className="mb-6 shadow-lg border-0">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white border-b-0">
        <div className="flex items-center">
          <div className="bg-white bg-opacity-20 p-3 rounded-full mr-4">
            <i className="fas fa-user-graduate text-2xl text-white"></i>
          </div>
          <div>
            <h3 className="text-xl font-bold">Información del Evaluado</h3>
            <p className="text-blue-100 text-sm">Datos personales y demográficos</p>
          </div>
        </div>
      </CardHeader>
      <CardBody className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Columna Izquierda - Datos Personales */}
          <div className="space-y-4">
            <h4 className="font-bold text-gray-800 text-lg mb-4 flex items-center border-b border-blue-200 pb-2">
              <i className="fas fa-id-card mr-2 text-blue-600"></i>
              Datos Personales
            </h4>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
              <div className="flex items-center mb-2">
                <i className="fas fa-user text-blue-600 w-5"></i>
                <span className="font-semibold text-gray-700 ml-2">Nombre Completo:</span>
              </div>
              <p className="text-lg font-bold text-gray-900 ml-7">
                {paciente?.nombre || 'No especificado'} {paciente?.apellido || ''}
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
              <div className="flex items-center mb-2">
                <i className="fas fa-id-badge text-blue-600 w-5"></i>
                <span className="font-semibold text-gray-700 ml-2">Documento de Identidad:</span>
              </div>
              <p className="text-lg font-bold text-gray-900 ml-7">
                {paciente?.documento || 'No especificado'}
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
              <div className="flex items-center mb-2">
                <i className={`fas ${paciente?.genero === 'Femenino' ? 'fa-venus' : paciente?.genero === 'Masculino' ? 'fa-mars' : 'fa-genderless'} text-blue-600 w-5`}></i>
                <span className="font-semibold text-gray-700 ml-2">Género:</span>
              </div>
              <p className="text-lg font-bold text-gray-900 ml-7">
                {paciente?.genero || 'No especificado'}
              </p>
            </div>
          </div>

          {/* Columna Derecha - Datos Demográficos */}
          <div className="space-y-4">
            <h4 className="font-bold text-gray-800 text-lg mb-4 flex items-center border-b border-blue-200 pb-2">
              <i className="fas fa-calendar-alt mr-2 text-blue-600"></i>
              Datos Demográficos
            </h4>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
              <div className="flex items-center mb-2">
                <i className="fas fa-birthday-cake text-blue-600 w-5"></i>
                <span className="font-semibold text-gray-700 ml-2">Fecha de Nacimiento:</span>
              </div>
              <p className="text-lg font-bold text-gray-900 ml-7">
                {paciente?.fecha_nacimiento ? 
                  new Date(paciente.fecha_nacimiento).toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'No especificado'}
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
              <div className="flex items-center mb-2">
                <i className="fas fa-hourglass-half text-blue-600 w-5"></i>
                <span className="font-semibold text-gray-700 ml-2">Edad:</span>
              </div>
              <p className="text-lg font-bold text-gray-900 ml-7">
                {paciente?.fecha_nacimiento ? 
                  Math.floor((new Date() - new Date(paciente.fecha_nacimiento)) / (365.25 * 24 * 60 * 60 * 1000)) + ' años' : 
                  'No calculable'}
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
              <div className="flex items-center mb-2">
                <i className="fas fa-calendar-check text-blue-600 w-5"></i>
                <span className="font-semibold text-gray-700 ml-2">Fecha de Evaluación:</span>
              </div>
              <p className="text-lg font-bold text-gray-900 ml-7">
                {new Date().toLocaleDateString('es-ES', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default InformacionPaciente;
