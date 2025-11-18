import { Controller, Get, Param, Post, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileFilter } from './helpers/fileFilter.helper';
import { diskStorage } from 'multer';
import { fileNamer } from './helpers/fileNamer.helper';
import type { Response } from 'express';
import { ConfigService } from '@nestjs/config';



@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService
  ) {}

  @Post('product')
  @UseInterceptors(
    FileInterceptor('file', //File es el nombre que llevará el fichero en el body
      {
        fileFilter: fileFilter,
        limits: {
          //fileSize: 100000
        },
        storage: diskStorage({
          destination: './static/products',
          filename: fileNamer
        })
      }
    )
  )
  UploadFile(
    @UploadedFile() file: Express.Multer.File) {

      const secureUrl = `${this.configService.get('HOST_API')}/files/product/${file.filename}`
    
      
    return {
      secureUrl
    };
  }

  @Get('product/:imageName')
  findProductImage(
    @Res() res: Response, //Con esto le decimos a NEST que nos vamos a encargar nosotros de la respuesta
    @Param('imageName') imageName: string
  ){
    const path = this.filesService.getStaticProductImage(imageName);

    
    res.sendFile(path);

  }
  
}
