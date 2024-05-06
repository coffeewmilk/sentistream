from firebase_functions import https_fn, options

from firebase_admin import initialize_app, firestore


from utils.task import Task

# set time out for 5 mins
@https_fn.on_call(timeout_sec=300)
def doTask(req: https_fn.CallableRequest):
    
    """ Start ingestion and analysis """
    
    url = req.data["url"]
    vid = req.data["vid"]

    task = Task(vid, url)
    task.downloadChat()
    task.uploadToBucket()
    task.submitSparkBatch()
    
    return "success"
    
