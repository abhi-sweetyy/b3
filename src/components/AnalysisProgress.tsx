type AnalysisStage = 'uploading' | 'reading' | 'analyzing' | 'summarizing' | 'complete' | 'error';

interface AnalysisProgressProps {
  stage: AnalysisStage;
  progress: number;
}

export const AnalysisProgress = ({ stage, progress }: AnalysisProgressProps) => {
  const stages = {
    uploading: { text: 'Uploading contract...', color: 'text-blue-500' },
    reading: { text: 'Reading document contents...', color: 'text-purple-500' },
    analyzing: { text: 'Analyzing clauses and terms...', color: 'text-yellow-500' },
    summarizing: { text: 'Generating risk assessment...', color: 'text-orange-500' },
    complete: { text: 'Analysis complete!', color: 'text-green-500' },
    error: { text: 'Error analyzing contract', color: 'text-red-500' }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className={`text-sm ${stages[stage].color}`}>
          {stages[stage].text}
        </span>
        {stage !== 'complete' && stage !== 'error' && (
          <span className="text-sm text-[#8491A5]">{progress}%</span>
        )}
      </div>
      <div className="h-1 bg-[#1D2839] rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-300 ${
            stage === 'error' ? 'bg-red-500' :
            stage === 'complete' ? 'bg-green-500' :
            'bg-blue-500'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}; 