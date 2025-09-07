export interface DbConfig {
  username?: string;
  password?: string;
  database?: string;
  host?: string;
  dialect?: 'postgres' | 'mysql' | 'sqlite' | 'mariadb' | 'mssql' | string;
}

export interface Config {
  development: DbConfig;
  test: DbConfig;
  production: DbConfig;
  [key: string]: DbConfig;
}

declare const config: Config;
export { config };
export default config;
