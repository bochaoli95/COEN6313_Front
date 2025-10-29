# Debugging Guide - API Error 500

This guide helps you debug HTTP 500 (Internal Server Error) responses.

## Quick Steps to Debug 500 Errors

### 1. Check Browser Console
Open browser Developer Tools (F12) and check the Console tab. You'll see detailed error logs:
- **Red error messages** with full error details
- **API Error Details** section with:
  - Status code and status text
  - Request URL and method
  - Request configuration
  - Response data from server
  - Full error object

### 2. Check Network Tab
1. Open Developer Tools (F12)
2. Go to **Network** tab
3. Look for the failed request (usually marked in red)
4. Click on it to see:
   - **Headers**: Request and response headers
   - **Payload**: Data sent to server
   - **Response**: Server response (error message)
   - **Preview**: Formatted response view

### 3. Common Causes of 500 Errors

#### Backend Issues:
- **Database connection errors**
- **Server code exceptions** (check backend logs)
- **Missing environment variables**
- **File permission issues**
- **Invalid request data format**

#### Frontend Issues:
- **Wrong API endpoint URL**
- **Invalid request payload**
- **Missing required headers**
- **CORS issues** (check browser console)

### 4. How to Find the Error

#### In Browser Console:
```javascript
// Error logs are automatically displayed when API calls fail
// Look for messages starting with:
// ❌ API Error Details
// 🚨 Server Error (500)
```

#### Check Specific Request:
1. Open Network tab
2. Filter by "Fetch/XHR"
3. Find the failing request
4. Check:
   - **Status**: 500
   - **Response**: Error message from server
   - **Request Payload**: What was sent

### 5. Error Object Structure

When a 500 error occurs, the error object contains:
```javascript
{
  status: 500,
  statusText: "Internal Server Error",
  url: "/api/users/login",
  method: "POST",
  data: { /* Server error response */ },
  message: "Request failed with status code 500",
  userMessage: "Error message for user display"
}
```

### 6. Debugging Steps

1. **Check if backend is running**
   ```bash
   # Test backend health
   curl http://localhost:8006/api/resume/optimization/health
   ```

2. **Check backend logs**
   - Look at your FastAPI/backend logs for error messages
   - Check for Python exceptions or stack traces

3. **Test API endpoint directly**
   ```bash
   # Using curl
   curl -X POST http://localhost:8006/api/users/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"test"}'
   ```

4. **Verify request data**
   - Check what data is being sent
   - Ensure all required fields are present
   - Validate data format matches API schema

5. **Check authentication**
   - Verify token is valid
   - Check token format: `Bearer <token>`
   - Ensure token hasn't expired

### 7. View Detailed Error Information

The enhanced error logging automatically provides:
- ✅ Request URL and method
- ✅ Request headers and payload
- ✅ Response status and data
- ✅ Full error stack trace
- ✅ User-friendly error messages

### 8. Common Solutions

#### Error 500 on Login/Register:
- Check database connection
- Verify user model schema
- Check password hashing

#### Error 500 on File Upload:
- Check file size limits
- Verify file storage permissions
- Check file parsing libraries

#### Error 500 on Chat:
- Check AI service connection
- Verify session handling
- Check message format

### 9. Enable Verbose Logging

If you need more details, check:
- **Browser Console**: Full request/response details
- **Network Tab**: Headers, payloads, timing
- **Backend Logs**: Server-side error messages

### 10. Report Error

When reporting a 500 error, include:
- ✅ Browser console error log
- ✅ Network tab request details
- ✅ Backend server logs
- ✅ Steps to reproduce
- ✅ Request payload/headers

---

## Quick Debug Commands

```javascript
// In browser console, check recent API calls
console.log(window.apiCalls || 'No API calls logged')

// Check authentication token
console.log('Token:', localStorage.getItem('token'))

// Test API connection
fetch('/api/resume/optimization/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

