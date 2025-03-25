from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

OLLAMA_URL = "http://127.0.0.1:11433/api/generate"  # Ollama API endpoint

@app.route("/chat", methods=["POST"])
def chat():
    # Get input data (JSON)
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid JSON"}), 400  # Handle bad requests

    # Use Toshokan as the default model
    model = data.get("model", "Toshokan")
    prompt = data.get("prompt", "Hello")

    # Print debug information
    print(f"Sending request to Ollama with model: {model}, prompt: {prompt}")

    try:
        # Send request to Ollama with the model and prompt
        response = requests.post(OLLAMA_URL, json={"model": model, "prompt": prompt})
        
        # Print the raw response for debugging
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {response.headers}")
        print(f"Raw Response: {response.text}")

        # Check if response is successful
        response.raise_for_status()
        
        # Try to parse JSON response
        response_json = response.json()
        return jsonify(response_json)
    
    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Failed to connect to Ollama: {str(e)}"}), 500
    except requests.exceptions.JSONDecodeError as e:
        return jsonify({"error": "Invalid response from Ollama", "raw": response.text}), 500
    except Exception as e:
        return jsonify({"error": f"Unexpected error: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=11433)

# this  is  my server
# hosted in linux 