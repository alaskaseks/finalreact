import { Link } from "react-router-dom";
import { linkClass } from "../components/ui";

function NotFoundPage(){
    return(
        <div>
            <h2 className="text-2xl font-bold mb-4">404 - Page not found</h2>
            <Link to="/requests" className={linkClass}>Go to requests</Link>
        </div>
    )
}

export default NotFoundPage;
