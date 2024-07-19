import { Injectable } from '@nestjs/common';
import {parse} from 'csv-parse';
import {ParsedData} from '../types';

@Injectable()
export class CsvParserService {
    async parse(csvContent:string):Promise<ParsedData>{
        return new Promise((resolve, reject)=>{
            parse(csvContent,{
                delimiter:',',
                columns:true,
                skip_empty_lines:true,
            },(err, records)=>{
                if(err){
                    reject(err);
                }else{
                    const headers=Object.keys(records[0]);
                    const rows=records.map(record=>Object.values(record));
                    resolve({
                        headers, rows
                    });
                }
            }
        )
        })
    }
}
