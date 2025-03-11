import { Plus, Paintbrush, BookmarkIcon } from "lucide-react";

export default function HomeContent() {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex items-center gap-4">
        <button className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50">
          <Plus className="h-4 w-4" />
          Create
        </button>
        <button className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50">
          <Paintbrush className="h-4 w-4" />
          Change Appearance
        </button>
        <button className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50">
          <BookmarkIcon className="h-4 w-4" />
          Saved Models [Soon]
        </button>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-medium text-gray-500">
          RECENT ACTIVITY
        </h2>

        <div className="py-12 text-center text-gray-500">
          <p>Your recent activity will appear here</p>
        </div>
      </div>
    </div>
  );
}
