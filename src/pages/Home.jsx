import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl mb-4">דף הבית</h1>
      <ul className="space-y-2">
        <li>
          <Link to="/profile" className="text-blue-500">
            פרטים אישיים
          </Link>
        </li>
        <li>
          <Link to="/membership" className="text-blue-500">
            רכישת מנוי
          </Link>
        </li>
        <li>
          <Link to="/workout" className="text-blue-500">
            הזמנת אימון
          </Link>
        </li>
        <li>
          <Link to="/workoutdetails" className="text-blue-500">
            נתוני אימון
          </Link>
        </li>
      </ul>
    </div>
  );
}

export default Home;
