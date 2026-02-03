'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Compass, 
  Hammer, 
  Layout, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Info,
  AlertCircle,
  Lightbulb
} from 'lucide-react';

interface ConstructionStep {
  id: number;
  title: string;
  description: string;
  details: string[];
  tips: string[];
  warnings?: string[];
}

const CONSTRUCTION_STEPS: ConstructionStep[] = [
  {
    id: 1,
    title: 'Plot Selection & Orientation',
    description: 'Choose the right plot and determine its orientation',
    details: [
      'Select square or rectangular plots (avoid irregular shapes)',
      'Determine exact geographical direction using compass',
      'North-east corner should be lower than south-west',
      'Plot should slope towards north or east',
      'Avoid plots near cemeteries, hospitals, or temples'
    ],
    tips: [
      'Use a professional Vastu compass for accurate direction',
      'Check soil quality - black soil is best',
      'Ensure plot has good drainage',
      'Verify legal documents before purchase'
    ],
    warnings: [
      'Avoid plots with T-junctions or dead ends',
      'Don\'t buy plots with cut corners',
      'Avoid plots near high-tension wires'
    ]
  },
  {
    id: 2,
    title: 'Foundation & Brahmasthan',
    description: 'Lay the foundation and preserve the central zone',
    details: [
      'Foundation should be laid on auspicious dates',
      'Brahmasthan (center) must remain open and free',
      'No walls, pillars, or heavy structures in center',
      'Foundation depth should be uniform',
      'Use good quality materials for foundation'
    ],
    tips: [
      'Perform Bhoomi Pujan before starting construction',
      'Keep center area for open courtyard or light structure',
      'Ensure proper ventilation in center area',
      'Center should be the highest point of the house'
    ],
    warnings: [
      'Never build toilet or kitchen in Brahmasthan',
      'Avoid heavy furniture in center',
      'Don\'t place staircase in center'
    ]
  },
  {
    id: 3,
    title: 'Main Entrance Placement',
    description: 'Position the main entrance according to 32 padas system',
    details: [
      'Use auspicious padas for entrance (N3, N4, N5 for north-facing)',
      'Avoid worst padas (Pitra, Mrigha, Gandharva in SW)',
      'Entrance should be larger than other doors',
      'Door should open clockwise from right side',
      'Ensure entrance is well-lit and obstacle-free'
    ],
    tips: [
      'Place Ganesha idol at entrance (north/NE, back facing outside)',
      'Use appropriate colors based on direction',
      'Keep entrance clean and welcoming',
      'Avoid shoe racks in front of entrance'
    ],
    warnings: [
      'Never place bathroom near main door',
      'Avoid mirror opposite entrance',
      'Don\'t place staircase directly facing entrance'
    ]
  },
  {
    id: 4,
    title: 'Kitchen Placement',
    description: 'Position kitchen in southeast with proper orientation',
    details: [
      'Kitchen should be in southeast corner (Agni zone)',
      'Stove should face east while cooking',
      'Sink should not be opposite to stove',
      'Refrigerator in southeast or east direction',
      'Storage in south or west walls'
    ],
    tips: [
      'Use orange, red, or yellow colors in kitchen',
      'Keep kitchen clean and well-ventilated',
      'Avoid black or blue colors',
      'Ensure good lighting, especially from east'
    ],
    warnings: [
      'Never place kitchen in northeast',
      'Avoid kitchen in center (Brahmasthan)',
      'Don\'t place kitchen above or below prayer room'
    ]
  },
  {
    id: 5,
    title: 'Bedroom Placement',
    description: 'Master bedroom in southwest, children in west/northwest',
    details: [
      'Master bedroom in southwest corner (stability)',
      'Bed should face south or east',
      'Headboard against solid wall',
      'Children\'s bedroom in west or northwest',
      'Avoid bedrooms in northeast'
    ],
    tips: [
      'Use light blue, green, or pink colors',
      'Avoid mirrors facing bed',
      'Keep bedroom clutter-free',
      'Ensure good ventilation',
      'No storage under bed'
    ],
    warnings: [
      'Never place bedroom in northeast',
      'Avoid bed under beam',
      'Don\'t place TV in bedroom',
      'Avoid red or black colors'
    ]
  },
  {
    id: 6,
    title: 'Bathroom Placement',
    description: 'Position bathrooms in northwest or north',
    details: [
      'Bathroom in northwest or north direction',
      'Toilet in west or north',
      'Bath in north or east',
      'Keep door closed when not in use',
      'Ensure good ventilation'
    ],
    tips: [
      'Use white or light blue colors',
      'Keep bathroom clean and dry',
      'Mirror should not face door',
      'Install exhaust fan for ventilation'
    ],
    warnings: [
      'Never place bathroom in southeast, southwest, or south',
      'Avoid bathroom in northeast',
      'Don\'t place bathroom above kitchen or prayer room',
      'Avoid dark colors in bathroom'
    ]
  },
  {
    id: 7,
    title: 'Living Room & Dining',
    description: 'Position living room in north/east, dining in west',
    details: [
      'Living room in north or east direction',
      'Sofa facing north or east',
      'Host should face east or north',
      'Dining room in west direction',
      'Face east while eating'
    ],
    tips: [
      'Use blue, green, or white colors in living room',
      'Water fountain in northeast corner',
      'TV in southeast corner',
      'Keep center (Brahmasthan) open',
      'Use yellow or orange in dining'
    ],
    warnings: [
      'Avoid living room in southwest',
      'Don\'t place dining in northeast',
      'Avoid heavy furniture in center',
      'No clutter in living areas'
    ]
  },
  {
    id: 8,
    title: 'Staircase Placement',
    description: 'Position staircase in south, west, or southwest',
    details: [
      'Staircase in south, west, or southwest',
      'Avoid staircase in northeast',
      'Stairs should ascend clockwise',
      'Ensure good lighting on stairs',
      'Keep stairs clean and obstacle-free'
    ],
    tips: [
      'Use odd number of steps (not ending in 0)',
      'Install handrails for safety',
      'Good lighting on each step',
      'Avoid spiral staircases if possible'
    ],
    warnings: [
      'Never place staircase in northeast',
      'Avoid staircase directly facing entrance',
      'Don\'t place staircase in center',
      'Avoid broken or damaged steps'
    ]
  },
  {
    id: 9,
    title: 'Prayer Room & Study',
    description: 'Prayer room and study in northeast',
    details: [
      'Prayer room in northeast corner',
      'Idols facing east or north',
      'Study room in northeast',
      'Study table facing east or north',
      'Keep both rooms clean and peaceful'
    ],
    tips: [
      'Use white, light yellow, or saffron colors',
      'Good lighting from east',
      'Keep books organized',
      'No storage below prayer room',
      'Lamp in northeast corner'
    ],
    warnings: [
      'Never place prayer room below bathroom or kitchen',
      'Avoid storage in northeast',
      'Don\'t place study in southwest',
      'Avoid dark colors'
    ]
  },
  {
    id: 10,
    title: 'Materials & Colors',
    description: 'Choose appropriate materials and colors per direction',
    details: [
      'Use natural materials (wood, stone, clay)',
      'North: Blue/Black colors',
      'South: Red/Orange colors',
      'East: Green colors',
      'West: Yellow/Brown colors'
    ],
    tips: [
      'Use glossy, shiny dark blue and gold for magical feel',
      'Avoid dull or slate tones',
      'Ensure good quality materials',
      'Match colors with room functions',
      'Use Vastu-compliant paints'
    ],
    warnings: [
      'Avoid synthetic materials if possible',
      'Don\'t use conflicting colors',
      'Avoid dark colors in small rooms',
      'Ensure proper ventilation with materials'
    ]
  }
];

export function VastuConstructionPlanner() {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const step = CONSTRUCTION_STEPS[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === CONSTRUCTION_STEPS.length - 1;

  const handleNext = () => {
    if (!isLastStep) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1);
    }
  };

  const toggleStepCompletion = (stepId: number) => {
    setCompletedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stepId)) {
        newSet.delete(stepId);
      } else {
        newSet.add(stepId);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-sm">
            <Hammer className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-amber-900 mb-2">House Construction Planner</h3>
            <p className="text-slate-600">Step-by-step Vastu-compliant construction guidance</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-slate-600">Step {currentStep + 1} of {CONSTRUCTION_STEPS.length}</div>
          <div className="text-lg font-semibold text-amber-900">
            {Math.round(((currentStep + 1) / CONSTRUCTION_STEPS.length) * 100)}% Complete
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-amber-100 rounded-full h-2 mb-6">
        <motion.div
          className="bg-gradient-to-r from-amber-400 to-amber-600 h-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${((currentStep + 1) / CONSTRUCTION_STEPS.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Step Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handlePrevious}
          disabled={isFirstStep}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
            isFirstStep
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-amber-100 text-amber-900 border-2 border-amber-300 hover:bg-amber-200'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          Previous
        </button>

        <div className="flex gap-2">
          {CONSTRUCTION_STEPS.map((s, index) => (
            <button
              key={s.id}
              onClick={() => setCurrentStep(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentStep
                  ? 'bg-amber-500 w-8'
                  : index < currentStep
                  ? 'bg-amber-400'
                  : 'bg-amber-200'
              }`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          disabled={isLastStep}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
            isLastStep
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-amber-100 text-amber-900 border-2 border-amber-300 hover:bg-amber-200'
          }`}
        >
          Next
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Current Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-amber-50/80 border-2 border-amber-300 rounded-2xl p-6 shadow-sm"
        >
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                completedSteps.has(step.id)
                  ? 'bg-gradient-to-br from-green-400 to-green-600'
                  : 'bg-gradient-to-br from-amber-400 to-amber-600'
              }`}>
                {completedSteps.has(step.id) ? (
                  <CheckCircle className="w-6 h-6 text-white" />
                ) : (
                  <Layout className="w-6 h-6 text-white" />
                )}
              </div>
              <div>
                <h4 className="text-2xl font-bold text-amber-900 mb-1">{step.title}</h4>
                <p className="text-slate-600">{step.description}</p>
              </div>
            </div>
            <button
              onClick={() => toggleStepCompletion(step.id)}
              className={`px-4 py-2 rounded-xl transition-all ${
                completedSteps.has(step.id)
                  ? 'bg-green-100 text-green-800 border-2 border-green-300'
                  : 'bg-amber-100 text-amber-900 border-2 border-amber-300 hover:bg-amber-200'
              }`}
            >
              {completedSteps.has(step.id) ? 'Completed' : 'Mark Complete'}
            </button>
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <h5 className="text-lg font-semibold text-amber-900 mb-3 flex items-center gap-2">
                <Info className="w-5 h-5 text-amber-700" />
                Key Details
              </h5>
              <ul className="space-y-2">
                {step.details.map((detail, index) => (
                  <li key={index} className="flex items-start gap-3 text-slate-700">
                    <span className="text-amber-600 mt-1">•</span>
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tips */}
            {step.tips.length > 0 && (
              <div className="rounded-xl p-4 border-2 border-amber-200 bg-amber-50/60">
                <h5 className="text-lg font-semibold text-amber-900 mb-3 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-amber-700" />
                  Pro Tips
                </h5>
                <ul className="space-y-2">
                  {step.tips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-3 text-slate-700">
                      <span className="text-green-600 mt-1">✓</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Warnings */}
            {step.warnings && step.warnings.length > 0 && (
              <div className="bg-red-50 rounded-xl p-4 border-2 border-red-200">
                <h5 className="text-lg font-semibold text-red-900 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  Important Warnings
                </h5>
                <ul className="space-y-2">
                  {step.warnings.map((warning, index) => (
                    <li key={index} className="flex items-start gap-3 text-slate-800">
                      <span className="text-red-600 mt-1">⚠</span>
                      <span>{warning}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Quick Navigation */}
      <div className="bg-amber-50/80 border-2 border-amber-300 rounded-2xl p-6 shadow-sm">
        <h5 className="text-lg font-semibold text-amber-900 mb-4">All Steps</h5>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {CONSTRUCTION_STEPS.map((s, index) => (
            <button
              key={s.id}
              onClick={() => setCurrentStep(index)}
              className={`p-3 rounded-xl text-left transition-all ${
                index === currentStep
                  ? 'bg-amber-200 border-2 border-amber-400'
                  : completedSteps.has(s.id)
                  ? 'bg-green-50 border-2 border-green-200'
                  : 'bg-white/80 border-2 border-amber-200 hover:bg-amber-100'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {completedSteps.has(s.id) && (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                )}
                <span className={`text-xs font-medium ${
                  index === currentStep ? 'text-amber-900' : 'text-slate-600'
                }`}>
                  Step {s.id}
                </span>
              </div>
              <p className={`text-sm ${
                index === currentStep ? 'text-amber-900 font-semibold' : 'text-slate-700'
              }`}>
                {s.title}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

