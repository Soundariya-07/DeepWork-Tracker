"""
Sessions API for DeepWork SDK
"""

from ..import ApiClient

class SessionsApi:
    """
    API for managing DeepWork sessions
    """
    def __init__(self, api_client=None):
        """
        Initialize the Sessions API
        
        Args:
            api_client (ApiClient): API client instance
        """
        self.api_client = api_client or ApiClient()
    
    def create_session(self, title, goal=None, scheduled_duration=30):
        """
        Create a new session
        
        Args:
            title (str): Session title
            goal (str, optional): Session goal
            scheduled_duration (int): Scheduled duration in minutes
            
        Returns:
            dict: Created session data
        """
        data = {"title": title, "scheduled_duration": scheduled_duration}
        if goal:
            data["goal"] = goal
        return self.api_client.call_api("POST", "/sessions/", data=data)
    
    def get_sessions(self):
        """
        Get all sessions
        
        Returns:
            list: List of sessions
        """
        return self.api_client.call_api("GET", "/sessions/")
    
    def get_session(self, session_id):
        """
        Get a session by ID
        
        Args:
            session_id (int): Session ID
            
        Returns:
            dict: Session data
        """
        return self.api_client.call_api("GET", f"/sessions/{session_id}")
    
    def start_session(self, session_id):
        """
        Start a session
        
        Args:
            session_id (int): Session ID
            
        Returns:
            dict: Updated session data
        """
        return self.api_client.call_api("PATCH", f"/sessions/{session_id}/start")
    
    def pause_session(self, session_id, reason):
        """
        Pause a session
        
        Args:
            session_id (int): Session ID
            reason (str): Reason for pausing
            
        Returns:
            dict: Updated session data
        """
        return self.api_client.call_api("PATCH", f"/sessions/{session_id}/pause", data={"reason": reason})
    
    def resume_session(self, session_id):
        """
        Resume a paused session
        
        Args:
            session_id (int): Session ID
            
        Returns:
            dict: Updated session data
        """
        return self.api_client.call_api("PATCH", f"/sessions/{session_id}/resume")
    
    def complete_session(self, session_id):
        """
        Complete a session
        
        Args:
            session_id (int): Session ID
            
        Returns:
            dict: Updated session data
        """
        return self.api_client.call_api("PATCH", f"/sessions/{session_id}/complete")
    
    def get_session_history(self):
        """
        Get session history
        
        Returns:
            list: Session history data
        """
        return self.api_client.call_api("GET", "/sessions/history")
    
    def get_session_interruptions(self, session_id):
        """
        Get interruptions for a session
        
        Args:
            session_id (int): Session ID
            
        Returns:
            list: Interruption data
        """
        return self.api_client.call_api("GET", f"/sessions/{session_id}/interruptions")
