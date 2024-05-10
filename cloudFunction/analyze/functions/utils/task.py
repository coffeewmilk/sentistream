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

    def __init__(self, data):
        # initiate variable
        self._url = data["url"]
        self._videoId = data["videoId"]
        self._title = data["title"]
        self._lengthSeconds = data["lengthSeconds"]
        self._channelId = data["channelId"]
        self._viewCount = data["viewCount"]
        self._author = data["author"]

        # Create document in firestore
        self._status = "created"
        self.doc_ref = db.collection("AnalyzeData").document(self._videoId)
        self.doc_ref.set({"status": self._status})
        self.doc_ref.update(data)

    def _setStatus(self, status):
        self._status = status
        self.doc_ref.update({"status": status})
    
    def downloadChat(self):
        self.chat = download_chat(self._url)
        self._setStatus("Chat downloaded")
    
    def uploadToBucket(self):
        upload_blob(self.chat, self._videoId)
        self._setStatus("Chat uploaded to bucket")
    
    def submitSparkBatch(self):
        self.batch_uuid = submit_batch(vid=self._videoId)
        self._setStatus("Spark Batch Submitted")
        # no longer wait for the result
        return self.batch_uuid
    
    def reportFailure(self, message):
        self._setStatus("Failed")
        self.doc_ref.update({"error": message})
    
    # Just leave it for the user to trigger it again!
    # def cleanOnError(self):
    #     # in case of error delete document in firestore
    #     self.doc_ref.delete()

