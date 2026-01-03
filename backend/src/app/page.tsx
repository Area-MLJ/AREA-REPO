export default function Home() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>AREA Platform Backend</h1>
      <p>API Server is running on port 8080</p>
      <p>
        <a href="/about.json">/about.json</a> - Service information
      </p>
    </main>
  );
}

