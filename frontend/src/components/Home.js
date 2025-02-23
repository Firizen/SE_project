import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 py-8 px-4">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Welcome to Student-Teacher Portal</h1>

      <div className="w-full max-w-lg bg-white p-6 rounded-lg shadow-lg mb-6">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Student</h2>
        <div className="flex flex-col space-y-4">
          <Link to="/student/login">
            <button className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200">
              Student Login
            </button>
          </Link>
          <Link to="/student/signup">
            <button className="w-full py-2 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-200">
              Student Signup
            </button>
          </Link>
        </div>
      </div>

      <div className="w-full max-w-lg bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Teacher</h2>
        <div className="flex flex-col space-y-4">
          <Link to="/teacher/login">
            <button className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200">
              Teacher Login
            </button>
          </Link>
          <Link to="/teacher/signup">
            <button className="w-full py-2 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-200">
              Teacher Signup
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home;
