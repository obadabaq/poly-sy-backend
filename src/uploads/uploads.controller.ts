import { Controller, Get, Param, Post, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { editFileName } from './helpers/file-upload.utils';

@Controller('uploads')
export class UploadsController {

    @Post()
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: './uploads/images',
                filename: editFileName,
            })
        }),
    )
    async uploadFile(@UploadedFile() file) {
        const response = {
            filename: file.filename,
        };
        return response;
    }

    @Get('/:imgpath')
    seeUploadedFile(@Param('imgpath') image, @Res() res) {
        return res.sendFile(image, { root: './uploads/images/' });
    }
}
