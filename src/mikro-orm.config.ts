process.loadEnvFile(); 
import { defineConfig } from '@mikro-orm/postgresql';

export default defineConfig({
  dbName: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  host: process.env.POSTGRES_HOST,
  user: process.env.POSTGRES_USER,
  port: Number(process.env.POSTGRES_PORT),
  entities: ['./dist/**/*.entity.js'],
  entitiesTs: ['./src/**/*.entity.ts'],
  migrations: {
    path: './dist/migrations',
    pathTs: './src/migrations',
  },
});
