import { Injectable } from '@nestjs/common';
import{Task, TaskResult, ParsedData} from '../types';

@Injectable()
export class MissingValuesTask implements Task {
    private config: { columns: string[], threshold: number };
  
    constructor() {
      this.config = { columns: [], threshold: 0 };
    }
  
    async execute(data: ParsedData): Promise<TaskResult> {
      const logs: string[] = [];
      const result: Record<string, number> = {};
  
      this.config.columns.forEach(column => {
        const columnIndex = data.headers.indexOf(column);
        if (columnIndex === -1) {
          logs.push(`Column ${column} not found in the dataset.`);
          return;
        }
  
        const missingCount = data.rows.filter(row => !row[columnIndex]).length;
        const missingPercentage = (missingCount / data.rows.length) * 100;
  
        result[column] = missingPercentage;
  
        if (missingPercentage > this.config.threshold) {
          logs.push(`Column ${column} has ${missingPercentage.toFixed(2)}% missing values, exceeding the threshold of ${this.config.threshold}%.`);
        }
      });
  
      return {
        taskName: 'Missing Values Task',
        result,
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