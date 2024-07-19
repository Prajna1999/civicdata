import { Controller, Post, Body, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PipelineService } from './pipeline.service';

@Controller('pipeline')
export class PipelineController {
    constructor(private pipelineService: PipelineService) {}

    @Post('execute')
    @UseInterceptors(FileInterceptor('csvFile'))
    async executePipeline(
        @UploadedFile() csvFile: Express.Multer.File,
        @Body('pipelineConfig') pipelineConfig: any
    ) {
        const csvContent = csvFile.buffer.toString('utf-8');
        const parsedPipelineConfig = JSON.parse(pipelineConfig);
        
        return this.pipelineService.executePipeline(csvContent, parsedPipelineConfig);
    }
}