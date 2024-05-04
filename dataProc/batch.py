"""

Perform sentiment batch analysis on dataset of AVRO format and return result in JSON format.

Usage:
    Arguments: --input_path <INPUT_AVRO_FILE_PATH> --output_path <OUTPUT_JSON_FILE_PATH>

"""

import argparse

from pyspark.sql import SparkSession
from sparknlp.pretrained import PretrainedPipeline
from sparknlp import Finisher


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

args = parser.parse_args()
inputPath = f"gs://{args.bucket_name}/{args.input_path}"
outputPath = f"gs://{args.bucket_name}/{args.output_path}"

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