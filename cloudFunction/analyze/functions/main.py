from firebase_functions import https_fn, options

from firebase_admin import initialize_app, firestore


from utils.task import Task

# set time out for 8 mins
@https_fn.on_request(timeout_sec=480, region="asia-southeast1", cors=options.CorsOptions(cors_origins="*", cors_methods=["post"]))
def analyze(req: https_fn.Request):
    
    """ Start ingestion and analysis """
    
    data = req.get_json()
    if data is None:
        return https_fn.Response(status=400, response="Input data missing")
    
    task = Task(data)
    error = None
    
    try:
        task.downloadChat()
        task.uploadToBucket()
        batch_uuid = task.submitSparkBatch()
    
    except Exception as e:
        task.reportFailure(str(e))
        error = str(e)
        return https_fn.Response(status=400, response=error)
    
    return https_fn.Response(response = batch_uuid)
    
