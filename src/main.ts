import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {

  //Poner cosas en ese orden
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  

   

  app.useGlobalPipes(
    new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      })
    );

    await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
