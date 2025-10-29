# Test Proxy Configuration

This guide helps you verify that API requests are properly proxied to port 8006.

## Quick Test Steps

### 1. Check Proxy is Active

Open browser console (F12) and look for proxy logs when making API requests:
```
🔄 Proxying POST /api/users/login → http://localhost:8006/api/users/login
✅ Response from http://localhost:8006/api/users/login: 200
```

### 2. Verify Backend is Running

**Option A: Browser**
```javascript
// Run in browser console
fetch('http://localhost:8006/api/resume/optimization/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

**Option B: Terminal**
```bash
# Test health endpoint directly
curl http://localhost:8006/api/resume/optimization/health

# Test with verbose output
curl -v http://localhost:8006/api/users/
```

### 3. Check Network Tab

1. Open Developer Tools (F12)
2. Go to **Network** tab
3. Make an API request (e.g., login)
4. Find the request in the list
5. Check **Request URL**: Should show `http://localhost:3000/api/...`
6. Check **General** section:
   - **Request URL**: `http://localhost:3000/api/users/login`
   - This is correct - Vite proxy handles the forwarding

### 4. Verify Actual Backend Connection

Look at the **Response Headers** in Network tab:
- If you see headers from your backend, proxy is working
- If you get Connection Refused, backend is not running

### 5. Check for CORS Errors

If you see errors like:
```
Access to XMLHttpRequest at 'http://localhost:8006/...' 
from origin 'http://localhost:3000' has been blocked by CORS policy
```

**This means:**
- Proxy is NOT working (request went directly to 8006)
- OR backend CORS settings are incorrect

**Solution:**
- Verify proxy config in `vite.config.js`
- Restart Vite dev server after config changes

### 6. Test Proxy Logs

When you make a request, you should see in **Vite terminal**:
```
🔄 Proxying POST /api/users/login → http://localhost:8006/api/users/login
✅ Response from http://localhost:8006/api/users/login: 200
```

### 7. Verify Request Details

In browser console, you should see:
```
📤 Request: POST /api/users/login
   target: Proxied to http://localhost:8006
```

## Common Issues

### Issue: "500 Internal Server Error"
- **Proxy is working** (request reached backend)
- **Problem is in backend** - check backend logs
- Backend received the request but had an error processing it

### Issue: "Network Error" or "Connection Refused"
- Backend is not running on port 8006
- Start backend server: Check your backend startup command

### Issue: CORS Error
- Proxy not working (bypassing proxy)
- Restart Vite dev server
- Check `vite.config.js` configuration

### Issue: 404 Not Found
- Backend route doesn't exist
- Check API endpoint URL in frontend code

## Debug Checklist

- [ ] Backend is running on port 8006
- [ ] Vite dev server is running
- [ ] See proxy logs in Vite terminal
- [ ] See request logs in browser console
- [ ] Network tab shows request to localhost:3000 (not 8006)
- [ ] Response headers indicate successful connection

## Manual Test

```bash
# 1. Start backend on 8006
# 2. Start frontend: npm run dev
# 3. Open browser to http://localhost:3000
# 4. Open console (F12)
# 5. Try to login or make any API call
# 6. Check both browser console and Vite terminal for logs
```

