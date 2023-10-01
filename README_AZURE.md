# Azure deployment.
Base on [aws_build_from_source_no_credentials.json](cloud-deployments/aws/cloudformation/aws_build_from_source_no_credentials.json) it is a single layer deployment. Let's with the same for simplexity.
  - Use [extract_install_script.py](./extract_install_script.py) to extract install script from [aws_build_from_source_no_credentials.json](cloud-deployments/aws/cloudformation/aws_build_from_source_no_credentials.json)
  - [install_script.sh](./install_script.sh) will be generated in the root directly. We can't run it directly, we will need to modify it a bit.


## Setup the external disk
https://learn.microsoft.com/en-us/azure/virtual-machines/linux/attach-disk-portal?tabs=ubuntu
## Check disks
```
[azureuser@anything-llm docker]$ lsblk -o NAME,HCTL,SIZE,MOUNTPOINT | grep -i "sd"
sda               1:0:0:0     256G 
sdb               0:0:0:0      64G 
├─sdb1                        500M /boot
├─sdb2                         63G 
├─sdb14                         4M 
└─sdb15                       495M /boot/efi
sdc               0:0:0:1       8G 
└─sdc1                          8G 
```
## Initialize disk
```
sudo parted /dev/sda --script mklabel gpt mkpart xfspart xfs 0% 100%
sudo mkfs.xfs /dev/sda1
sudo partprobe /dev/sda1
```
```
[azureuser@anything-llm docker]$ sudo parted /dev/sda --script mklabel gpt mkpart xfspart xfs 0% 100%
[azureuser@anything-llm docker]$ sudo mkfs.xfs /dev/sda1
meta-data=/dev/sda1              isize=512    agcount=4, agsize=16777088 blks
         =                       sectsz=4096  attr=2, projid32bit=1
         =                       crc=1        finobt=1, sparse=1, rmapbt=0
         =                       reflink=1    bigtime=0 inobtcount=0
data     =                       bsize=4096   blocks=67108352, imaxpct=25
         =                       sunit=0      swidth=0 blks
naming   =version 2              bsize=4096   ascii-ci=0, ftype=1
log      =internal log           bsize=4096   blocks=32767, version=2
         =                       sectsz=4096  sunit=1 blks, lazy-count=1
realtime =none                   extsz=4096   blocks=0, rtextents=0
Discarding blocks...Done.
[azureuser@anything-llm docker]$ sudo partprobe /dev/sda1
```
## Mount the disk
```
sudo mkdir /datadrive
sudo mount /dev/sda1 /datadrive
```
## Enable auto mount
```
sudo blkid
```
```
[azureuser@anything-llm docker]$ sudo blkid
/dev/sdb1: UUID="3be24f71-c584-4997-908f-de8c77fbf988" BLOCK_SIZE="4096" TYPE="xfs" PARTUUID="08194e99-4844-4d47-949e-8245ac056aba"
/dev/sdb2: UUID="R2fg21-J3fd-S6As-1YPg-wMhi-fKhB-APlRLl" TYPE="LVM2_member" PARTUUID="74bb0445-873d-4a3d-ac4e-3f8ea73839e2"
/dev/sdb15: SEC_TYPE="msdos" UUID="3328-E458" BLOCK_SIZE="512" TYPE="vfat" PARTLABEL="EFI System Partition" PARTUUID="fda4aaae-ff65-4975-8be3-001781c09cc5"
/dev/sdc1: UUID="c743ba9a-962c-4d98-ab16-4ef252adbedc" BLOCK_SIZE="4096" TYPE="ext4" PARTUUID="366cdede-01"
/dev/mapper/rootvg-tmplv: UUID="a6a26328-7157-41ea-a6ed-e4a89da00d2d" BLOCK_SIZE="4096" TYPE="xfs"
/dev/mapper/rootvg-usrlv: UUID="d0a5ec53-dea1-4bfa-83ef-fb9ee85b868c" BLOCK_SIZE="4096" TYPE="xfs"
/dev/mapper/rootvg-homelv: UUID="2658b270-62cc-458d-afd3-b63ce143aeac" BLOCK_SIZE="4096" TYPE="xfs"
/dev/mapper/rootvg-varlv: UUID="3aba65b1-d5fb-496d-a2be-dfa187b6bfd2" BLOCK_SIZE="4096" TYPE="xfs"
/dev/mapper/rootvg-rootlv: UUID="3549dfce-5fcb-4def-b8ad-12436f2d5da8" BLOCK_SIZE="4096" TYPE="xfs"
/dev/sda1: UUID="c15d78ae-6bf3-4f6b-9ac0-31b69cefb328" BLOCK_SIZE="4096" TYPE="xfs" PARTLABEL="xfspart" PARTUUID="6168f388-8882-4cc3-b5c6-6e96b81ba5c1"
/dev/sdb14: PARTUUID="5a3a6db4-5b88-40f3-b065-c6f3ddaf2cdd"
```
## Run script commnad one by one
Note the docker install in the script didn't work, we followed other steps to install docker. Checkout the script for details.
ENV reference
```
SERVER_PORT=3001
CACHE_VECTORS="true"
JWT_SECRET="my-random-string-for-seeding" # Please generate random string at least 12 chars long.
###########################################
######## LLM API SElECTION ################
###########################################
LLM_PROVIDER='openai'
OPEN_AI_KEY=sk-UDVWn2IlRvSLjgOmiEG**********
OPEN_MODEL_PREF='gpt-3.5-turbo'
# LLM_PROVIDER='azure'
# AZURE_OPENAI_ENDPOINT=
# AZURE_OPENAI_KEY=
# OPEN_MODEL_PREF='my-gpt35-deployment' # This is the "deployment" on Azure you want to use. Not the base model.
# EMBEDDING_MODEL_PREF='embedder-model' # This is the "deployment" on Azure you want to use for embeddings. Not the base model. Valid base model is text-embedding-ada-002
###########################################
######## Vector Database Selection ########
###########################################
# Enable all below if you are using vector database: Chroma.
# VECTOR_DB="chroma"
# CHROMA_ENDPOINT='http://localhost:8000'
# Enable all below if you are using vector database: Pinecone.
# VECTOR_DB="pinecone"
# PINECONE_ENVIRONMENT=
# PINECONE_API_KEY=
# PINECONE_INDEX=
# Enable all below if you are using vector database: LanceDB.
VECTOR_DB="lancedb"
# Enable all below if you are using vector database: Weaviate.
# VECTOR_DB="weaviate"
# WEAVIATE_ENDPOINT="http://localhost:8080"
# WEAVIATE_API_KEY=
# Enable all below if you are using vector database: Qdrant.
# VECTOR_DB="qdrant"
# QDRANT_ENDPOINT="http://localhost:6333"
# QDRANT_API_KEY=
# CLOUD DEPLOYMENT VARIRABLES ONLY
# AUTH_TOKEN="hunter2" # This is the password to your application if remote hosting.
# STORAGE_DIR= # absolute filesystem path with no trailing slash
# NO_DEBUG="true"
```