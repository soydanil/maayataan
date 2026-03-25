interface Env {
  AUDIO_BUCKET: R2Bucket;
  ALLOWED_ORIGINS: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['audio/webm', 'audio/ogg', 'audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/mp4'];

function corsHeaders(origin: string, allowedOrigins: string): HeadersInit {
  const origins = allowedOrigins.split(',').map((o) => o.trim());
  const isAllowed = origins.includes('*') || origins.includes(origin);
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : '',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get('Origin') || '';
    const headers = corsHeaders(origin, env.ALLOWED_ORIGINS);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers });
    }

    const url = new URL(request.url);

    // POST /upload-url — returns a unique key for the client to PUT to
    if (request.method === 'POST' && url.pathname === '/upload-url') {
      const body = await request.json<{ contentType?: string }>();
      const contentType = body.contentType || 'audio/webm';

      // Strip codec params (e.g. "audio/mp4;codecs=mp4a.40.2" → "audio/mp4")
      const baseType = contentType.split(';')[0].trim();
      if (!ALLOWED_TYPES.includes(baseType)) {
        return Response.json(
          { error: 'Tipo de audio no permitido' },
          { status: 400, headers }
        );
      }

      const key = `${crypto.randomUUID()}.${extensionFor(contentType)}`;
      const uploadUrl = `${url.origin}/upload/${key}`;
      const publicUrl = `${url.origin}/audio/${key}`;

      return Response.json({ uploadUrl, publicUrl, key }, { headers });
    }

    // PUT /upload/:key — direct upload to R2
    if (request.method === 'PUT' && url.pathname.startsWith('/upload/')) {
      const key = url.pathname.replace('/upload/', '');
      if (!key) {
        return Response.json({ error: 'Falta la clave del archivo' }, { status: 400, headers });
      }

      const contentLength = parseInt(request.headers.get('Content-Length') || '0');
      if (contentLength > MAX_FILE_SIZE) {
        return Response.json(
          { error: `Archivo demasiado grande. Máximo ${MAX_FILE_SIZE / 1024 / 1024}MB` },
          { status: 413, headers }
        );
      }

      const contentType = request.headers.get('Content-Type') || 'audio/webm';

      await env.AUDIO_BUCKET.put(key, request.body, {
        httpMetadata: { contentType },
      });

      return Response.json({ ok: true, key }, { status: 201, headers });
    }

    // GET /audio/:key — serve audio from R2
    if (request.method === 'GET' && url.pathname.startsWith('/audio/')) {
      const key = url.pathname.replace('/audio/', '');
      const object = await env.AUDIO_BUCKET.get(key);

      if (!object) {
        return new Response('Not found', { status: 404, headers });
      }

      return new Response(object.body, {
        headers: {
          ...headers,
          'Content-Type': object.httpMetadata?.contentType || 'audio/webm',
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }

    return new Response('Not found', { status: 404, headers });
  },
};

function extensionFor(contentType: string): string {
  const map: Record<string, string> = {
    'audio/webm': 'webm',
    'audio/ogg': 'ogg',
    'audio/mp3': 'mp3',
    'audio/mpeg': 'mp3',
    'audio/wav': 'wav',
    'audio/mp4': 'm4a',
  };
  return map[contentType] || 'webm';
}
