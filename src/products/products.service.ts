import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException, Param, ParseUUIDPipe } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { BeforeInsert, Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from '../common/dto/pgination.dto';
import { validate as isUUID} from 'uuid';
import { ProductImage } from './entities/product-image.entity';
import { DataSource } from 'typeorm';
import { error } from 'console';

@Injectable()
export class ProductsService {

  //Logger de NEST - Parámetro = Contexto
  private readonly logger = new Logger('ProductService');

  constructor(
    //Patrón repositorio
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly imageRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource, //Al inyectarlo asi ya conoce cual es la cadena de conexión a la BBDD


  ){}

  async create(createProductDto: CreateProductDto) {
    try {
      
      const {images = [], ...productDetails} = createProductDto;

      const product = this.productRepository.create({
        ...productDetails,
        images: images.map(image => this.imageRepository.create({url: image})) //TypeOrm ya infiere el producto al que pertenece la imagen
        
      });
      //Salva tanto el producto como las imagenes
      await this.productRepository.save(product);

      

      return {...product, images: images};
    }
    catch(error) {
      this.handleDBErrors(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    
    const {limit=10, offset=0} = paginationDto;
    
    const products = await this.productRepository.find({
      take: limit,
      skip: offset,
      relations: {
        images: true, //images = nombre de la relación. True --> devolver todos los campos
      }
    });
    
    return products.map(({images, ...rest}) =>({
      ...rest,
      images: images?.map(image => image.url)
    })
    );
  }

  async findOne(term: string) {

    let product: Product | null;
    if(isUUID(term))
      product = await this.productRepository.findOneBy({id: term});
    else {
      const queryBuilder = this.productRepository.createQueryBuilder('prod'); //alias del qeury builder que se usará en el leftJoinAndSelect

      //Es CASE SENTIVE de ahí el UPPER, toUpperCase and toLowerCase
      product = await queryBuilder.where('UPPER(title)=:title or slug=:slug',
        {
          title: term.toUpperCase(),
          slug: term.toLowerCase()
        }
      )
      .leftJoinAndSelect('prod.images', 'prodImages') //Para que retorne imagenes más su alias
      .getOne();
    }


    if(!product)
      throw new NotFoundException(`Producto con term: ${term} no encontrado.`);

    return product;
  }

  async findOnePlain(term: string) {
    const {images = [], ...rest} = await this.findOne(term);

    return {
      ...rest,
      images: images.map(image => image.url)
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto) {

    const {images, ...toUpdate } = updateProductDto;
    
    //Preload busca un producto por id y lo carga junto a los datos del dto, pero no guarda en bd
    
    const product = await this.productRepository.preload({
      id: id,
      ...toUpdate
    });

    

    if(!product)
      throw new NotFoundException(`Product with id: ${id} not found`);

    //Transacciones
    const queryRunner = this.dataSource.createQueryRunner(); 
    await queryRunner.connect();
    await queryRunner.startTransaction();
    

    try{

      //Si hay imagenes, se borran todas las previas y se insertan las nuevas
      if(images) {
        //softdelete para marcar en una columna que esta borrada
        //Criterio, Modelo ProductImage, where product: id
        //Vale asi porque es una realación pero se podría poner el nombre del campo en vez de product
        await queryRunner.manager.delete(ProductImage, {product: {id: id}});

        product.images = images.map(image => this.imageRepository.create({url: image}))
      }
      else {

      }

      await queryRunner.manager.save(product);

      //Impacta en BBDD
      await queryRunner.commitTransaction();
      //El queryRunner ya no esta activo --> sería necesario volver a conectar
      await queryRunner.release();
      //await this.productRepository.save(product); //Es como lo hacía antes del queryRunner
      return this.findOnePlain(id);
    }
    catch(error){
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      this.handleDBErrors(error)
    }
    
  }

  async remove(id: string) {
    const product = await this.findOne(id);

    await this.productRepository.remove(product);
  }

  private handleDBErrors(error: any) {
    this.logger.error(`[${error.code}] - ${error.detail}`);
    
    if(error.code === '23505')
      throw new BadRequestException(error.detail);
    //....tantos errores como se quieran añadir

    throw new InternalServerErrorException('Unexpected error, check server logs.');
  }

  async deleteAllProducts() {

    const query = this.productRepository.createQueryBuilder('product');

    try {

      return await query
        .delete()
        .where({})
        .execute();
    }
    catch{
      this.handleDBErrors(error);
    }
  }
  
}


