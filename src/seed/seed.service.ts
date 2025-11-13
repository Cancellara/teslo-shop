import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/seed-data';



@Injectable()
export class SeedService {
 
  constructor(
    private readonly productSerivce: ProductsService
  ){}

  async runSeed() {
    this.insertNewProducts();

    return 'SEED COMPLETED'
  }

  private async insertNewProducts() {
    await this.productSerivce.deleteAllProducts();

    const seedProducts = initialData.products;
    const insertPromises: Promise<any>[] = [];

    seedProducts.forEach(product => {
      insertPromises.push( this.productSerivce.create(product));
    });

    await Promise.all(insertPromises);

    
  }
}
