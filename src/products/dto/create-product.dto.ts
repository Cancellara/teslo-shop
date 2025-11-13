//Para usar:
//1º npm i class-validator class-transformer
//2º en main.ts añadir pipes globales

import { IsArray, IsIn, IsNumber, IsOptional, IsPositive, IsString, MinLength } from "class-validator";


export class CreateProductDto {

    @IsString()
    @MinLength(1)
    readonly title: string

    @IsNumber()
    @IsPositive()
    @IsOptional()
    readonly price?: number

    @IsString()
    @IsOptional()
    readonly description?: string

    @IsString()
    @IsOptional()
    readonly slug?: string

    @IsNumber()
    @IsPositive()
    @IsOptional()
    readonly stock?: number

    @IsString({each: true})
    @IsArray()
    sizes: string[]

    @IsString()
    @IsIn(['women', 'men', 'kid', 'unisex'])
    gender: string

    @IsString({each: true})
    @IsArray()
    @IsOptional()
    tags?: string[]

    @IsString({each: true})
    @IsArray()
    @IsOptional()
    images?: string[]
}
