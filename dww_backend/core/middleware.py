class DebugMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        print("🚀 Middleware Debugging")
        print(f"Incoming Cookies: {request.COOKIES}")

        # ✅ Check if SessionMiddleware is enabled before accessing `request.session`
        if hasattr(request, "session"):
            print(f"Session ID: {request.session.session_key}")
        else:
            print("🚨 Warning: SessionMiddleware is not active!")

        return self.get_response(request)
