export default function Footer() {
  return (
    <footer className="border-t border-border py-6 mt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-primary flex items-center justify-center font-bold text-white text-xs">M</div>
          <span className="text-sm font-semibold">Movie<span className="text-primary">Watch</span></span>
          <span className="text-xs text-gray-600 ml-2">© 2026</span>
        </div>
        <div className="flex gap-6 text-sm text-gray-500">
          <a href="#" className="hover:text-gray-300 transition">Privacy</a>
          <a href="#" className="hover:text-gray-300 transition">Terms</a>
          <a href="#" className="hover:text-gray-300 transition">API</a>
          <span className="text-gray-600">Powered by TMDB</span>
        </div>
      </div>
    </footer>
  );
}