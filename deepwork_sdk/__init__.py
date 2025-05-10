"""
DeepWork SDK - Python client for the DeepWork Session Tracker API
"""

class ApiClient:
    """
    Default API client for DeepWork API
    """
    def __init__(self, base_url="http://localhost:8090"):
        """
        Initialize the API client
        
        Args:
            base_url (str): Base URL for the API
        """
        import requests
        self.base_url = base_url
        self.session = requests.Session()
    
    def call_api(self, method, path, data=None, params=None):
        """
        Make an API call
        
        Args:
            method (str): HTTP method (GET, POST, PATCH, etc.)
            path (str): API endpoint path
            data (dict): Request body data
            params (dict): Query parameters
            
        Returns:
            dict: API response as JSON
        """
        url = f"{self.base_url}{path}"
        response = self.session.request(method, url, json=data, params=params)
        response.raise_for_status()
        return response.json() if response.text else None
