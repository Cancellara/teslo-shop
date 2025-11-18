import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from './products/products.module';
import { CommonModule } from './common/common.module';
import { SeedModule } from './seed/seed.module';
import { FilesModule } from './files/files.module';


@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: +process.env.POSTGRES_PORT!,
      database: process.env.POSTGRES_DATABASE,
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      autoLoadEntities: true,
      synchronize: true, //Al añadir columna en entidad la sincroniza, en prod no se suele usar.
      ssl: {
        rejectUnauthorized: false, // ⚠️ en producción mejor usar un certificado válido
      },
}),
    ProductsModule,
    CommonModule,
    SeedModule,
    FilesModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
