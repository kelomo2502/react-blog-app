import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { auth } from "./firebase/firebaseConfig";
import { onAuthStateChanged, signOut, User } from "firebase/auth";

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ✅ Navigation Bar */}
      <nav className="p-4 bg-blue-600 text-white flex gap-4">
        <Link to="/" className="hover:underline">Home</Link>

        {user ? (
          <>
            <Link to="/dashboard" className="hover:underline">Dashboard</Link>
            <Link to="/profile" className="hover:underline">Profile</Link>
            <button
              onClick={handleLogout}
              className="bg-red-500 px-4 py-2 rounded hover:bg-red-700"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:underline">Login</Link>
            <Link to="/signup" className="hover:underline">Signup</Link>
          </>
        )}
      </nav>

      <div className="p-4">
        <AppRoutes />
      </div>
    </div>
  );
};

export default App;
