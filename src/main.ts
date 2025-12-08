import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// TODO: COOKIE PARSER DOEST WORK
// import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  // app.use(cookieParser);

  app.enableCors({
    origin: 'http://localhost:4200',
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
