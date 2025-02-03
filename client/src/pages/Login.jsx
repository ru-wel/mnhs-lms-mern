import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from '../assets/styles/login.module.scss';
import axios from 'axios';

const Login = () => {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
  
    try {
      const response = await axios.post('http://localhost:3000/login', { emailOrUsername, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('Email', response.data.username);
      localStorage.setItem('LRN', response.data.userID);
      localStorage.setItem('User_Role', response.data.userRole);
      localStorage.setItem('Strand', response.data.strand);
      localStorage.setItem('id', response.data.id);
      localStorage.setItem('name', response.data.name);

      if (response.data.userRole === "ADMIN"){
        navigate('/admin-users');
      } 
      else { 
        navigate('/'); 
      }
    } 
    catch (error) {
      console.error('Login failed:', error.response?.data || error.message);
      setErrorMessage(error.response?.data?.message || 'Login failed! Please try again.');
    }
  };
  
  const handleEmailOrUsernameChange = (e) => {
    setEmailOrUsername(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <form onSubmit={handleSubmit}>
          <img src="/images/MNHS-Logo.png" alt="Logo" />
          <label htmlFor="email">Email
            <input type="email" name="email" value={emailOrUsername}onChange={handleEmailOrUsernameChange} />
          </label>
          
          <label htmlFor="password">Password
            <input type="password" name="password" value={password}onChange={handlePasswordChange} />
          </label>

          {errors && <p style={{ color: 'red' }}>{errors}</p>}
          <button type="submit">Login</button>
        </form>
        <p>Don&apos;t have an account? <Link to="/Register" className={styles.link}>Register</Link></p>
      </div>
    </main>
  );
};

export default Login;
