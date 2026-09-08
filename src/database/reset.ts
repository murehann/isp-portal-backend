import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppModule } from 'src/app.module';

async function reset() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const dataSource = app.get(DataSource);
    await dataSource.dropDatabase();
    await dataSource.synchronize();
    console.log('Database reset complete.');
  } finally {
    await app.close();
  }
}

void reset().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
