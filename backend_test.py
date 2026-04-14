import requests
import sys
import json
from datetime import datetime

class AlumniPlatformTester:
    def __init__(self, base_url="http://localhost:8000"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
        
        result = {
            "test": name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {name}")
        if details:
            print(f"    Details: {details}")

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            details = f"Status: {response.status_code}"
            
            if success and response.content:
                try:
                    response_data = response.json()
                    if method == 'POST' and 'token' in response_data:
                        self.token = response_data['token']
                        if 'user' in response_data and 'id' in response_data['user']:
                            self.user_id = response_data['user']['id']
                    details += f" | Response: {json.dumps(response_data, indent=2)[:200]}..."
                except:
                    details += f" | Response: {response.text[:100]}..."
            elif not success:
                try:
                    error_data = response.json()
                    details += f" | Error: {error_data}"
                except:
                    details += f" | Error: {response.text[:100]}"

            self.log_test(name, success, details)
            return success, response.json() if response.content else {}

        except Exception as e:
            self.log_test(name, False, f"Exception: {str(e)}")
            return False, {}

    def test_auth_flow(self):
        """Test authentication endpoints"""
        print("\n🔐 Testing Authentication Flow...")
        
        # Test signup
        signup_data = {
            "email": f"test_user_{datetime.now().strftime('%H%M%S')}@example.com",
            "password": "TestPass123!",
            "full_name": "Test User"
        }
        
        success, response = self.run_test(
            "User Signup",
            "POST",
            "auth/signup",
            200,
            data=signup_data
        )
        
        if not success:
            # Try login with existing user
            login_data = {
                "email": "demo@example.com",
                "password": "demo123"
            }
            
            success, response = self.run_test(
                "User Login (Existing)",
                "POST",
                "auth/login",
                200,
                data=login_data
            )
        
        if success and self.token:
            # Test profile endpoint
            self.run_test(
                "Get Profile",
                "GET",
                "auth/profile",
                200
            )
        
        return success

    def test_feed_module(self):
        """Test feed/posts endpoints"""
        print("\n📝 Testing Feed Module...")
        
        # Get posts
        self.run_test(
            "Get Posts",
            "GET",
            "posts",
            200
        )
        
        # Create post
        post_data = {
            "content": f"Test post created at {datetime.now().isoformat()}",
            "image_url": ""
        }
        
        success, response = self.run_test(
            "Create Post",
            "POST",
            "posts",
            200,
            data=post_data
        )
        
        if success and 'id' in response:
            post_id = response['id']
            
            # Like post
            self.run_test(
                "Like Post",
                "POST",
                f"posts/{post_id}/like",
                200
            )
            
            # Add comment
            comment_data = {"comment": "Test comment"}
            self.run_test(
                "Add Comment",
                "POST",
                f"posts/{post_id}/comment",
                200,
                data=comment_data
            )

    def test_alumni_network(self):
        """Test alumni network endpoints"""
        print("\n👥 Testing Alumni Network...")
        
        # Search alumni
        self.run_test(
            "Search Alumni",
            "GET",
            "alumni/search",
            200
        )
        
        # Get connections
        self.run_test(
            "Get Connections",
            "GET",
            "alumni/connections",
            200
        )

    def test_jobs_module(self):
        """Test jobs endpoints"""
        print("\n💼 Testing Jobs Module...")
        
        # Get jobs
        self.run_test(
            "Get Jobs",
            "GET",
            "jobs",
            200
        )
        
        # Get my applications
        self.run_test(
            "Get My Applications",
            "GET",
            "jobs/my-applications",
            200
        )

    def test_placement_module(self):
        """Test placement endpoints"""
        print("\n🎯 Testing Placement Module...")
        
        # Get placement questions
        self.run_test(
            "Get Placement Questions",
            "GET",
            "placement/questions",
            200
        )
        
        # Get placement submissions
        self.run_test(
            "Get Placement Submissions",
            "GET",
            "placement/submissions",
            200
        )
        
        # Get saved questions
        self.run_test(
            "Get Saved Questions",
            "GET",
            "placement/saved-questions",
            200
        )

    def test_ai_assistant(self):
        """Test AI assistant endpoints"""
        print("\n🤖 Testing AI Assistant...")
        
        # Ask AI question
        ai_data = {
            "question": "What are some tips for technical interviews?",
            "context": "I'm preparing for software engineering interviews"
        }
        
        self.run_test(
            "Ask AI Question",
            "POST",
            "ai/ask",
            200,
            data=ai_data
        )
        
        # Get AI history
        self.run_test(
            "Get AI History",
            "GET",
            "ai/history",
            200
        )

    def test_root_endpoint(self):
        """Test root API endpoint"""
        print("\n🏠 Testing Root Endpoint...")
        
        self.run_test(
            "Root API",
            "GET",
            "",
            200
        )

    def run_all_tests(self):
        """Run all tests"""
        print("🚀 Starting Alumni Platform API Tests...")
        print(f"Testing against: {self.base_url}")
        
        # Test root endpoint first
        self.test_root_endpoint()
        
        # Test authentication (required for other tests)
        auth_success = self.test_auth_flow()
        
        if not auth_success:
            print("❌ Authentication failed - stopping tests")
            return False
        
        # Test all modules
        self.test_feed_module()
        self.test_alumni_network()
        self.test_jobs_module()
        self.test_placement_module()
        self.test_ai_assistant()
        
        # Print summary
        print(f"\n📊 Test Summary:")
        print(f"Tests Run: {self.tests_run}")
        print(f"Tests Passed: {self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        # Print failed tests
        failed_tests = [t for t in self.test_results if not t['success']]
        if failed_tests:
            print(f"\n❌ Failed Tests ({len(failed_tests)}):")
            for test in failed_tests:
                print(f"  - {test['test']}: {test['details']}")
        
        return self.tests_passed == self.tests_run

def main():
    tester = AlumniPlatformTester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())