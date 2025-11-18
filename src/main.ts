import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {

  //Poner cosas en ese orden
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('bootstrap');

  app.setGlobalPrefix('api');
  

   

  app.useGlobalPipes(
    new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      })
    );

    await app.listen(process.env.PORT ?? 3000);
    logger.log(`Servidor arrancado en puerto ${process.env.PORT}`);
}
bootstrap();
