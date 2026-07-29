function Footer() {
  return (
    <footer className="bg-slate-900/80 backdrop-blur-md border-t border-white/10 py-6 text-center">
      <p className="text-slate-500 text-sm">
        © {new Date().getFullYear()} BookLocal — Local Service Booking Platform
      </p>
    </footer>
  );
}

export default Footer;
