import requests

# API endpoint
base_url = "http://localhost:8000"

# Test user data
test_user = {
    "username": "nporaporsdsdsdsdpoapro",
    "password": "Testdssdsass123!",  # More complex password
    "email": "newutesdsdsdst@gmail.com"  # Using Gmail domain
}

# Make registration request
try:
    print("Sending request with data:", test_user)
    response = requests.post(f"{base_url}/auth/register", json=test_user)
    print("Status Code:", response.status_code)
    if response.status_code != 200:
        print("Error Response:", response.text)
    else:
        print("Success Response:", response.json())
except Exception as e:
    print("Error:", str(e))
