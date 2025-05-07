'use client'

interface LoadingStateProps {
  activeStep: number
}

export default function LoadingState({ activeStep }: LoadingStateProps) {
  const aiThoughts = {
    1: {
      title: "Thinking through your request...",
      subtitle: "I'm translating your natural language into a SQL query."
    },
    2: {
      title: "Querying the data...",
      subtitle: "I'm now running the SQL query against your database."
    },
    3: {
      title: "Analyzing results...",
      subtitle: "I'm interpreting the query results and designing visualizations."
    }
  }

  const { title, subtitle } = aiThoughts[activeStep] || {
    title: "Working on it...",
    subtitle: "Please hold on while I process your request."
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 w-12 h-12 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin"></div>
      <p className="text-gray-700 font-semibold text-lg">{title}</p>
      <p className="text-gray-500 text-sm mt-2">{subtitle}</p>
    </div>
  )
}
