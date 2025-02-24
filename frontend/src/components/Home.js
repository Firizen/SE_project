import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-blue-300 py-12 px-6">
      <div className="bg-white bg-opacity-80 p-12 rounded-3xl shadow-2xl max-w-5xl w-full min-h-[550px] flex flex-col justify-center items-center backdrop-blur-lg">
        
        {/* Title */}
        <h1 className="text-5xl font-extrabold text-gray-900 font-serif text-center drop-shadow-lg">
          Student-Teacher Portal
        </h1>
        <div className="w-48 border-b-4 border-gray-700 mt-3 mb-10 rounded-lg"></div>

        {/* Grid for Student & Teacher sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full">
          
          {/* Student Section */}
          <div className="w-full bg-white bg-opacity-90 p-8 rounded-xl shadow-lg flex flex-col items-center transition-all transform hover:scale-105">
            <h2 className="text-3xl font-semibold text-gray-800 mb-5">Student</h2>
            <div className="flex flex-col space-y-4 w-full items-center">
               <Link to="/student/login">
                <button className="w-60 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-md">
                  Login
                </button>
              </Link>
              <Link to="/student/signup">
                <button className="w-60 py-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-all duration-300 shadow-md">
                  Signup
                </button>
              </Link>
            </div>
          </div>

          {/* Teacher Section */}
          <div className="w-full bg-white bg-opacity-90 p-8 rounded-xl shadow-lg flex flex-col items-center transition-all transform hover:scale-105">
            <h2 className="text-3xl font-semibold text-gray-800 mb-5">Teacher</h2>
            <div className="flex flex-col space-y-4 w-full items-center">
              <Link to="/teacher/login">
                <button className="w-60 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-md">
                  Login
                </button>
              </Link>
              <Link to="/teacher/signup">
                <button className="w-60 py-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-all duration-300 shadow-md">
                  Signup
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
