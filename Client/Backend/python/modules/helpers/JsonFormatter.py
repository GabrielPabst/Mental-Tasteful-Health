import json

class JsonFormatter:
    def __init__(self, text):
        self.text = text

    def remove_backticks(self):
        cleaned_text = self.text.replace('```', '')
        cleaned_text = self.text.replace('json', '')
        cleaned_text = cleaned_text.replace('```', '')
        if cleaned_text.strip():
            return cleaned_text
        else:
            raise ValueError("Input text does not contain valid JSON data")

# Example usage:
# formatter = JsonFormatter('```{"key": "value"}```')
# valid_json = formatter.remove_backticks()
# print(valid_json)  # Output: {'key': 'value'}