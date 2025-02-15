import { useStateContext } from "../contexts/contextprovider";
import { Navigate, Outlet } from "react-router-dom";
 import '../assets/css/argon-dashboard.css';
 import '../assets/css/argon-dashboard.min.css';

export default function GuestLayout(){
    const {token} = useStateContext();
    if(token){
       return <Navigate to='/c'/>
    }

    return(
        <>

            <Outlet />
        </>
    )
}