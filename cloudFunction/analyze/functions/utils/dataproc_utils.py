from google.cloud import dataproc_v1
import time

def submit_batch(vid, bucket_name="sentistream"):
    
    """
    Submit chat sentiment analysis pyspark batch 
    
    usage:
        arguments:
            input_path: avro input file path on bucket
            output_path: output folder for json output
            bucket_name: the name of google cloud storage bucket
    
    """
    
    # Create a client
    client = dataproc_v1.BatchControllerClient(
        client_options={"api_endpoint": "{}-dataproc.googleapis.com:443".format("asia-southeast1")}
    )

    input_path=f"analysis/{vid}/raw.avro"
    output_path=f"analysis/{vid}/result"

    # Initialize request argument(s)
    batch = dataproc_v1.Batch()
    batch.pyspark_batch.main_python_file_uri = "gs://sentistream/dependencies/batch.py"
    batch.pyspark_batch.args = [f"--input_path={input_path}", 
                                f"--output_path={output_path}", 
                                f"--bucket_name={bucket_name}",
                                f"--firestore_ref={vid}"]
    batch.runtime_config.version = "1.2"
    batch.runtime_config.container_image = "asia-southeast1-docker.pkg.dev/sentistream-420115/dataproc-artifacts/spark-nlp-image:0.0.4"

    # Assign service account to batch
    batch.environment_config.execution_config.service_account = "spark-batch@sentistream-420115.iam.gserviceaccount.com"

    request = dataproc_v1.CreateBatchRequest(
        parent="projects/sentistream-420115/locations/asia-southeast1",
        batch=batch,
    )

    # Make the request
    operation = client.create_batch(request=request)


    #response = operation.result()
    batch_uuid = operation.metadata.batch_uuid

    # track progress of the batch make sure it is creating all right
    resultRequest = dataproc_v1.GetBatchRequest(
        name = f"projects/sentistream-420115/locations/asia-southeast1/batches/{batch_uuid}"
    )

    batchStatus = 0 #todo Implement timeout
    while batchStatus < 2:
        resultBatch = client.get_batch(request=resultRequest)
        batchStatus = resultBatch.state
        
        if batchStatus == 6:
            # batch failed
            raise Exception('Batch failed') #todo add more details

        print("message:",resultBatch.state_message, "time:", resultBatch.state_time, "code:", batchStatus)
        time.sleep(10)


    # Handle the response
    return batch_uuid

