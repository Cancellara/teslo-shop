import { text } from "stream/consumers";
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductImage } from "./product-image.entity";


//Para que funcione typeOrm y postgres:
//npm install --save @nestjs/typeorm typeorm pg
//Usar los decoradores de typeOrm
//El tipo del campo (entre '' en column tiene que ser tipo permitido por postgress)

@Entity()
export class Product {

    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column('text', {
        unique: true
    })
    title: string

    @Column('float', {
        default: 0
    })
    price: number

    //Es lo mismo que arriba pero de otra forma, para conocer ambas
    @Column({
        type: 'text',
        nullable: true
    })
    description: string

    @Column('text', {
        unique: true
    })
    slug: string

    @Column('int', {
        default: 0
    })
    stock: number

    @Column('text', {
        array: true
    })
    sizes: string[]

    @Column('text')
    gender: string

    @Column('text', {
        array: true,
        default: []
    })
    tags: string[]
    
    @OneToMany(
        () => ProductImage,
        (productImage) => productImage.product,
        {cascade: true, eager: true} //eager para que cuando se unsan métodos find* devuelva los hijos
    )
    images?: ProductImage[]

    @BeforeInsert()
    CheckSlugInsert() {
        //This hace referencia a la instancia de la entidad
        if(!this.slug)
            this.slug = this.title;

        this.slug = this.slug.toLowerCase().replaceAll(" ", "_").replaceAll("'","");
    }

    @BeforeUpdate()
    CheckSlugUpdate() {
        this.slug = this.slug.toLowerCase().replaceAll(" ", "_").replaceAll("'","");
    }

   
}
