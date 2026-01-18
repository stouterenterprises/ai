import { createClient } from "@supabase/supabase-js";

let supabase: ReturnType<typeof createClient> | null = null;

const getSupabase = () => {
  if (supabase) return supabase;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Missing Supabase environment variables. Please configure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  supabase = createClient(supabaseUrl, supabaseKey);
  return supabase;
};

/**
 * Execute a SELECT query
 * @param table Table name
 * @param filter Optional filter conditions
 * @param select Optional specific columns to select
 * @returns Array of rows
 */
export const query = async <T>(
  table: string,
  filter?: Record<string, any>,
  select?: string
): Promise<T[]> => {
  let query = getSupabase().from(table).select(select || "*");

  if (filter) {
    Object.entries(filter).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
  }

  const { data, error } = await query;

  if (error) {
    console.error(`Query error on ${table}:`, error);
    throw new Error(`Database query failed: ${error.message}`);
  }

  return (data as T[]) || [];
};

/**
 * Execute a raw SQL query (for complex queries)
 * @param sql SQL query string
 * @returns Query result
 */
export const rawQuery = async <T>(sql: string): Promise<T[]> => {
  const { data, error } = await getSupabase().rpc("exec_sql", { sql });

  if (error) {
    console.error("Raw query error:", error);
    throw new Error(`Database query failed: ${error.message}`);
  }

  return (data as T[]) || [];
};

/**
 * Insert a single row
 * @param table Table name
 * @param data Row data
 * @returns Inserted row
 */
export const insertOne = async <T>(table: string, data: Record<string, any>): Promise<T> => {
  const { data: result, error } = await supabase
    .from(table)
    .insert([data])
    .select()
    .single();

  if (error) {
    console.error(`Insert error on ${table}:`, error);
    throw new Error(`Insert failed: ${error.message}`);
  }

  return result as T;
};

/**
 * Insert multiple rows
 * @param table Table name
 * @param data Array of row data
 * @returns Inserted rows
 */
export const insertMany = async <T>(table: string, data: Record<string, any>[]): Promise<T[]> => {
  const { data: result, error } = await supabase
    .from(table)
    .insert(data)
    .select();

  if (error) {
    console.error(`Insert error on ${table}:`, error);
    throw new Error(`Insert failed: ${error.message}`);
  }

  return (result as T[]) || [];
};

/**
 * Update rows
 * @param table Table name
 * @param filter Filter conditions
 * @param data Data to update
 * @returns Updated rows
 */
export const update = async <T>(
  table: string,
  filter: Record<string, any>,
  data: Record<string, any>
): Promise<T[]> => {
  let updateQuery: any = getSupabase().from(table).update(data);

  Object.entries(filter).forEach(([key, value]) => {
    updateQuery = updateQuery.eq(key, value);
  });

  const { data: result, error } = await updateQuery.select();

  if (error) {
    console.error(`Update error on ${table}:`, error);
    throw new Error(`Update failed: ${error.message}`);
  }

  return (result as T[]) || [];
};

/**
 * Delete rows
 * @param table Table name
 * @param filter Filter conditions
 */
export const deleteRows = async (
  table: string,
  filter: Record<string, any>
): Promise<void> => {
  let deleteQuery: any = getSupabase().from(table);

  Object.entries(filter).forEach(([key, value]) => {
    deleteQuery = deleteQuery.eq(key, value);
  });

  const { error } = await deleteQuery.delete();

  if (error) {
    console.error(`Delete error on ${table}:`, error);
    throw new Error(`Delete failed: ${error.message}`);
  }
};

/**
 * Legacy execute function for backward compatibility
 * Maps SQL-like operations to Supabase operations
 */
export const execute = async (sql: string, params: unknown[] = []) => {
  // For INSERT/UPDATE/DELETE, we use rawQuery if needed
  // For now, throw error asking to use specific functions
  if (sql.toUpperCase().startsWith("INSERT")) {
    throw new Error("Use insertOne() or insertMany() instead of execute()");
  }
  if (sql.toUpperCase().startsWith("UPDATE")) {
    throw new Error("Use update() instead of execute()");
  }
  if (sql.toUpperCase().startsWith("DELETE")) {
    throw new Error("Use deleteRows() instead of execute()");
  }

  return rawQuery(sql);
};
