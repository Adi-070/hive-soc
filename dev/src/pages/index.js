// pages/index.js
import Link from "next/link";

export default function Home() {
  return (
    <div>
      <h1>Welcome to Our App</h1>
      <nav>
        <Link href="/login">Login</Link> | <Link href="/dashboard">Dashboard</Link>
      </nav>
    </div>
  );
}
