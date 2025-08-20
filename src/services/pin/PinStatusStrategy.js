import { PIN_CONSTANTS } from './PinConstants';

/**
 * Strategy pattern for different pin status display behaviors
 */
export class PinStatusStrategy {
  getDisplayInfo(pinStatus) {
    throw new Error('getDisplayInfo must be implemented by subclass');
  }
}

export class UnlimitedPinStrategy extends PinStatusStrategy {
  getDisplayInfo(pinStatus) {
    return {
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: 'FaInfinity',
      text: 'Pines Ilimitados',
      showProgress: false,
      severity: 'success'
    };
  }
}

export class ActivePinStrategy extends PinStatusStrategy {
  getDisplayInfo(pinStatus) {
    const isLow = pinStatus.remainingPins <= PIN_CONSTANTS.THRESHOLDS.LOW_PIN_WARNING;
    
    return {
      color: isLow ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 'bg-blue-100 text-blue-800 border-blue-200',
      icon: 'FaCoins',
      text: `${pinStatus.remainingPins} Pines`,
      showProgress: true,
      severity: isLow ? 'warning' : 'info'
    };
  }
}

export class NoPinStrategy extends PinStatusStrategy {
  getDisplayInfo(pinStatus) {
    return {
      color: 'bg-red-100 text-red-800 border-red-200',
      icon: 'FaExclamationTriangle',
      text: 'Sin Pines',
      showProgress: false,
      severity: 'error'
    };
  }
}

/**
 * Factory for creating pin status strategies
 */
export class PinStatusStrategyFactory {
  static createStrategy(pinStatus) {
    if (!pinStatus) return new NoPinStrategy();
    
    if (pinStatus.isUnlimited) return new UnlimitedPinStrategy();
    if (!pinStatus.canUse) return new NoPinStrategy();
    return new ActivePinStrategy();
  }
}