import { Injectable } from "@nestjs/common";
import { ParsedData, Task, TaskResult } from "src/types";

@Injectable()
export class ExtraCategoricalVariablesTask implements Task{
    private config:{columns:string[],categories:string[]}

    constructor(){
        this.config={columns:[], categories:[]}
    }

    async execute(data: ParsedData): Promise<TaskResult> {
        const logs:string[]=[];
        const columnIndices=this.config.columns.map(column=>data.headers.indexOf(column));
        if(columnIndices.some(index=>index===-1)){
            logs.push('One or more specified columns not found in the dataset.');
            return{
                taskName:'Extra Categorical Variable Task',
                result:{},
                logs
            };

        }
        const extraCategories:Record<string,Set<string>>={};
        const categoriesSet=new Set(this.config.categories);

          // iterate over the rows
          data.rows.forEach((row, rowIndex)=>{

            columnIndices.forEach((colIndex,i)=>{
                const value=row[colIndex];
                if(value && !categoriesSet.has(value)){
                    if(!extraCategories[this.config.columns[i]]){
                        extraCategories[this.config.columns[i]]=new Set();
                    }

                    extraCategories[this.config.columns[i]].add(value);
                    logs.push(`Extra category "${value}" found in column "${this.config.columns[i]}" at row ${rowIndex + 1}`);
                }
            });
            
        });
        const result:Record<string, {count:number, values:string[]}>={};
        Object.keys(extraCategories).forEach(column=>{
            result[column]={
                count:extraCategories[column].size,
                values:Array.from(extraCategories[column])
            }
        });
        const totalExtraCategories=Object.values(result).reduce((sum, {count})=>sum+count,0);
        logs.push(`Found ${totalExtraCategories} extra categorical variables across all specified columns.`);
        return{
            taskName:'Extra Categorical Variables Task',
            result,
            logs
        }
    }

    getConfig(): Record<string, any> {
        return this.config;
    }

    setConfig(config: any): void {
        this.config=config
    }
}