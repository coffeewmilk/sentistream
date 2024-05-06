"""

Perform sentiment batch analysis on dataset of AVRO format and return result in JSON format.

Usage:
    Arguments: --input_path <INPUT_AVRO_FILE_PATH> --output_path <OUTPUT_JSON_FILE_PATH>
               --bucket_name <NAME OF THE BUCKET> --firestore_ref (Optipnal) <FIRESTORE_DOCUMENT_TO_UPDATE_STATUS>

"""

import argparse

from pyspark.sql import SparkSession
from sparknlp.pretrained import PretrainedPipeline
from sparknlp import Finisher

import firebase_admin
from firebase_admin import firestore


parser = argparse.ArgumentParser(
        description=__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )

parser.add_argument(
    "--input_path",
    type=str,
    required=True,
    help="The path of the input file. Ex. 'input/input1.avro'"
)

parser.add_argument(
    "--output_path",
    type=str,
    required=True,
     help="The path of the input file. Ex. 'input/output1.json'"
)

parser.add_argument(
    "--bucket_name",
    type=str,
    required=True,
     help="The bucket name"
)

parser.add_argument(
    "--firestore_ref",
    type=str,
    required=False,
    default="",
    help="(optonal) The document under analysis collection on firestore to update its status"
)

args = parser.parse_args()
firestore_ref = args.firestore_ref


class Status:
    _app = firebase_admin.initialize_app()
    _db  = firestore.client()
    _require_firestore = False
    status = "Batch initiated"
    
    def __init__(self, firestore_doc):
        if firestore_doc:
            self._require_firestore = True
            self._doc_ref = self._db.collection("AnalyzeData").document(firestore_doc)
            self.update_status(self.status)
    
    def update_status(self, status, error=''):
        if self._require_firestore:
            self._doc_ref.update({"status": status})
            if status == "Success":
                self._doc_ref.update({"data": outputPath})
            if status == "Failed":
                self._doc_ref.update({"error": error})
        self.status = status


inputPath = f"gs://{args.bucket_name}/{args.input_path}"
outputPath = f"gs://{args.bucket_name}/{args.output_path}"
status = Status(firestore_ref)

try: 
    spark = SparkSession.builder.appName("sentiment_analysis_batch") \
                                .getOrCreate()

    read = spark.read.format("avro").load(inputPath).withColumnRenamed("message", "text")


    pipelineLocation = "gs://sentistream/dependencies/analyze_sentiment_en_4.4.2_3.2_1685186425752"
    pipeline = PretrainedPipeline.from_disk(pipelineLocation)
    finisher = Finisher().setInputCols(["sentiment"]).setIncludeMetadata(False)

    result = pipeline.transform(read)
    finished = finisher.transform(result)
    highest_sentiment = finished.withColumn("finished_sentiment", finished.finished_sentiment[0])

    highest_sentiment.write.format('json') \
                        .mode('overwrite') \
                        .save(outputPath)
    
    status.update_status("Success")

except Exception as e:
    status.update_status("Failed", e)
    raise e