from firebase_functions import https_fn, options

from firebase_admin import initialize_app, firestore


from utils.task import Task

# set time out for 8 mins
@https_fn.on_call(timeout_sec=480, region="asia-southeast1")
def analyze(req: https_fn.CallableRequest):
    
    """ Start ingestion and analysis """
    
    task = Task(req)
    error = None
    try:
        task.downloadChat()
        task.uploadToBucket()
        batch_uuid = task.submitSparkBatch()
    except Exception as e:
        task.reportFailure(str(e))
        error = str(e)
    
    return {"batch_uuid": batch_uuid, "error": error}
    
