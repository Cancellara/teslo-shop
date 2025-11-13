import { Type } from "class-transformer";
import { IsOptional, IsPositive, Min } from "class-validator";

export class PaginationDto {

    @IsOptional()
    @IsPositive()
    //Esto es porque no tenemos activado globalmente la conversión implicita
    //enableImplicitConversions: true
    //En pokemon esta
    @Type(() => Number) 
    readonly limit?: number

    @IsOptional()
    @Min(0)
    @Type(() => Number) 
    readonly offset?: number

}