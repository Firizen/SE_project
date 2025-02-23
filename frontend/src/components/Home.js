import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-blue-200 py-12 px-6">
      <div className="bg-white p-12 rounded-xl shadow-lg max-w-6xl w-full min-h-[500px] flex flex-col justify-center items-center">

        <h1 className="text-5xl font-extrabold text-gray-800 font-serif text-center">
          Welcome to Student-Teacher Portal
        </h1>
        {/* Custom horizontal underline */}
        <div className="w-[500px] border-b-4 border-gray-600 mt-2 mb-10 rounded-xl"></div>


        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="w-full max-w-md bg-gray-100 p-8 rounded-xl shadow-md transition transform hover:scale-105">
            <h2 className="text-4xl font-semibold text-gray-700 mb-6 text-center">Student</h2>
            <div className="flex flex-col space-y-4">
              <Link to="/student/login">
                <button className="w-full py-4 px-5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition duration-300">
                  Student Login
                </button>
              </Link>
              <Link to="/student/signup">
                <button className="w-full py-4 px-5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition duration-300">
                  Student Signup
                </button>
              </Link>
            </div>
          </div>

          <div className="w-full max-w-md bg-gray-100 p-8 rounded-xl shadow-md transition transform hover:scale-105">
            <h2 className="text-4xl font-semibold text-gray-700 mb-6 text-center">Teacher</h2>
            <div className="flex flex-col space-y-4">
              <Link to="/teacher/login">
                <button className="w-full py-4 px-5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition duration-300">
                  Teacher Login
                </button>
              </Link>
              <Link to="/teacher/signup">
                <button className="w-full py-4 px-5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition duration-300">
                  Teacher Signup
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
