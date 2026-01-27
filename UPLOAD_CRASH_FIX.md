# Upload Resumable Crash Fix

## Problem

When a client uploads a video through the `upload-resumable` endpoint and sends a chunk of incorrect format (specifically a Promise object or other invalid types), the Docker container with the PeerTube server would crash and restart.

## Root Cause

The `uploadx.upload` middleware was not properly validating incoming chunk data and had no error handling wrapper. When malformed data (like Promise objects) was sent:

1. The uploadx library would encounter an unexpected data type
2. This would cause an unhandled exception
3. The Node.js process would crash
4. The Docker container would restart

## Solution Implemented

### 1. Chunk Data Validation Middleware (`validateChunkData`)

Added a new middleware function that validates chunk data **before** it reaches uploadx:

- **Location**: `server/controllers/api/videos/upload.ts`
- **Checks**:
  - Validates Content-Range header format
  - Detects Promise objects using `Object.prototype.toString.call()`
  - Detects invalid types (functions, symbols)
  - Detects promise-like objects (with `then`, `catch`, `finally` properties)
  - Ensures body is Buffer or Uint8Array for binary data

- **Response**: Returns HTTP 400 Bad Request with clear error message instead of crashing

### 2. Error Handling Wrapper (`uploadxErrorHandler`)

Wrapped the `uploadx.upload` middleware with comprehensive error handling:

- **Location**: `server/controllers/api/videos/upload.ts`
- **Features**:
  - Validates request body before passing to uploadx
  - Catches any errors thrown by uploadx
  - Provides graceful error responses
  - Prevents response header conflicts

### 3. Enhanced uploadx Configuration

Added error handler to uploadx configuration:

- **Location**: `server/lib/uploadx.ts`
- **Features**:
  - `onError` callback logs errors with detailed context
  - Returns proper HTTP 500 response on internal errors
  - Prevents uncaught exceptions from propagating

### 4. Process-Level Error Handlers

Added global error handlers to prevent server crashes:

- **Location**: `server.ts`
- **Handlers**:
  - `unhandledRejection`: Logs promise rejections without crashing
  - `uncaughtException`: Catches upload-related exceptions and continues execution
  - Only exits process for non-upload critical errors

### 5. Test Cases

Added tests to verify the fix:

- **Location**: `server/tests/api/videos/resumable-upload.ts`
- **Tests**:
  - Malformed chunk data rejection (Promise objects)
  - Invalid content-range format rejection
  - Verifies server responds with HTTP 400 instead of crashing

## Files Modified

1. **server/controllers/api/videos/upload.ts**
   - Added `validateChunkData()` middleware
   - Added `uploadxErrorHandler()` middleware
   - Applied middlewares to upload-resumable routes

2. **server/lib/uploadx.ts**
   - Added `onError` handler to uploadx configuration
   - Added logging for upload errors

3. **server.ts**
   - Added `unhandledRejection` handler
   - Added `uncaughtException` handler with upload-specific logic

4. **server/tests/api/videos/resumable-upload.ts**
   - Added test for malformed chunk rejection
   - Added test for invalid content-range rejection

## How It Works

### Request Flow (Before Fix)
```
Client → uploadx.upload → [Exception] → Server Crash → Container Restart
```

### Request Flow (After Fix)
```
Client → validateChunkData → [Validation] → uploadxErrorHandler → uploadx.upload
                ↓ (invalid)                        ↓ (error)
           HTTP 400 Response                 HTTP 500 Response
```

### Error Escalation (After Fix)
```
1. Validation catches malformed data → HTTP 400
2. uploadx error → uploadxErrorHandler → HTTP 500
3. Unhandled exception → Process handler → Log & Continue (for upload errors)
4. Critical error → Exit gracefully
```

## Security Benefits

1. **DoS Prevention**: Malicious clients can no longer crash the server by sending invalid chunks
2. **Stability**: Server continues running even with malformed upload attempts
3. **Logging**: All malformed upload attempts are logged for security monitoring
4. **Graceful Degradation**: Users receive clear error messages instead of timeouts

## Testing

To test the fix:

```bash
# Run the new test cases
npm test -- server/tests/api/videos/resumable-upload.ts

# Manual test: Try uploading with invalid chunk
curl -X PUT "http://localhost:9000/api/v1/videos/upload-resumable?upload_id=test" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Range: invalid-format" \
  -H "Content-Type: video/mp4" \
  --data-binary "invalid-data"

# Expected: HTTP 400 response, server stays running
```

## Deployment Notes

- No database migrations required
- No configuration changes required
- Backward compatible with existing clients
- No performance impact on valid uploads
- Enhanced monitoring through error logs

## Future Improvements

1. Add rate limiting for failed upload attempts
2. Add metrics for malformed upload detection
3. Consider adding upload request validation at proxy level (Nginx)
4. Add automated alerting for repeated malformed upload attempts
