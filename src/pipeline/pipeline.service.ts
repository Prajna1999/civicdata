import { Injectable } from '@nestjs/common';
import { CsvParserService } from 'src/csv-parser/csv-parser.service';
import { DuplicateRowsTask } from 'src/tasks/duplicate-rows.task';
import { ExtraCategoricalVariablesTask } from 'src/tasks/extra-categorical-variables.task';
import { InvalidDateFormatTask } from 'src/tasks/invalid-date.task';
import { MissingValuesTask } from 'src/tasks/missing-values.task';
import { Task, TaskResult } from 'src/types';

@Injectable()
export class PipelineService {
    private taskLibrary:Record<string, new()=>Task>={
        missingValues:MissingValuesTask,
        duplicateRows:DuplicateRowsTask,
        extraCategoricalVariable:ExtraCategoricalVariablesTask,
        invalidDateFormat:InvalidDateFormatTask
    };

    constructor(private csvParserService:CsvParserService){}

    async executePipeline(csvContent:string, pipelineConfig:any[]):Promise<{message:string; results:TaskResult[]}>{
        const parsedData=await this.csvParserService.parse(csvContent);

        const results:TaskResult[]=[];

        for(const taskConfig of pipelineConfig){
            const TaskClass=this.taskLibrary[taskConfig.name];
            if(!TaskClass){
                throw new Error(`Task ${taskConfig.name} not found in the library`);
            }

            const task=new TaskClass();
            task.setConfig(taskConfig.config);

            const result=await task.execute(parsedData);
            results.push(result);
        
    }
    return {
        message:'Pipeline Executed Successfully',
        results
    };

}
    registerTask(name:string, taskClass:new ()=>Task){
        this.taskLibrary[name]=taskClass;
    }
}
