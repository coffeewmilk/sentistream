from utils.chat_utils import download_chat, upload_blob
from utils.dataproc_utils import submit_batch

import firebase_admin
from firebase_admin import credentials, firestore


# Use the application default credentials.
cred = credentials.ApplicationDefault()

firebase_admin.initialize_app(cred)
db = firestore.client()

class Task():
    
    _status = "pending"

    def __init__(self, vid, url):
        self.vid = vid
        self.url = url
        self._status = "created"
        self.doc_ref = db.collection("AnalyzeData").document(vid)
        self.doc_ref.set({"status": self._status, "metaData": {"url": url}, "data": ""})

    def _setStatus(self, status):
        self._status = status
        self.doc_ref.update({"status": status})
    
    def downloadChat(self):
        self.chat = download_chat(self.url)
        self._setStatus("Chat downloaded")
    
    def uploadToBucket(self):
        upload_blob(self.chat, self.vid)
        self._setStatus("Chat uploaded to bucket")
    
    def submitSparkBatch(self):
        self.batchOperation = submit_batch(vid=self.vid)
        self._setStatus("Spark Batch Submitted")
        # no longer wait for the result
        #result =  self.batchOperation.result()
    
    # Just leave it for the user to trigger it again!
    # def cleanOnError(self):
    #     # in case of error delete document in firestore
    #     self.doc_ref.delete()

