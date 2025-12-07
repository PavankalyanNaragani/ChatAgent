import axios from 'axios';
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosInstance';

const Register = () => {
  const [email, setEmail] = useState('');
  const [firstname, setFirstName] = useState('');
  const [lastname, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();

  const handleSubmit = async(e) =>{
    e.preventDefault();
    setLoading(true);

    const userData = {
      first_name : firstname,
      last_name : lastname,
      email : email,
      username : username,
      password : password
    }

    try{
      const response = await axios.post('http://127.0.0.1:8000/api/user/register/', userData)
      console.log('Registration Successful')
      setErrors({})
      navigate('/login')
    }catch(error){
      setErrors(error.response.data)
      console.error('Registration error:', error.response.data)
    }finally{
      setLoading(false)
    }
  }
  return (
    <form  onSubmit={handleSubmit}
      className="flex flex-col gap-4 m-auto items-start mt-15 p-8 py-12  w-full max-w-md  
      text-gray-500 rounded-lg shadow-xl border border-gray-200 bg-white"
    >

      <p className="text-2xl font-medium m-auto">
        <span className="text-purple-700">User Registration</span>
      </p>
        
      {/* First & Last Name Row */}
      <div className="grid grid-cols-2 gap-4 w-full">
        <div>
          <p>First Name</p>
          <input
            onChange={(e) => setFirstName(e.target.value)}
            value={firstname}
            placeholder="type here"
            className="border border-gray-200 rounded w-full p-2 mt-1 outline-purple-700"
            type="text"
            name='firstname'
            required
          />
          <small>{errors.firstname && <div className="text-red-500 text-sm mt-1">{errors.firstname}</div>}</small>
        </div>
        
        <div>
          <p>Last Name</p>
          <input
            onChange={(e) => setLastName(e.target.value)}
            value={lastname}
            placeholder="type here"
            className="border border-gray-200 rounded w-full p-2 mt-1 outline-purple-700"
            type="text"
            name='lastname'
            required
          />
          <small>{errors.lastname && <div className="text-red-500 text-sm mt-1">{errors.lastname}</div>}</small>
        </div>
      </div>
        
      <div className="w-full">
        <p>Username</p>
        <input
          onChange={(e) => setUsername(e.target.value)}
          value={username}
          placeholder="type here"
          className="border border-gray-200 rounded w-full p-2 mt-1 outline-purple-700"
          type="text"
          name='username'
          required
        />
        <small>{errors.username && <div className="text-red-500 text-sm mt-1">{errors.username}</div>}</small>
      </div>
        
      <div className="w-full">
        <p>Email</p>
        <input
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          placeholder="type here"
          className="border border-gray-200 rounded w-full p-2 mt-1 outline-purple-700"
          type="email"
          name='email'
          required
        />
        <small>{errors.email && <div className="text-red-500 text-sm mt-1">{errors.email}</div>}</small>
      </div>
        
      <div className="w-full">
        <p>Password</p>
        <input
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          placeholder="type here"
          className="border border-gray-200 rounded w-full p-2 mt-1 outline-purple-700"
          type="password"
          name='password'
          required
        />
        <small>{errors.password && <div className="text-red-500 text-sm mt-1">{errors.password}</div>}</small>
      </div>
      <div className="flex gap-1 items-center text-sm">
        <p>Already have an account?</p>
        <Link className="text-purple-700 cursor-pointer" to="/login">Login</Link>
      </div>

      <button
        type="submit"
        className="bg-purple-700 hover:bg-purple-800 transition-all text-white w-full py-2 rounded-md cursor-pointer"
      >
        { loading ?  'Loading...' : 'Register'} 
      </button>

    </form>

  )
}

export default Register