import { DynamicModule, Module } from '@nestjs/common';
import { CsvParserService } from 'src/csv-parser/csv-parser.service';
import { PipelineController } from 'src/pipeline/pipeline.controller';
import { PipelineService } from 'src/pipeline/pipeline.service';
import { DuplicateRowsTask } from 'src/tasks/duplicate-rows.task';
import { ExtraCategoricalVariablesTask } from 'src/tasks/extra-categorical-variables.task';
import { InvalidDateFormatTask } from 'src/tasks/invalid-date.task';
import { MissingValuesTask } from 'src/tasks/missing-values.task';

@Module({})
export class DataProcessingModule {
    static forRoot():DynamicModule{
        return{
            module:DataProcessingModule,
            controllers:[PipelineController],
            providers:[
                CsvParserService,
                PipelineService,
                MissingValuesTask,
                DuplicateRowsTask,
                ExtraCategoricalVariablesTask,
                InvalidDateFormatTask
            ],
            exports:[PipelineService],
        };
    }
}
