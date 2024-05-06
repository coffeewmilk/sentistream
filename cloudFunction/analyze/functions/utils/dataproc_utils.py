from google.cloud import dataproc_v1

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
                                f"----firestore_ref={vid}"]
    batch.runtime_config.version = "1.2"
    batch.runtime_config.container_image = "asia-southeast1-docker.pkg.dev/sentistream-420115/dataproc-artifacts/spark-nlp-image:0.0.4"

    request = dataproc_v1.CreateBatchRequest(
        parent="projects/sentistream-420115/locations/asia-southeast1",
        batch=batch,
    )

    # Make the request
    operation = client.create_batch(request=request)


    #response = operation.result()

    # Handle the response
    return operation

