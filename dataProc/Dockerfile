# Debian 11 is recommended.
FROM debian:11-slim

# Suppress interactive prompts
ENV DEBIAN_FRONTEND=noninteractive

# (Required) Install utilities required by Spark scripts.
RUN apt update && apt install -y procps tini libjemalloc2 wget

# (Optiona) Install utilities required by XGBoost for Spark.
RUN apt install -y procps libgomp1

# Enable jemalloc2 as default memory allocator
ENV LD_PRELOAD=/usr/lib/x86_64-linux-gnu/libjemalloc.so.2



# (Optional) Add extra jars.
ENV SPARK_EXTRA_JARS_DIR=/opt/spark/jars/
ENV SPARK_EXTRA_CLASSPATH='/opt/spark/jars/*'
RUN mkdir -p "${SPARK_EXTRA_JARS_DIR}"

# pre-download package dependencies
RUN apt install -y openjdk-17-jdk
# ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
COPY pom.xml .

ENV PATH=${PATH}:${pwd}/apache-maven-3.9.6/bin
RUN wget https://dlcdn.apache.org/maven/maven-3/3.9.6/binaries/apache-maven-3.9.6-bin.tar.gz \
    && tar xzvf apache-maven-3.9.6-bin.tar.gz \
    && mvn dependency:copy-dependencies -DoutputDirectory=${SPARK_EXTRA_JARS_DIR} -f pom.xml 


# (Optional) Install and configure Miniconda3.
ENV CONDA_HOME=/opt/miniconda3
ENV PYSPARK_PYTHON=${CONDA_HOME}/bin/python
ENV PATH=${CONDA_HOME}/bin:${PATH}
COPY Miniconda3-py39_4.10.3-Linux-x86_64.sh .
RUN bash Miniconda3-py39_4.10.3-Linux-x86_64.sh -b -p /opt/miniconda3 \
  && ${CONDA_HOME}/bin/conda config --system --set always_yes True \
  && ${CONDA_HOME}/bin/conda config --system --set auto_update_conda False \
  && ${CONDA_HOME}/bin/conda config --system --prepend channels conda-forge \
  && ${CONDA_HOME}/bin/conda config --system --set channel_priority strict
# Packages ipython and ipykernel are required if using custom conda and want to
# use this container for running notebooks.
RUN ${CONDA_HOME}/bin/conda install ipython ipykernel

# (Optional) Install Conda packages.
#
# The following packages are installed in the default image, it is strongly
# recommended to include all of them.
#
# Use mamba to install packages quickly.
RUN ${CONDA_HOME}/bin/conda install mamba -n base -c conda-forge \
    && ${CONDA_HOME}/bin/mamba install \
      conda \
      cython \
      fastavro \
      fastparquet \
      gcsfs \
      google-cloud-bigquery-storage \
      google-cloud-bigquery[pandas] \
      google-cloud-bigtable \
      google-cloud-container \
      google-cloud-datacatalog \
      google-cloud-dataproc \
      google-cloud-datastore \
      google-cloud-language \
      google-cloud-logging \
      google-cloud-monitoring \
      google-cloud-pubsub \
      google-cloud-redis \
      google-cloud-spanner \
      google-cloud-speech \
      google-cloud-storage \
      google-cloud-texttospeech \
      google-cloud-translate \
      google-cloud-vision \
      koalas \
      matplotlib \
      nltk \
      numba \
      numpy \
      openblas \
      orc \
      pandas \
      pyarrow \
      pysal \
      pytables \
      python \
      regex \
      requests \
      rtree \
      scikit-image \
      scikit-learn \
      scipy \
      seaborn \
      sqlalchemy \
      sympy \
      virtualenv \
      spark-nlp 


# (Optional) Add extra Python modules.
# ENV PYTHONPATH=/opt/python/packages
# RUN mkdir -p "${PYTHONPATH}"
# COPY batch.py "${PYTHONPATH}"

# (Optional) Install R and R libraries.
# RUN apt update \
#   && apt install -y gnupg \
#   && apt-key adv --no-tty \
#       --keyserver "hkp://keyserver.ubuntu.com:80" \
#       --recv-keys E19F5F87128899B192B1A2C2AD5F960A256A04AF \
#   && echo "deb http://cloud.r-project.org/bin/linux/debian bullseye-cran40/" \
#       >/etc/apt/sources.list.d/cran-r.list \
#   && apt update \
#   && apt install -y \
#       libopenblas-base \
#       libssl-dev \
#       r-base \
#       r-base-dev \
#       r-recommended \
#       r-cran-blob

# ENV R_HOME=/usr/lib/R

# (Required) Create the 'spark' group/user.
# The GID and UID must be 1099. Home directory is required.
RUN groupadd -g 1099 spark
RUN useradd -u 1099 -g 1099 -d /home/spark -m spark
USER spark