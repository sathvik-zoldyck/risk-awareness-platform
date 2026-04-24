export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-400 mb-8">Page not found</p>
        <a href="/" className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg">
          Back to Home
        </a>
      </div>
    </div>
  );
}
