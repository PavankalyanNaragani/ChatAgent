import React, { use, useState } from 'react'
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    
    const navigate = useNavigate();

    const handleSubmit = async(e) =>{
        e.preventDefault();
        setErrors({});
        setLoading(true);

        const userData = {email, password}
        console.log('userData==>', userData);

        try{
            const response = await axios.post('http://127.0.0.1:8000/api/token/',  {
                email: userData.email,
                password: userData.password
            });
            localStorage.setItem('accessToken', response.data.access)
            localStorage.setItem('refreshToken', response.data.refresh)
            console.log('Login successful');
            navigate('/')
        }catch(error){
            console.error("Invalid credentials")
            setErrors('Invalid credentials')
        }finally{
            setLoading(false)
        }
    }


  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 m-auto mt-25 items-start p-8 py-12 w-80 sm:w-[352px] text-gray-500 rounded-lg shadow-xl border border-gray-200 bg-white">
        <p className="text-2xl font-medium m-auto">
            <span className="text-purple-700">User Login</span>
        </p>
        <div className="w-full ">
            <p>Email</p>
            <input onChange={(e) => setEmail(e.target.value)} value={email} placeholder="type here" className="border border-gray-200 rounded w-full p-2 mt-1 outline-purple-700" type="email" required />
            <small>{errors.email && <div className="text-red-500 text-sm mt-1">{errors.email}</div>}</small>
        </div>
        <div className="w-full ">
            <p>Password</p>
            <input onChange={(e) => setPassword(e.target.value)} value={password} placeholder="type here" className="border border-gray-200 rounded w-full p-2 mt-1 outline-purple-700" type="password" required />
            <small>{errors.password && <div className="text-red-500 text-sm mt-1">{errors.password}</div>}</small>
        </div>
        <div className="flex gap-1 items-center text-sm">
            <p>Don't have an account?</p>
            <Link className="text-purple-700 cursor-pointer" to="/register">Register</Link>
        </div>
            <button type='submit' className="bg-purple-700 hover:bg-purple-800 transition-all text-white w-full py-2 rounded-md cursor-pointer">
               { loading ?  'Loading...' : 'Login'} 
        </button>
    </form>
  )
}

export default Login