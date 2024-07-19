import { Injectable } from '@nestjs/common';
import { Task, TaskResult, ParsedData } from '../types';

@Injectable()
export class DuplicateRowsTask implements Task{
    private config:{columns:string[]};

    constructor(){
        this.config={columns:[]};
    }

    async execute(data: ParsedData): Promise<TaskResult> {
        const logs: string[] = [];
        const columnIndices = this.config.columns.map(column => data.headers.indexOf(column));
    
        if (columnIndices.some(index => index === -1)) {
          logs.push('One or more specified columns not found in the dataset.');
          return { taskName: 'Duplicate Rows Task', result: {}, logs };
        }
    
        const uniqueRows = new Set();
        const duplicates: Record<string, number> = {};
    
        data.rows.forEach(row => {
          const key = columnIndices.map(index => row[index]).join('|');
          if (uniqueRows.has(key)) {
            duplicates[key] = (duplicates[key] || 1) + 1;
          } else {
            uniqueRows.add(key);
          }
        });
    
        const duplicateCount = Object.keys(duplicates).length;
        logs.push(`Found ${duplicateCount} duplicate rows based on specified columns.`);
    
        return {
          taskName: 'Duplicate Rows Task',
          result: { duplicateCount, duplicates },
          logs,
        };
      }
    
      getConfig(): Record<string, any> {
        return this.config;
      }
    
      setConfig(config: any): void {
        this.config = config;
      }

}