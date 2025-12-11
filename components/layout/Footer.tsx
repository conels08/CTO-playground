export default function Footer() {
  return (
    <footer className="border-t bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-gray-600">
          © {new Date().getFullYear()} CTO Playground. Built with Next.js and
          Tailwind CSS.
        </p>
      </div>
    </footer>
  );
}
