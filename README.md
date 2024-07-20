# Data pipeline Docker Application

This README provides instructions for building and running the NestJS application using Docker, with additional notes for WSL2 users.

## Prerequisites

- Docker installed on your system
- For Windows users: Docker Desktop with WSL2 backend configured
- Git (optional, for cloning the repository)

## Getting Started

1. Clone the repository (if you haven't already):
   ```
   git clone https://github.com/Prajna1999/civicdata.git
   cd civicdata
   ```

2. Ensure you're in the project root directory, which should contain the `Dockerfile`.

## Building the Docker Image

To build the Docker image for the NestJS application, run the following command:

```
docker build -t civicdata .
```

This command builds a Docker image named `civicdata` based on the instructions in the `Dockerfile`.

## Running the Container

To run the container based on the image you just built:

```
docker run -p 8080:8080 civicdata
```

This command starts a container from the `civicdata` image and maps port 8080 from the container to port 8080 on your host machine.

## Accessing the Application

Once the container is running, you can access the NestJS application by opening a web browser and navigating to:

```
http://localhost:8080
```

## Stopping the Container

To stop the running container:

1. Find the container ID:
   ```
   docker ps
   ```

2. Stop the container:
   ```
   docker stop <container-id>
   ```

Alternatively, you can stop the container using this single command:
```
docker stop $(docker ps -q --filter ancestor=civicdata)
```

## Notes for WSL2 Users

If you're using WSL2 on Windows:

1. Ensure Docker Desktop is running and configured to use the WSL2 backend.
2. Run all Docker commands from your WSL2 terminal.
3. Keep your project files in the Linux file system (e.g., `/home/<your-username>/projects/`) for better performance.
4. You can access the application on `localhost` from your Windows host as WSL2 handles port forwarding automatically.

## Troubleshooting

If you encounter any issues:

1. Ensure Docker is running on your system.
2. Check that you're in the correct directory containing the `Dockerfile`.
3. For WSL2 users, make sure you're working in your WSL2 distribution.
4. Verify that port 8080 is not being used by another application.



# Pipeline Execution API Documentation

## Overview

The Pipeline Execution API allows you to execute data processing pipelines on a CSV file. This API accepts a CSV file and a configuration for the data processing pipeline, then processes the data according to the specified pipeline.

## Base URL

`https://civicdata.onrender.com/api/v1`

## Endpoints

### Execute Pipeline

#### POST `/pipeline/execute`

This endpoint executes a data processing pipeline on a provided CSV file based on the specified configuration.

**Summary:**
- Execute a data processing pipeline on a CSV file.

**Description:**
- This endpoint processes the provided CSV file using the configurations defined in the `pipelineConfig`.

#### Request Body

The request body should be in `multipart/form-data` format and must include the following fields:

| Field          | Type          | Format   | Description                                                                                  |
|----------------|---------------|----------|----------------------------------------------------------------------------------------------|
| `csvFile`      | string        | binary   | The CSV file to be processed.                                                                |
| `pipelineConfig` | array of objects | JSON    | The configuration for the data processing pipeline. Each object in the array defines a pipeline step. |

**Example `pipelineConfig`:**

```json
[
  {
    "name": "invalidDateFormat",
    "config": {
      "columns": ["Join_Date", "Last_Login"]
    }
  },
  {
    "name": "missingValues",
    "config": {
      "columns": ["ID", "Name", "Age", "Gender", "Email", "Join_Date", "Last_Login"],
      "threshold": 5
    }
  },
  {
    "name": "duplicateRows",
    "config": {
      "columns": ["ID", "Name", "Email"]
    }
  },
  {
    "name": "extraCategoricalVariable",
    "config": {
      "columns": ["Gender"],
      "categories":["M", "F"]
    }
  }
]

# Response

## Successful Pipeline Execution Response

When a pipeline is executed successfully, the API returns a response with detailed results for each task specified in the pipelineConfig. Below is the structure and explanation of the response body.

### Response Body Structure

```json
{
  "message": "Pipeline Executed Successfully",
  "results": [
    {
      "taskName": "Invalid Date Format Task",
      "result": {
        "Join_Date": {
          "count": 3,
          "invalidDates": [
            {
              "value": "1/25/2022",
              "row": 45
            },
            {
              "value": "1/30/2022",
              "row": 46
            },
            {
              "value": "2/5/2022",
              "row": 47
            }
          ]
        },
        "Last_Login": {
          "count": 2,
          "invalidDates": [
            {
              "value": "2/5/2022",
              "row": 90
            },
            {
              "value": "2/10/2022",
              "row": 91
            }
          ]
        }
      },
      "logs": [
        "Found invalid date formats in 2 column(s)"
      ]
    },
    {
      "taskName": "Missing Values Task",
      "result": {
        "ID": 1.9607843137254901,
        "Name": 2.941176470588235,
        "Age": 1.9607843137254901,
        "Gender": 0,
        "Email": 3.9215686274509802,
        "Join_Date": 0,
        "Last_Login": 0
      },
      "logs": []
    },
    {
      "taskName": "Duplicate Rows Task",
      "result": {
        "duplicateCount": 2,
        "duplicates": {
          "8|Jane Smith|jane.smith@email.com": 2,
          "21|Grace Lee|grace.lee@email.com": 2
        }
      },
      "logs": [
        "Found 2 duplicate rows based on specified columns."
      ]
    },
    {
      "taskName": "Extra Categorical Variables Task",
      "result": {
        "Gender": {
          "count": 4,
          "values": [
            "Male",
            "Female",
            "female",
            "FEMALE"
          ]
        }
      },
      "logs": [
        "Extra category \"Male\" found in column \"Gender\" at row 3",
        "Extra category \"Female\" found in column \"Gender\" at row 4",
        "Extra category \"female\" found in column \"Gender\" at row 6",
        "Extra category \"Male\" found in column \"Gender\" at row 10",
        "Extra category \"FEMALE\" found in column \"Gender\" at row 12",
        "Extra category \"Male\" found in column \"Gender\" at row 17",
        "Extra category \"Female\" found in column \"Gender\" at row 20",
        "Extra category \"Male\" found in column \"Gender\" at row 35",
        "Found 4 extra categorical variables across all specified columns."
      ]
    }
  ]
}
```

### Response Fields

- `message`: A string indicating the success of the pipeline execution.
- `results`: An array of objects, each representing the result of a task specified in the pipelineConfig.

### Task Result Fields

Each task result object contains the following fields:

- `taskName`: The name of the task executed.
- `result`: An object with task-specific results.
- `logs`: An array of log messages providing additional context about the task execution.

### Task-specific Results

#### Invalid Date Format Task

`result`: An object where each key is a column name and each value is an object with:
- `count`: The number of invalid dates found in the column.
- `invalidDates`: An array of objects representing the invalid date values and their respective row numbers.

Example:

```json
{
  "taskName": "Invalid Date Format Task",
  "result": {
    "Join_Date": {
      "count": 3,
      "invalidDates": [
        {
          "value": "1/25/2022",
          "row": 45
        },
        {
          "value": "1/30/2022",
          "row": 46
        },
        {
          "value": "2/5/2022",
          "row": 47
        }
      ]
    },
    "Last_Login": {
      "count": 2,
      "invalidDates": [
        {
          "value": "2/5/2022",
          "row": 90
        },
        {
          "value": "2/10/2022",
          "row": 91
        }
      ]
    }
  },
  "logs": [
    "Found invalid date formats in 2 column(s)"
  ]
}
```

#### Missing Values Task

`result`: An object where each key is a column name and each value is the percentage of missing values in that column.

Example:

```json
{
  "taskName": "Missing Values Task",
  "result": {
    "ID": 1.9607843137254901,
    "Name": 2.941176470588235,
    "Age": 1.9607843137254901,
    "Gender": 0,
    "Email": 3.9215686274509802,
    "Join_Date": 0,
    "Last_Login": 0
  },
  "logs": []
}
```

#### Duplicate Rows Task

`result`: An object containing:
- `duplicateCount`: The total number of duplicate rows found.
- `duplicates`: An object where each key is a concatenated string of values from the specified columns, and each value is the number of occurrences of that duplicate row.

Example:

```json
{
  "taskName": "Duplicate Rows Task",
  "result": {
    "duplicateCount": 2,
    "duplicates": {
      "8|Jane Smith|jane.smith@email.com": 2,
      "21|Grace Lee|grace.lee@email.com": 2
    }
  },
  "logs": [
    "Found 2 duplicate rows based on specified columns."
  ]
}
```

#### Extra Categorical Variables Task

`result`: An object where each key is a column name and each value is an object with:
- `count`: The number of extra categorical values found.
- `values`: An array of the extra categorical values found.

Example:

```json
{
  "taskName": "Extra Categorical Variables Task",
  "result": {
    "Gender": {
      "count": 4,
      "values": [
        "Male",
        "Female",
        "female",
        "FEMALE"
      ]
    }
  },
  "logs": [
    "Extra category \"Male\" found in column \"Gender\" at row 3",
    "Extra category \"Female\" found in column \"Gender\" at row 4",
    "Extra category \"female\" found in column \"Gender\" at row 6",
    "Extra category \"Male\" found in column \"Gender\" at row 10",
    "Extra category \"FEMALE\" found in column \"Gender\" at row 12",
    "Extra category \"Male\" found in column \"Gender\" at row 17",
    "Extra category \"Female\" found in column \"Gender\" at row 20",
    "Extra category \"Male\" found in column \"Gender\" at row 35",
    "Found 4 extra categorical variables across all specified columns."
  ]
}
```
