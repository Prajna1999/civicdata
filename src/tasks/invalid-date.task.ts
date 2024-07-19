import { Injectable } from '@nestjs/common';
import { Task, TaskResult, ParsedData } from '../types';

interface InvalidDate {
    value: string;
    row: number;
}

interface InvalidDatesResult {
    [column: string]: {
        count: number;
        invalidDates: InvalidDate[];
    };
}

@Injectable()
export class InvalidDateFormatTask implements Task {
    private config: { columns: string[], dateFormat?: string } = { columns: [] };

    private getDateRegex(format: string): RegExp {
        const map = {
            YYYY: '\\d{4}',
            MM: '(0?[1-9]|1[012])',
            DD: '(0?[1-9]|[12][0-9]|3[01])'
        };
        const regexStr = format.replace(/[./-]/g, '\\$&')
                               .replace(/(YYYY|MM|DD)/g, match => map[match]);
        return new RegExp(`^${regexStr}$`);
    }

    async execute(data: ParsedData): Promise<TaskResult> {
        const columnIndices = this.config.columns.map(col => data.headers.indexOf(col));
        if (columnIndices.some(i => i === -1)) {
            return { taskName: 'Invalid Date Format Task', result: {}, logs: ['Column(s) not found'] };
        }

        const dateRegex = this.config.dateFormat 
            ? this.getDateRegex(this.config.dateFormat)
            : /^\d{4}[-/.](0?[1-9]|1[012])[-/.](0?[1-9]|[12][0-9]|3[01])$/;

        const invalid: { [key: string]: InvalidDate[] } = {};

        data.rows.forEach((row, rowIndex) => 
            columnIndices.forEach((i, j) => {
                const val = row[i];
                if (val && !dateRegex.test(val)) {
                    if (!invalid[this.config.columns[j]]) {
                        invalid[this.config.columns[j]] = [];
                    }
                    invalid[this.config.columns[j]].push({ value: val, row: rowIndex + 1 });
                }
            })
        );

        const result: InvalidDatesResult = Object.entries(invalid).reduce((acc, [col, vals]) => {
            acc[col] = { count: vals.length, invalidDates: vals };
            return acc;
        }, {} as InvalidDatesResult);

        return {
            taskName: 'Invalid Date Format Task',
            result,
            logs: [`Found invalid date formats in ${Object.keys(result).length} column(s)`]
        };
    }

    getConfig = () => this.config;
    setConfig = (config: Partial<typeof this.config>) => { 
        this.config = { ...this.config, ...config };
    }
}