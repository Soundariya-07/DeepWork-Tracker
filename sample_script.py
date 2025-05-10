"""
Sample script demonstrating the use of the DeepWork SDK.
This script shows how to:
1. Create a new session
2. Start the session
3. Pause the session with an interruption reason
4. Resume the session
5. Complete the session
6. View session history
"""

# Import from the OpenAPI-generated SDK
from deepwork_sdk.api.sessions_api import SessionsApi
from deepwork_sdk import ApiClient
import time

def main():
    # Initialize the API client and sessions API
    client = ApiClient()
    api = SessionsApi(client)
    
    print("=== DeepWork Session Tracker Demo ===\n")
    
    try:
        # 1. Create a new session
        print("Creating a new deep work session...")
        session = api.create_session(
            title="Write project documentation", 
            goal="Complete API documentation section", 
            scheduled_duration=45
        )
        session_id = session["id"]
        print(f"Session created with ID: {session_id}")
        
        # 2. Start the session
        print("\nStarting the session...")
        session = api.start_session(session_id)
        print(f"Session status: {session['status']}")
        
        # Simulate some work time
        print("\nWorking for 5 seconds...")
        time.sleep(5)
        
        # 3. Pause the session with interruption reason
        print("\nPausing the session due to an interruption...")
        session = api.pause_session(session_id, reason="Urgent email from client")
        print(f"Session status: {session['status']}")
        
        # Simulate interruption time
        print("\nInterruption for 3 seconds...")
        time.sleep(3)
        
        # 4. Resume the session
        print("\nResuming the session...")
        session = api.resume_session(session_id)
        print(f"Session status: {session['status']}")
        
        # Simulate more work time
        print("\nCompleting the work for 5 more seconds...")
        time.sleep(5)
        
        # 5. Complete the session
        print("\nCompleting the session...")
        session = api.complete_session(session_id)
        print(f"Session status: {session['status']}")
        
        # 6. View session history
        print("\nRetrieving session history...")
        history = api.get_session_history()
        print(f"Found {len(history)} completed sessions:")
        for item in history:
            print(f"- {item['title']} ({item['status']}): {item['scheduled_duration']} minutes with {item['interruption_count']} interruptions")
        
        print("\nDemo completed successfully!")
        
    except Exception as e:
        print(f"\nError: {e}")
        print("Make sure the backend server is running at http://localhost:8090")

if __name__ == "__main__":
    main()
