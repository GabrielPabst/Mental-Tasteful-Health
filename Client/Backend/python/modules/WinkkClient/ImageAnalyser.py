
import requests
import json
from helpers.key import key,realm
from helpers.key import ninja_key
from helpers.config import image_analyse_prompt
from helpers.JsonFormatter import JsonFormatter
class AdditionalIngredientGenerator(): 

    standartPromt = None
    system_prompt = image_analyse_prompt

    def __init__(self):
        pass
    
    def generateResponse(self, image_url):
        

        api_url = 'https://api.api-ninjas.com/v1/imagetotext'
        image_file_descriptor = open(image_url, 'rb')
        files = {'image': image_file_descriptor}
        r = requests.post(api_url, files=files, headers={'X-Api-Key': ninja_key})
        self.standartPromt = [
            ["system", self.system_prompt]
        ]
        url = "https://nexusdev.winkk.ai/streamChat"
        headers = {
            "api-key": key,  # Replace with your actual API key
            "Content-Type": "application/json"
        }
        payload = {
            "realm_id": realm,  # Replace with your actual realm ID
            "prompt": f'"{r.json()}"',
            "history":  self.standartPromt,
            "system_prompt":""
        }

        response = requests.post(url, headers=headers, json=payload, stream=True)
        
        if response.status_code == 200:
            full_response = ""
            for line in response.iter_lines():
                if line:
                    try:
                        data = line.decode('utf-8').replace("data: ", "")
                        if data.strip() and data != ": ping":
                            json_data = json.loads(data)
                            full_response += json_data["content"]
                    except ValueError:
                        #print("Skipping invalid JSON line:", line)
                        pass
            return full_response
        else:
            print("Request failed with status code:", response.status_code)
            print("Response content:", response.text)
            response.raise_for_status()
