import React, { useState, useCallback, useEffect } from 'react';
import { CalculationResult } from '../types';
import { STANDARD_MORTAR_JOINT_MM, BRICK_TYPES } from '../constants';
import { RulerIcon, BrickIcon, MortarIcon } from './icons';

// Define child components outside the parent to prevent re-renders
interface InputFieldProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon: React.ReactNode;
  unit?: string;
  disabled?: boolean;
  step?: string;
}

const InputField: React.FC<InputFieldProps> = ({ label, value, onChange, icon, unit, disabled = false, step }) => (
  <div className="flex flex-col gap-1.5">
    <label htmlFor={label} className="text-sm font-medium text-slate-600 flex items-center gap-2">
      {icon}
      {label}
    </label>
    <div className="relative">
      <input
        id={label}
        type="number"
        value={value}
        onChange={onChange}
        disabled={disabled}
        step={step}
        className={`w-full pl-4 py-2 bg-slate-50 border border-slate-300 rounded-md shadow-sm focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed ${unit ? 'pr-12' : 'pr-4'}`}
        aria-label={label}
      />
      {unit && <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500">{unit}</span>}
    </div>
  </div>
);


interface BrickVisualizerProps {
    units: number;
    unitLength: number;
    mortarJoint: number;
}

const BrickVisualizer: React.FC<BrickVisualizerProps> = ({ units, unitLength, mortarJoint }) => {
    const unitArray = [];
    let remainingUnits = units;

    while (remainingUnits > 0) {
        if (remainingUnits >= 1) {
            unitArray.push(1);
            remainingUnits -= 1;
        } else if (remainingUnits > 0) {
            unitArray.push(0.5);
            remainingUnits = 0;
        }
    }

    if (unitArray.length === 0) return null;

    const BASE_UNIT_LENGTH = 215; // Standard UK Brick as baseline
    const BASE_WIDTH_PX = 120;
    const fullWidth = Math.max(60, (unitLength / BASE_UNIT_LENGTH) * BASE_WIDTH_PX); // Ensure a minimum width
    const halfWidth = fullWidth / 2;


    return (
        <div className="mt-4 p-4 bg-orange-100 rounded-lg overflow-x-auto">
            <div className="flex items-center space-x-1" style={{ width: 'fit-content' }}>
                {unitArray.map((size, index) => (
                    <React.Fragment key={index}>
                        <div
                            className={`h-12 bg-slate-700 rounded-sm flex items-center justify-center text-white text-xs font-mono transition-all duration-500`}
                            style={{
                                width: `${size === 1 ? fullWidth : halfWidth}px`,
                                minWidth: `${size === 1 ? fullWidth : halfWidth}px`,
                            }}
                        >
                            {size === 1 ? 'Full' : 'Half'}
                        </div>
                        {index < unitArray.length - 1 && (
                            <div
                                className="h-12 bg-slate-400"
                                style={{ width: `${mortarJoint > 0 ? '5px' : '0px'}`, minWidth: '5px' }}
                            ></div>
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

const HeightVisualizer: React.FC<{ courses: number; unitHeight: number; mortarJoint: number }> = ({ courses, unitHeight, mortarJoint }) => {
    if (courses <= 0 || isNaN(courses)) return null;

    const courseArray = Array.from({ length: Math.ceil(courses) });

    const BASE_UNIT_HEIGHT = 65; // Standard UK brick height
    const BASE_HEIGHT_PX = 40;
    const courseHeight = Math.max(20, (unitHeight / BASE_UNIT_HEIGHT) * BASE_HEIGHT_PX);

    return (
        <div className="mt-4 p-4 bg-orange-100 rounded-lg flex justify-center">
            <div className="flex flex-col-reverse items-center space-y-1" style={{ height: 'fit-content' }}>
                {courseArray.map((_, index) => (
                    <React.Fragment key={index}>
                        <div
                            className={`w-48 bg-slate-700 rounded-sm flex items-center justify-center text-white text-xs font-mono transition-all duration-500`}
                            style={{
                                height: `${courseHeight}px`,
                            }}
                        >
                            Course {index + 1}
                        </div>
                        {index < courseArray.length - 1 && (
                            <div
                                className="w-48 bg-slate-400"
                                style={{ height: `${mortarJoint > 0 ? '5px' : '0px'}` }}
                            ></div>
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

type Unit = 'mm' | 'cm' | 'm';
const UNITS: Unit[] = ['mm', 'cm', 'm'];

interface UnitSelectorProps {
  selectedUnit: Unit;
  onUnitChange: (unit: Unit) => void;
}

const UnitSelector: React.FC<UnitSelectorProps> = ({ selectedUnit, onUnitChange }) => (
  <div className="flex bg-slate-200 p-0.5 rounded-md">
    {UNITS.map(unit => (
      <button
        key={unit}
        type="button"
        onClick={() => onUnitChange(unit)}
        className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
          selectedUnit === unit
            ? 'bg-white text-orange-600 shadow-sm'
            : 'bg-transparent text-slate-600 hover:bg-slate-100'
        }`}
      >
        {unit}
      </button>
    ))}
  </div>
);

const convertValue = (value: number, fromUnit: Unit, toUnit: Unit): number => {
    if (isNaN(value)) return 0;

    const rates: { [key in Unit]: number } = { mm: 1, cm: 10, m: 1000 };
    if (!rates[fromUnit] || !rates[toUnit]) return value;

    const valueInMm = value * rates[fromUnit];
    const result = valueInMm / rates[toUnit];
    
    const resultString = result.toString();
    if (resultString.includes('.') && resultString.split('.')[1].length > 5) {
        return parseFloat(result.toPrecision(8));
    }
    
    return result;
};


interface DimensionResultDisplayProps {
    label: string;
    valueMm: number;
    outputUnit: Unit;
    onUnitChange: (unit: Unit) => void;
}

const DimensionResultDisplay: React.FC<DimensionResultDisplayProps> = ({ label, valueMm, outputUnit, onUnitChange }) => (
    <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
        <span className="text-slate-600 font-medium">{label}:</span>
        <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-orange-600">
                {convertValue(valueMm, 'mm', outputUnit).toLocaleString()}
            </span>
            <UnitSelector selectedUnit={outputUnit} onUnitChange={onUnitChange} />
        </div>
    </div>
);

type ConnectionType = 'CO-' | 'CO+' | 'CO';
type CalculatorMode = 'dimension' | 'units';
type CalculationAxis = 'length' | 'height';

const BrickCalculator: React.FC = () => {
  const [calculationAxis, setCalculationAxis] = useState<CalculationAxis>('length');
  const [mode, setMode] = useState<CalculatorMode>('dimension');
  
  // Shared state
  const [selectedBrickType, setSelectedBrickType] = useState<string>(BRICK_TYPES[0].name);
  const [brickLength, setBrickLength] = useState<string>(BRICK_TYPES[0].length.toString());
  const [brickHeight, setBrickHeight] = useState<string>(BRICK_TYPES[0].height.toString());
  const [mortarJoint, setMortarJoint] = useState<string>(STANDARD_MORTAR_JOINT_MM.toString());
  const [connectionType, setConnectionType] = useState<ConnectionType>('CO-');
  const [error, setError] = useState<string>('');
  
  // State for "Calculate from Dimension/Height" mode
  const [targetDimension, setTargetDimension] = useState<string>('1000');
  const [inputUnit, setInputUnit] = useState<Unit>('mm');
  const [result, setResult] = useState<CalculationResult | null>(null);

  // State for "Calculate from Units/Courses" mode
  const [numberOfUnits, setNumberOfUnits] = useState<string>('4');
  const [dimensionResult, setDimensionResult] = useState<{ totalDimension: number } | null>(null);

  // Output unit state
  const [outputUnit, setOutputUnit] = useState<Unit>('mm');
  
  const isLength = calculationAxis === 'length';
  const dimensionTerm = isLength ? 'Dimension' : 'Height';
  const unitsTerm = isLength ? 'Units' : 'Courses';
  const lengthTerm = isLength ? 'Length' : 'Height';

  const handleInputUnitChange = (newUnit: Unit) => {
    const currentValue = parseFloat(targetDimension);
    if (!isNaN(currentValue)) {
      const convertedValue = convertValue(currentValue, inputUnit, newUnit);
      setTargetDimension(String(convertedValue));
    }
    setInputUnit(newUnit);
  };


  const handleBrickTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value;
    setSelectedBrickType(newType);

    if (newType !== 'Custom') {
      const selectedBrick = BRICK_TYPES.find(b => b.name === newType);
      if (selectedBrick) {
        setBrickLength(selectedBrick.length.toString());
        setBrickHeight(selectedBrick.height.toString());
      }
    }
  };

  const calculateUnitsFromDimension = useCallback(() => {
    const target = parseFloat(targetDimension);
    const unitSize = parseFloat(isLength ? brickLength : brickHeight);
    const joint = parseFloat(mortarJoint);

    if (isNaN(target) || isNaN(unitSize) || isNaN(joint) || target <= 0 || unitSize <= 0 || joint < 0) {
      setError('Please enter valid, positive numbers for all dimensions.');
      setResult(null);
      return;
    }
    setError('');

    const targetInMm = convertValue(target, inputUnit, 'mm');

    const effectiveUnitSize = unitSize + joint;
    if (effectiveUnitSize <= 0) {
        setError(`The effective unit ${lengthTerm.toLowerCase()} (unit + mortar) must be positive.`);
        setResult(null);
        return;
    }

    let idealUnits: number;
    if (connectionType === 'CO+') {
      idealUnits = targetInMm / effectiveUnitSize;
    } else {
      idealUnits = (targetInMm + joint) / effectiveUnitSize;
    }
    
    const unitsNeeded = isLength ? Math.round(idealUnits * 2) / 2 : Math.round(idealUnits);

    if (unitsNeeded <= 0) {
        setError(`Calculation resulted in zero or fewer ${unitsTerm.toLowerCase()}. Please check your inputs.`);
        setResult(null);
        return;
    }

    let adjustedDimension: number;
    if (connectionType === 'CO+') {
      adjustedDimension = unitsNeeded * unitSize + unitsNeeded * joint;
    } else {
      const numJoints = Math.ceil(unitsNeeded > 1 ? unitsNeeded - 1 : 0);
      adjustedDimension = unitsNeeded * unitSize + numJoints * joint;
    }

    setResult({
      units: unitsNeeded,
      adjustedDimension: parseFloat(adjustedDimension.toFixed(2)),
    });
    setDimensionResult(null);
  }, [targetDimension, brickLength, brickHeight, mortarJoint, connectionType, calculationAxis, isLength, lengthTerm, unitsTerm, inputUnit]);

  const calculateDimensionFromUnits = useCallback(() => {
    const units = parseFloat(numberOfUnits);
    const unitSize = parseFloat(isLength ? brickLength : brickHeight);
    const joint = parseFloat(mortarJoint);

    if (isNaN(units) || isNaN(unitSize) || isNaN(joint) || units <= 0 || unitSize <= 0 || joint < 0) {
      setError('Please enter valid, positive numbers for all inputs.');
      setDimensionResult(null);
      return;
    }
    setError('');

    let totalDimension: number;
    if (connectionType === 'CO+') {
      totalDimension = units * unitSize + units * joint;
    } else {
      const numJoints = Math.ceil(units > 1 ? units - 1 : 0);
      totalDimension = units * unitSize + numJoints * joint;
    }

    setDimensionResult({
      totalDimension: parseFloat(totalDimension.toFixed(2)),
    });
    setResult(null);
  }, [numberOfUnits, brickLength, brickHeight, mortarJoint, connectionType, isLength]);


  useEffect(() => {
    if (mode === 'dimension') {
        calculateUnitsFromDimension();
    } else {
        calculateDimensionFromUnits();
    }
  }, [mode, calculateUnitsFromDimension, calculateDimensionFromUnits, calculationAxis]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'dimension') {
        calculateUnitsFromDimension();
    } else {
        calculateDimensionFromUnits();
    }
  };
  
  const connectionTypes: { id: ConnectionType; label: string; description: string }[] = [
      { id: 'CO-', label: 'CO-', description: 'Between Faces: For walls built between two existing points. Calculated as Work Size.' },
      { id: 'CO', label: 'CO', description: 'Overall Length: For the total length of a standalone wall. Calculated as Work Size.' },
      { id: 'CO+', label: 'CO+', description: 'Opening Size: For openings like windows or doors. Calculated as Co-ordinating Size.' },
  ];

  const hasResult = (mode === 'dimension' && result) || (mode === 'units' && dimensionResult);

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <div className="bg-white p-6 rounded-xl shadow-lg">
         <div className="mb-4">
            <div className="flex p-1 bg-slate-100 rounded-lg">
                <button onClick={() => setCalculationAxis('length')} className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${calculationAxis === 'length' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-600 hover:bg-slate-200'}`}>
                    Length Calculator
                </button>
                <button onClick={() => setCalculationAxis('height')} className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${calculationAxis === 'height' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-600 hover:bg-slate-200'}`}>
                    Height Calculator
                </button>
            </div>
         </div>
        
        <h2 className="text-xl font-bold text-slate-800 mb-2">Input Dimensions</h2>
        
        <div className="border-b border-slate-200 mb-4">
            <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                <button
                    onClick={() => setMode('dimension')}
                    className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                        mode === 'dimension'
                        ? 'border-orange-500 text-orange-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                    }`}
                >
                    From {dimensionTerm}
                </button>
                <button
                    onClick={() => setMode('units')}
                    className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                        mode === 'units'
                        ? 'border-orange-500 text-orange-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                    }`}
                >
                    From {unitsTerm}
                </button>
            </nav>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'dimension' ? (
             <div className="flex flex-col gap-1.5">
                <label htmlFor="target-dimension" className="text-sm font-medium text-slate-600 flex items-center gap-2">
                    <RulerIcon className="w-5 h-5 text-slate-400" />
                    {`Target ${dimensionTerm}`}
                </label>
                <div className="flex items-center gap-2">
                    <div className="relative flex-grow">
                        <input
                            id="target-dimension"
                            type="number"
                            value={targetDimension}
                            onChange={(e) => setTargetDimension(e.target.value)}
                            className="w-full pl-4 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-md shadow-sm focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
                            aria-label={`Target ${dimensionTerm}`}
                        />
                    </div>
                    <UnitSelector selectedUnit={inputUnit} onUnitChange={handleInputUnitChange} />
                </div>
            </div>
           ) : (
            <InputField
                label={`Number of ${unitsTerm}`}
                value={numberOfUnits}
                onChange={(e) => setNumberOfUnits(e.target.value)}
                icon={<BrickIcon className="w-5 h-5 text-slate-400" />}
                step={isLength ? "0.5" : "1"}
            />
           )}

          <fieldset className="flex flex-col gap-1.5">
            <legend className="text-sm font-medium text-slate-600">Connection Type</legend>
            <div className="grid grid-cols-3 gap-1 bg-slate-200 p-1 rounded-md">
                {connectionTypes.map(type => (
                    <div key={type.id} className="relative group flex justify-center">
                        <input
                            type="radio"
                            id={type.id}
                            name="connectionType"
                            value={type.id}
                            checked={connectionType === type.id}
                            onChange={() => setConnectionType(type.id)}
                            className="sr-only"
                        />
                        <label
                            htmlFor={type.id}
                            className={`w-full block text-center text-sm font-semibold py-2 px-1 rounded cursor-pointer transition-colors duration-200 ${
                                connectionType === type.id
                                    ? 'bg-white text-orange-600 shadow-sm'
                                    : 'bg-transparent text-slate-600 hover:bg-slate-100'
                            }`}
                        >
                            {type.label}
                        </label>
                         <div
                          className="absolute bottom-full mb-2 w-max max-w-xs z-10 p-2 text-xs font-medium text-white bg-slate-900 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                          role="tooltip"
                        >
                          {type.description}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-slate-900" />
                        </div>
                    </div>
                ))}
            </div>
          </fieldset>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="unit-type" className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <BrickIcon className="w-5 h-5 text-slate-500" />
              Unit Type (Brick/Block)
            </label>
            <div className="relative">
              <select
                id="unit-type"
                value={selectedBrickType}
                onChange={handleBrickTypeChange}
                className="w-full appearance-none bg-slate-50 pl-3 pr-10 py-2 border border-slate-300 rounded-md shadow-sm focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2364748b' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 0.5rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5em 1.5em',
                }}
              >
                {BRICK_TYPES.map((brick) => (
                  <option key={brick.name} value={brick.name}>
                    {brick.name} ({isLength ? brick.length : brick.height}mm)
                  </option>
                ))}
                <option value="Custom">Custom Dimensions</option>
              </select>
            </div>
          </div>
          
          {selectedBrickType === 'Custom' && (
            <InputField
                label={`Custom Unit ${lengthTerm}`}
                value={isLength ? brickLength : brickHeight}
                onChange={(e) => isLength ? setBrickLength(e.target.value) : setBrickHeight(e.target.value)}
                icon={<BrickIcon className="w-5 h-5 text-slate-400" />}
                unit="mm"
            />
          )}

          <InputField
            label="Mortar Joint Thickness"
            value={mortarJoint}
            onChange={(e) => setMortarJoint(e.target.value)}
            icon={<MortarIcon className="w-5 h-5 text-slate-500" />}
            unit="mm"
          />
          <button
            type="submit"
            className="w-full bg-orange-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition duration-150 ease-in-out"
          >
            Calculate
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg sticky top-8">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Unit Configuration & Results</h2>
        <div className="space-y-4">
            {selectedBrickType !== 'Custom' && (
                <div className="flex justify-between items-baseline p-4 bg-slate-50 rounded-lg">
                    <label htmlFor="unit-dim" className="text-slate-600 font-medium flex items-center gap-2">
                        <BrickIcon className="w-5 h-5 text-slate-500" />
                        <span>Unit {lengthTerm}:</span>
                    </label>
                    <div className="flex items-baseline">
                        <input
                            id="unit-dim"
                            type="number"
                            value={isLength ? brickLength : brickHeight}
                            onChange={(e) => isLength ? setBrickLength(e.target.value) : setBrickHeight(e.target.value)}
                            disabled={selectedBrickType !== 'Custom'}
                            className="w-24 text-right bg-transparent text-3xl font-bold text-orange-600 p-0 border-0 focus:ring-0 focus:outline-none disabled:text-slate-800 disabled:cursor-not-allowed"
                            aria-label={`Unit ${lengthTerm}`}
                        />
                        <span className={`text-xl ml-1 font-bold ${selectedBrickType === 'Custom' ? 'text-orange-600' : 'text-slate-800'}`}>
                            mm
                        </span>
                    </div>
                </div>
            )}
        </div>
        <div className={`mt-6 pt-6 ${selectedBrickType !== 'Custom' ? 'border-t border-slate-200' : ''}`}>
            {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-4" role="alert">{error}</div>}
            
            {!hasResult && !error && <p className="text-slate-500 text-center py-8">Enter inputs to see the results.</p>}

            {hasResult && (
              <div className="space-y-4">
                {mode === 'dimension' && result && (
                  <>
                    <div className="flex justify-between items-baseline p-4 bg-slate-50 rounded-lg">
                    <span className="text-slate-600 font-medium">{unitsTerm} Required:</span>
                    <span className="text-3xl font-bold text-orange-600">{result.units}</span>
                    </div>
                    <DimensionResultDisplay
                        label={`Adjusted ${dimensionTerm}`}
                        valueMm={result.adjustedDimension}
                        outputUnit={outputUnit}
                        onUnitChange={setOutputUnit}
                    />
                  </>
                )}
                 {mode === 'units' && dimensionResult && (
                    <DimensionResultDisplay
                        label={`Total ${lengthTerm}`}
                        valueMm={dimensionResult.totalDimension}
                        outputUnit={outputUnit}
                        onUnitChange={setOutputUnit}
                    />
                 )}
                <div>
                  <h3 className="text-md font-semibold text-slate-700 mt-2 mb-2">Visual Representation</h3>
                  {isLength ? (
                    <BrickVisualizer 
                      units={mode === 'dimension' ? (result?.units ?? 0) : (parseFloat(numberOfUnits) || 0)} 
                      unitLength={parseFloat(brickLength)} 
                      mortarJoint={parseFloat(mortarJoint)} 
                    />
                  ) : (
                    <HeightVisualizer 
                      courses={mode === 'dimension' ? (result?.units ?? 0) : (parseFloat(numberOfUnits) || 0)} 
                      unitHeight={parseFloat(brickHeight)} 
                      mortarJoint={parseFloat(mortarJoint)} 
                    />
                  )}
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default BrickCalculator;
