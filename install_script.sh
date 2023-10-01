Content-Type: multipart/mixed; boundary="//"
MIME-Version: 1.0

--//
Content-Type: text/cloud-config; charset="us-ascii"
MIME-Version: 1.0
Content-Transfer-Encoding: 7bit
Content-Disposition: attachment; filename="cloud-config.txt"


#cloud-config
cloud_final_modules:
- [scripts-user, always]


--//
Content-Type: text/x-shellscript; charset="us-ascii"
MIME-Version: 1.0
Content-Transfer-Encoding: 7bit
Content-Disposition: attachment; filename="userdata.txt"


#!/bin/bash
# check output of userdata script with sudo tail -f /var/log/cloud-init-output.log
# user https://docs.docker.com/engine/install/rhel/ to install docker
# docker yum repo needs to be correct by following https://stackoverflow.com/questions/70358656/rhel8-fedora-yum-dns-causes-cannot-download-repodata-repomd-xml-for-docker-ce
# https://jhooq.com/docker-daemon-centos/
# sudo usermod -a -G docker ec2-user
sudo usermod -a -G docker azureuser
curl -L https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m) -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
sudo ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose
# Failed to enable unit: Unit file docker.service does not exist.
sudo systemctl enable docker
sudo systemctl start docker
sudo yum install git -y
# git clone https://github.com/Mintplex-Labs/anything-llm.git /home/ec2-user/anything-llm
git clone https://github.com/Mintplex-Labs/anything-llm.git
# cd /home/ec2-user/anything-llm/docker
cd /home/azureuser/anything-llm/docker
# start create env, we will come back here later
cat >> .env << "END"
SERVER_PORT=3001
OPEN_AI_KEY=sk-UDVWn2IlRvSLjgOmiEGh**********
OPEN_MODEL_PREF='gpt-3.5-turbo'
CACHE_VECTORS="true"
VECTOR_DB="pinecone"
PINECONE_ENVIRONMENT=
PINECONE_API_KEY=
PINECONE_INDEX=
STORAGE_DIR="/datadrive/storage"
GOOGLE_APIS_KEY=
UID="1000"
GID="1000"
END
# end create env
cd ../frontend
rm -rf .env.production
# start frontend env
cat >> .env.production << "END"
GENERATE_SOURCEMAP=true
VITE_API_BASE="/api"
END
# end frontend env
# sudo docker-compose -f /home/ec2-user/anything-llm/docker/docker-compose.yml up -d
sudo docker-compose -f /home/azureuser/anything-llm/docker/docker-compose.yml up -d
echo "Container ID: $(sudo docker ps --latest --quiet)"
# Container ID: 364206ed1bcd
sudo docker container exec -u 0 -t $(sudo docker ps --latest --quiet) mkdir -p /app/server/storage /app/server/storage/documents /app/server/storage/vector-cache /app/server/storage/lancedb
# not output
echo "Placeholder folders in storage created."
sudo docker container exec -u 0 -t $(sudo docker ps --latest --quiet) touch /app/server/storage/anythingllm.db
# no output
echo "SQLite DB placeholder set."
sudo docker container exec -u 0 -t $(sudo docker ps --latest --quiet) chown -R anythingllm:anythingllm /app/collector /app/server
# command took a long time
echo "File permissions corrected."
export ONLINE=$(curl -Is http://localhost:3001/api/ping | head -n 1|cut -d$' ' -f2)
echo "Health check: $ONLINE"
# Health check: 200
if [ "$ONLINE" = 200 ] ; then echo "Running migrations..." && curl -Is http://localhost:3001/api/migrate | head -n 1|cut -d$' ' -f2; fi
# only took a few seconds with output: Running migrations...
echo "Setup complete! AnythingLLM instance is now online!"

--//--