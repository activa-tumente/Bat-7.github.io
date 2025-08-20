/**
 * @file PackageCard.jsx
 * @description Reusable package card component for usage control
 */

import React from 'react';
import { Card, CardBody } from '../ui/Card';
import { Button } from '../ui/Button';

const PackageCard = ({ 
  paquete, 
  onPurchase, 
  disabled = false,
  'aria-label': ariaLabel 
}) => {
  const formatPrice = (price) => price.toLocaleString('es-ES');
  const pricePerUse = Math.round(paquete.precio / paquete.cantidad);

  const handlePurchase = () => {
    if (onPurchase && !disabled) {
      onPurchase(paquete);
    }
  };

  return (
    <Card 
      className={`relative border-2 transition-all duration-200 hover:shadow-lg ${
        paquete.popular ? 'border-purple-300 bg-purple-50' : 'border-gray-200'
      }`}
      role="article"
      aria-label={ariaLabel || `Paquete de ${paquete.cantidad} usos`}
    >
      {paquete.popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-bold">
            MÁS POPULAR
          </span>
        </div>
      )}
      
      <CardBody className="p-6 text-center">
        <div className={`w-16 h-16 ${paquete.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
          <i className="fas fa-gift text-2xl text-white" aria-hidden="true"></i>
        </div>
        
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          {paquete.cantidad} Usos
        </h3>
        
        <p className="text-gray-600 text-sm mb-4">{paquete.descripcion}</p>
        
        <div className="mb-4">
          <p className="text-3xl font-bold text-gray-800">
            {formatPrice(paquete.precio)}
          </p>
          <p className="text-sm text-gray-500">
            {formatPrice(pricePerUse)} por uso
          </p>
        </div>
        
        <Button
          onClick={handlePurchase}
          disabled={disabled}
          className={`w-full ${paquete.popular 
            ? 'bg-purple-500 hover:bg-purple-600' 
            : 'bg-blue-500 hover:bg-blue-600'
          } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
          aria-label={`Comprar paquete de ${paquete.cantidad} usos por ${formatPrice(paquete.precio)}`}
        >
          <i className="fas fa-credit-card mr-2" aria-hidden="true"></i>
          Comprar Paquete
        </Button>
      </CardBody>
    </Card>
  );
};

export default PackageCard;