declare module "better-sqlite3" {
  export type Database = unknown;
  const DatabaseConstructor: {
    new (filename?: string): Database;
  };
  export default DatabaseConstructor;
}
