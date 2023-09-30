# Azure deployment.
Base on [aws_build_from_source_no_credentials.json](cloud-deployments/aws/cloudformation/aws_build_from_source_no_credentials.json) it is a single layer deployment. Let's with the same for simplexity.
  - Use [extract_install_script.py](./extract_install_script.py) to extract install script from [aws_build_from_source_no_credentials.json](cloud-deployments/aws/cloudformation/aws_build_from_source_no_credentials.json)
  - [install_script.sh](./install_script.sh) will be generated in the root directly. We can't run it directly, we will need to modify it a bit.