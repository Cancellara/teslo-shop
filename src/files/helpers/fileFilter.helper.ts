import { BadRequestException } from "@nestjs/common"

export const fileFilter = (req: Express.Request, file: Express.Multer.File, callback: Function) => {
    if(!file)
        throw new BadRequestException('Make sure that you are sending a file');

    const fileExtension = file.mimetype.split('/')[1];
    const validExtensions = ['jpg', 'jpeg', 'png', 'gif'];

    if(validExtensions.includes(fileExtension))
        return callback(null, true);

    return callback(null, false);
}