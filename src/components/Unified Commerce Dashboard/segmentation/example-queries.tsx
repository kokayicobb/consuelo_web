"use client"

interface ExampleQueriesProps {
  queries: string[]
  onSelectQuery: (query: string) => void
}

export default function ExampleQueries({ queries, onSelectQuery }: ExampleQueriesProps) {
  return (
    <div className="mb-10">
      <h2 className="text-xl font-semibold mb-3">Example Queries</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {queries.map((query, index) => (
          <button
            key={index}
            onClick={() => onSelectQuery(query)}
            className="text-left p-3 border border-gray-200 rounded-md hover:bg-gray-50 hover:border-orange-300 transition-all"
          >
            {query}
          </button>
        ))}
      </div>
    </div>
  )
}
