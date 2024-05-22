from chat_downloader import ChatDownloader
from avro.schema import make_avsc_object 
from avro.datafile import DataFileWriter
from avro.io import DatumWriter
from google.cloud import storage
import io

schema = make_avsc_object({"namespace": "chat.avro",
                            "type": "record",
                            "name": "chat",
                            "fields": [
                                {"name": "id", "type": "string"},
                                {"name": "message", "type": "string"},
                                {"name": "timestamp", "type": "string"},
                                {"name": "time_seconds", "type": "string"},
                                {"name": "author_id", "type": "string"}
                            ]})

storage_client = storage.Client(project="sentistream-420115")
# bucket = storage_client.bucket("sentistream")
bucket = storage_client.bucket("sentistream-420115.appspot.com")

def download_chat(url):
    buffer = io.BytesIO()
    chat = ChatDownloader().get_chat(url)       
    writter = DataFileWriter(buffer, DatumWriter(), schema)
        
    for message in chat:                        
        writter.append({"id": message["message_id"],
                        "message": message["message"],
                        "timestamp": str(message["timestamp"]),
                        "time_seconds": str(message["time_in_seconds"]),
                        "author_id": message["author"]["id"]})
    
    writter.flush()
    return buffer

def upload_blob(buffer, vid, destination_blob_name = "analysis/"):
    blob = bucket.blob(destination_blob_name + vid + "/raw.avro")
    
    # in case the folder already exist!
    if blob.exists():
        blobs = list(bucket.list_blobs(prefix=(destination_blob_name + vid)))
        bucket.delete_blobs(blobs)
        
    blob.upload_from_string(buffer.getvalue())
    buffer.close()

    print(
        f"{vid} uploaded to {destination_blob_name}."
    )