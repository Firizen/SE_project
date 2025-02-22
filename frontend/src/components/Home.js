import { Link } from "react-router-dom";

function Home() {
  return (
    <div>
      <h1>Welcome to Student-Teacher Portal</h1>
      
      <div>
        <h2>Student</h2>
        <Link to="/student/login"><button>Student Login</button></Link>
        <Link to="/student/signup"><button>Student Signup</button></Link>
      </div>

      <div>
        <h2>Teacher</h2>
        <Link to="/teacher/login"><button>Teacher Login</button></Link>
        <Link to="/teacher/signup"><button>Teacher Signup</button></Link>
      </div>
    </div>
  );
}

export default Home;
