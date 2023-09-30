import json

aws_cf_file = "cloud-deployments/aws/cloudformation/aws_build_from_source_no_credentials.json"

with open(aws_cf_file) as f_in:
    aws_cf = json.load(f_in)
install_script_lines = aws_cf['Resources']['AnythingLLMInstance']['Properties']['UserData']['Fn::Base64']['Fn::Join'][1]
install_script = ""
for install_script_line in install_script_lines:
    install_script = install_script + install_script_line

print(install_script)

with open('install_script.sh', 'w') as output:
    output.write(install_script)