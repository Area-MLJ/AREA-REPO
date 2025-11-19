import { verifyToken } from '../lib/auth.js';

function withAuth(handler) {
  return async (request, context) => {
    try {
      const authHeader = request.headers.get('authorization');
      if (!authHeader) {
        return Response.json({error: "Unauthorized"}, {status: 401});
      }
      
      const token = authHeader.split(' ')[1];
      const user = verifyToken(token);
      
      return handler(request, context, user);
    } catch (error) {
      return Response.json({error: "Unauthorized"}, {status: 401});
    }
  };
}

export { withAuth };