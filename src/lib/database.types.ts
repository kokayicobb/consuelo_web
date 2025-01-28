// lib/database.types.ts
export type Database = {
  public: {
    Tables: {
      users: { // Note the lowercase 'users'
        Row: {
          id: string; // Change to the appropriate type (e.g., string, number)
          email: string;
          created_at: string; // Adjust the type as per your schema
          // Add other columns as needed
        };
        Insert: {
          email: string;
          password: string; // If you're handling passwords
          // Add other columns as needed
        };
        Update: {
          email?: string;
          password?: string; // If you're handling passwords
          // Add other columns as needed
        };
      };
      todos: { // Define the Todos table
        Row: {
          id: string; // Change to the appropriate type
          user_id: string; // Assuming there's a relationship with users
          title: string;
          completed: boolean;
          created_at: string; // Adjust the type as per your schema
          // Add other columns as needed
        };
        Insert: {
          user_id: string;
          title: string;
          completed?: boolean; // Optional for insert
          // Add other columns as needed
        };
        Update: {
          title?: string;
          completed?: boolean; // Optional for update
          // Add other columns as needed
        };
      };
      // Define other tables as needed
    };
    Views: {
      // Define your views if you have any
    };
    Functions: {
      // Define your functions if you have any
    };
  };
};

// Example usage for Todo type
export type Todo = Database['public']['Tables']['todos']['Row'];
