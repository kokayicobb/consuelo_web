"use client"

interface LoadingStateProps {
  activeStep: number
}

export default function LoadingState({ activeStep }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="mb-4 w-12 h-12 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin"></div>
      <p className="text-gray-600 font-medium">
        {activeStep === 1 && "Generating SQL query..."}
        {activeStep === 2 && "Executing query..."}
        {activeStep === 3 && "Creating visualizations..."}
      </p>
      <p className="text-gray-500 text-sm mt-2">
        {activeStep === 1 && "Translating your natural language query into SQL"}
        {activeStep === 2 && "Running the query against your client database"}
        {activeStep === 3 && "Analyzing results and preparing visualizations"}
      </p>
    </div>
  )
}
