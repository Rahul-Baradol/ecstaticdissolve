import { FaGithub } from "react-icons/fa";
import Link from "next/link";

export default function GitHubFloatButton() {
  return (
    <Link
      href="https://github.com/Rahul-Baradol/ecstaticdissolve"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-4 right-4 z-50 bg-black text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:bg-gray-800 transition"
    >
      <FaGithub size={24} />
    </Link>
  );
}