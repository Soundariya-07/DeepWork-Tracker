"""
This is a simple manual implementation of the DeepWork SDK.
It provides the same functionality as the generated SDK would,
but without requiring the OpenAPI Generator.
"""

import requests

class ApiClient:
    def __init__(self, base_url="http://localhost:8090"):
        self.base_url = base_url
        self.session = requests.Session()
    
    def call_api(self, method, path, data=None, params=None):
        url = f"{self.base_url}{path}"
        response = self.session.request(method, url, json=data, params=params)
        response.raise_for_status()
        return response.json() if response.text else None

class SessionsApi:
    def __init__(self, api_client=None):
        self.api_client = api_client or ApiClient()
    
    def create_session(self, title, goal=None, scheduled_duration=30):
        data = {"title": title, "scheduled_duration": scheduled_duration}
        if goal:
            data["goal"] = goal
        return self.api_client.call_api("POST", "/sessions/", data=data)
    
    def get_sessions(self):
        return self.api_client.call_api("GET", "/sessions/")
    
    def get_session(self, session_id):
        return self.api_client.call_api("GET", f"/sessions/{session_id}")
    
    def start_session(self, session_id):
        return self.api_client.call_api("PATCH", f"/sessions/{session_id}/start")
    
    def pause_session(self, session_id, reason):
        return self.api_client.call_api("PATCH", f"/sessions/{session_id}/pause", data={"reason": reason})
    
    def resume_session(self, session_id):
        return self.api_client.call_api("PATCH", f"/sessions/{session_id}/resume")
    
    def complete_session(self, session_id):
        return self.api_client.call_api("PATCH", f"/sessions/{session_id}/complete")
    
    def get_session_history(self):
        return self.api_client.call_api("GET", "/sessions/history")
    
    def get_session_interruptions(self, session_id):
        return self.api_client.call_api("GET", f"/sessions/{session_id}/interruptions")
