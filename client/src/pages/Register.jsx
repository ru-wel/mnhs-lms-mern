import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'
import styles from '../assets/styles/register.module.scss'
import axios from 'axios';

const Register = () => {
  const [userData, setUserData] = useState({ name: '', email: '', lrn: '', grlvl: '11', strand: 'STEM', password: '', });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateData = () => {
    const error = {};

    if (!userData.lrn || !/^\d{12}$/.test(userData.lrn)) {
      error.lrn = 'LRN must be exactly 12 numeric characters.';
    }

    if (!userData.password || userData.password.length < 8 || !/[A-Z]/.test(userData.password)) {
      error.password = 'Password must be at least 8 characters and include an uppercase letter.';
    }

    setErrors(error);
    return Object.keys(error).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value, });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (validateData()) {
      try {
        const response = await axios.post('http://localhost:3000/register', userData);
        alert('Registration successful! You can now log in.');
        setUserData({ name: '', email: '', lrn: '', grlvl: '11', strand: 'STEM', password: '', });
        navigate('/login');
      } 
      catch (err) {
        console.error(err);
        alert(err.response?.data?.message || 'Registration failed!');
      } 
      finally {
        setLoading(false);
      }
    } 
    else {
      console.log("Error with input validation:", errors);
      setLoading(false);
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <img src="/images/MNHS-Logo.png" alt="Logo" />
          <label htmlFor="name">Full Name
            <input type="text" name="name" value={userData.name} onChange={handleChange} required />
          </label>
          
          <label htmlFor="email">Email
            <input type="email" name="email" required value={userData.email} onChange={handleChange}/>
          </label>
          
          <label htmlFor="lrn">LRN
            <input type="text" name="lrn" required value={userData.lrn} onChange={handleChange} />
          </label>

          {errors.lrn && <p style={{ color: 'red' }}>{errors.lrn}</p>}

          <div className={styles.flex}>
            <label htmlFor="grlvl">Grade Level
              <select name="grlvl" value={userData.grlvl} onChange={handleChange}>
                <option value="11">11</option>
                <option value="12">12</option>
              </select>
            </label>

            <label htmlFor="strand">Strand
              <select name="strand" value={userData.strand} onChange={handleChange}>
                <option value="STEM">STEM</option>
                <option value="ABM">ABM</option>
                <option value="GAS">GAS</option>
              </select>
            </label>
          </div>

          <label htmlFor="password">Password
            <input type="password" name="password" required value={userData.password} onChange={handleChange} />
          </label>

          {errors.password && <p style={{ color: 'red' }}>{errors.password}</p>}
          <button type="submit" disabled={loading}>{loading ? 'Registering...' : 'Register'}</button>
        </form>
        <p className={styles.question}>Already have an account? <Link to="/login" className={styles.link}>Login</Link></p>
      </div>
    </main>
  );
};

export default Register