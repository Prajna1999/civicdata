import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DataProcessingModule } from './data-processing/data-processing.module';
import { CsvParserService } from './csv-parser/csv-parser.service';
import { PipelineService } from './pipeline/pipeline.service';
import { PipelineController } from './pipeline/pipeline.controller';

@Module({
  imports: [DataProcessingModule],
  controllers: [AppController, PipelineController],
  providers: [AppService, CsvParserService, PipelineService],
})
export class AppModule {}
