export interface ParsedData{
    headers:string[];
    rows:string[][];
}

export interface Task{
    execute(data:ParsedData):Promise<TaskResult>;
    getConfig():Record<string, any>;
    setConfig(config:Record<string, any>):void;
}

export interface TaskResult{
    taskName:string;
    result:any;
    logs:string[];
}

