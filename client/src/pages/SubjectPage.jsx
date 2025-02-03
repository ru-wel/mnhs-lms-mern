import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from '../assets/styles/subjectPage.module.scss';
import axios from 'axios';
import Lenis from 'lenis'

const SubjectPage = () => {
  const [modules, setModules] = useState([]);
  const [name, setName] = useState(localStorage.getItem('name'));
  const [role, setRole] = useState(localStorage.getItem('User_Role'));
  const queryParams = new URLSearchParams(location.search);
  const subject = queryParams.get("subject");
  const [LRNUser, setLRNUser] = useState(localStorage.getItem('LRN'));
  const [showLogout, setShowLogout] = useState(false);
  const [isNavbarVisible, setIsNavbarVisible] = useState(false);

  useEffect(() => {
    const lenis = new Lenis();

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
  })

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/subject-page/?subject=${subject}`);
        setModules(response.data.modules);
      } 
      catch (err) {
        console.error("Error fetching module details:", err);
      }
    };
    fetchModules();
  }, [subject]);

  useEffect(() => {
    const handleStorageChange = () => {
      setName(localStorage.getItem('name'));
      setRole(localStorage.getItem('User_Role'));
    };
  
    window.addEventListener('storage', handleStorageChange);

    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setLRNUser(null);
    window.location.reload();
  };

  const handleLogoutToggle = () => {
    setShowLogout(prev => !prev);
  };

  const handleDownload = async (id) => {
    try {
      const response = await axios.get(`http://localhost:3000/download/${id}`, { responseType: 'blob' });

      const contentDisposition = response.headers['content-disposition'];
      if (contentDisposition) {
        const filename = contentDisposition.split('filename=')[1].replace(/"/g, '');
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } 
      else {
        alert('No file to download');
      }
    } 
    catch (err) {
      console.error('Download failed:', err);
      alert('Failed to download file');
    }
  };

  const toggleNavbar = () => {
    setIsNavbarVisible(prev => !prev);
  };

  const pageStyle = {
    backgroundColor: 'var(--dark-green)',
    height: '100vh'
  }

  return (
    <div className={styles.container} style={pageStyle}>
      <main className={styles.main}>
        <div className={styles.hamburger} onClick={toggleNavbar}>
          <i className="ri-menu-2-line"></i>
        </div>

        {isNavbarVisible && (
          <nav className={styles.new__navbar}>
            <Link to="/" className={styles.nav__link}><i className="ri-dashboard-2-fill"></i> Dashboard</Link>
            {role === "ADMIN" && <Link to="/admin-users" className={styles.nav__link}><i className="ri-user-settings-fill"></i> Admin Dashboard</Link>}
            <div className={styles.click__logout} onClick={handleLogoutToggle}>
              <p onClick={handleLogout}><i className="ri-logout-box-r-line"></i> Log Out</p>
            </div>
          </nav>
        )}
          
        <aside>
          <div className={styles.main__container}>
            <div className={styles.row}>
              <h1>MNHS-LMS</h1>
              <img src="/images/MNHS-Logo.png" alt="logo" width={60} height={60}/>
            </div>
            <nav className={styles.nav}>
              <Link to="/" className={styles.nav__link}><i className="ri-dashboard-2-fill"></i> Dashboard</Link>
              {role === "ADMIN" && <Link to="/admin-users" className={styles.nav__link}><i className="ri-user-settings-fill"></i> Admin Dashboard</Link>}
            </nav>
          </div>

          <div className={styles.profile__flex}>
            <div className={styles.profile}>
              <p className={styles.name}><i className="ri-user-line"></i>{name || 'Loading...'}</p> 
              <br />
            </div>
            <div className={styles.click__logout} onClick={handleLogoutToggle} style={{ position: 'relative' }}>
              <i className="ri-logout-box-line" onClick={handleLogout}></i>
            </div>
          </div>
        </aside>

        <div className={styles.container}>
          <div className={styles.dashboard}>
              <h1>Lessons</h1>
          </div>

          <div className={styles.table__container}>
            <table className={styles.table}> 
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>File</th>
                    <th>Date</th>
                    {/* <th className={styles.hide}>Progress</th> */}
                  </tr>
                </thead>
                <tbody>
                {modules.map((module, index) => (
                  <tr key={index}>
                    <td>{module.title}</td>
                    <td className={styles.file}>{module.file_name && (
                      module.file_name.startsWith("http://") || 
                      module.file_name.startsWith("https://")) ? (
                        <a className={styles.file__link} href={module.file_name} target="_blank" rel="noopener noreferrer">{module.file_name}</a>
                      ) : (
                        <p className={styles.file__link} onClick={() => handleDownload(module.MID, index)}>{module.file_name}</p>
                      )}
                    </td>
                    <td>{`${String(new Date(module.upload_date).getMonth() + 1).padStart(2, '0')}/${String(new Date(module.upload_date).getDate()).padStart(2, '0')}/${new Date(module.upload_date).getFullYear()}`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>    
    </div>
  )
}

export default SubjectPage