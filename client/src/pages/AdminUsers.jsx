import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import styles from '../assets/styles/adminUsers.module.scss'
import axios from 'axios';

const AdminUsers = () => {
  const [query, setQuery] = useState('');
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState(localStorage.getItem('name'));
  const [role, setRole] = useState(localStorage.getItem('User_Role'));
  const [grlvl, setGrlvl] = useState('11');
  const [strand, setStrand] = useState('STEM');
  const [type, setType] = useState('Core');
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState('');
  const [isLinkUpload, setIsLinkUpload] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeUserIndex, setActiveUserIndex] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editUser, setEditUser] = useState({ name: '', lrn: '', email: '', grlvl: '', strand: '', user_role: '', password: '' });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const usersPerPage = 8;
  const [errors, setErrors] = useState({});
  const [addUserModalOpen, setAddUserModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', grlvl: '11', strand: 'STEM' });
  const [isNavbarOpen, setNavbarOpen] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen(!isDropdownOpen);
  };

  const toggleModal = () => {
    setModalOpen(!isModalOpen);
  };

  const toggleUserDropdown = (index) => {
    setActiveUserIndex(activeUserIndex === index ? null : index);
  };

  const toggleNavbar = () => {
    setNavbarOpen(!isNavbarOpen);
  };

  useEffect(() => {
    const handleStorageChange = () => {
      setName(localStorage.getItem('name'));
      setRole(localStorage.getItem('User_Role'));
    };
  
    window.addEventListener('storage', handleStorageChange);
  
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}-${day}-${year}`;
  };

  const validateData = (type, data) => {
    const error = {};
  
    if (type === 'module') {
      if (!data.title || data.title.length > 100) {
        error.title = 'Title is required and should be less than 100 characters.';
      }
  
      if (!data.subject || data.subject.length > 100) {
        error.subject = 'Subject is required and should be less than 100 characters.';
      }

      if (data.file) {
        const allowedExtensions = ['.pdf', '.docx', '.txt', '.pptx', '.jpg', '.jpeg', '.png', '.xlsx', '.xls'];
        const fileExtension = data.file.name.split('.').pop();
        if (!allowedExtensions.includes(`.${fileExtension}`)) {
          error.file = 'Invalid file type.';
        }
      } 
    } 

    else if (type === 'user') {
      if (!data.lrn || !/^\d{12}$/.test(data.lrn)) {
        error.lrn = 'LRN must be exactly 12 numeric characters.';
      }
    
      if (!data.password || data.password.length < 8 || !/[A-Z]/.test(data.password)) {
        error.password = 'Password must be at least 8 characters and include an uppercase letter.';
      }
    }

    else if (type === 'admin') {    
      if (!data.password || data.password.length < 8 || !/[A-Z]/.test(data.password)) {
        error.password = 'Password must be at least 8 characters and include an uppercase letter.';
      }
    }
  
    return error;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const uploader = localStorage.getItem("Email");
    const currentDate = new Date().toISOString();
    const formData = new FormData();

    formData.append('grlvl', grlvl);
    formData.append('strand', strand);
    formData.append('type', type);
    formData.append('title', title);
    formData.append('subject', subject);
    formData.append('date', formatDate(currentDate));
    formData.append('uploader', uploader);
    
    if (isLinkUpload) {
      formData.append('url', url);
    } else {
      formData.append('file', file);
    }

    const error = validateData('module', { title, subject, file }); // check file
    setErrors(error);
    
    if (Object.keys(error).length === 0) {
      try {
        const response = await axios.post('http://localhost:3000/admin-modules', formData, { headers: { 'Content-Type': 'multipart/form-data' }});
        alert('Module successfully uploaded!.');
      } catch (err) {
        console.error(err);
        alert(err.response?.data?.message || 'Upload failed!');
      } finally {
        setLoading(false);
      }
    }

    //reset
    setGrlvl('11');
    setStrand('STEM');
    setType('Core');
    setTitle('');
    setSubject('');
    setFile(null);
    setUrl('');
    
    toggleModal();
  };

  const handleEdit = (user) => {
    setEditUser(user);
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const id = editUser.UID;
    const role = editUser.user_role;
    let error = '';

    if (role === "ADMIN"){
      error = validateData('admin', editUser);
      setErrors(error);
    } else {
      error = validateData('user', editUser);
      setErrors(error);
    }

    if (Object.keys(error).length === 0) {
      try {
        const response = await axios.put(`http://localhost:3000/admin-users/edit/${id}`, editUser);
        alert('User details updated successfully!');
        setEditModalOpen(false); 
        setUsers(users.map(user => (user.UID === id ? editUser : user)));
      } catch (error) {
        console.error('Error updating user:', error);
        alert(error.response?.data?.message || 'Failed to update user details.');
      }
    }
  };

  const handleDelete = (user) => {
    setUserToDelete(user);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const id = userToDelete.UID;
      const response = await axios.delete(`http://localhost:3000/admin-users/delete/${id}`);
      setDeleteModalOpen(false);
      setUsers((users) => users.filter((user) => user.UID !== id));
    } catch (error){
      console.log(error);
      alert(err.response?.data?.messsage || 'Delete failed!');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setLRNUser(null);
    window.location.reload();
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
  };

  const handleAddUserSubmit = async (e) => {
    e.preventDefault();
    const error = validateData('admin', newUser);
    setErrors(error);

    if (Object.keys(error).length === 0) {
      try {
        const response = await axios.post('http://localhost:3000/admin-users/add', newUser);
        alert('User successfully added!');
        const newAdmin = response.data.newAdmin;
        setUsers([...users, newAdmin]);
        setAddUserModalOpen(false);
      } catch (error) {
        console.error('Error adding user:', error);
        alert(error.response?.data?.message || 'Failed to add user.');
      }
    }

    setNewUser({ name: '', email: '', password: '', grlvl: '11', strand: 'STEM' });
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:3000/admin-users');
        const data = await response.json();
        setUsers(data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch users', error);
        setLoading(false); 
      }
    };
    fetchUsers();
  }, []);

  if (loading) {
    return <p>Loading users...</p>;
  }
  const filterUsers = users.filter((user) =>{
    const lowQ = query.toLowerCase();
    const name = user.name ? user.name.toString().toLowerCase() : '';
    const lrn = user.lrn ? user.lrn.toString().toLowerCase() : '';
    const email = user.email ? user.email.toString().toLowerCase() : '';
    const grlvl = user.grlvl ? user.grlvl.toString().toLowerCase() : '';
    const strand = user.strand ? user.strand.toString().toLowerCase() : '';
    const user_role = user.user_role ? user.user_role.toString().toLowerCase() : '';
    const created_at = user.created_at ? user.created_at.toString().toLowerCase() : '';

    return(
      name.includes(lowQ) || lrn.includes(lowQ) || email.includes(lowQ) || grlvl.includes(lowQ) || strand.includes(lowQ) || user_role.includes(lowQ) || created_at.includes(lowQ)
    );
  });
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filterUsers.slice(indexOfFirstUser, indexOfLastUser);

  const handleNext = () => {
    const totalPages = Math.ceil(filterUsers.length / usersPerPage);
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <main className={styles.main}>
      <aside>
        <div className={styles.main__container}>
          <div className={styles.row}>
            <h1>MNHS-LMS</h1>
            <img src="/images/MNHS-Logo.png" alt="logo" width={60} height={60}/>
          </div>
          <nav className={styles.nav}>
            <Link to="/" className={styles.nav__link}><i className="ri-dashboard-2-fill"></i> Dashboard</Link>
            {role === "ADMIN" &&<Link to="/admin-users" className={styles.nav__link}><i className="ri-user-settings-fill"></i> Admin Dashboard</Link>}
          </nav>
        </div>

        <div className={styles.profile__flex}>
          <div className={styles.profile}>
            <p className={styles.name}><i className="ri-user-line"></i>{name || 'Loading...'}</p> 
            <br />
          </div>
        </div>
      </aside>

      <div className={styles.container}>
        <section className={styles.upper}>
          <h1>Admin Dashboard <i className="ri-arrow-right-wide-line"></i>Users</h1>
          <button className={styles.hamburger} onClick={toggleNavbar}>
            <i className="ri-menu-2-line"></i>
          </button>
          
          <div className={styles.search__wrapper}>
            <i className="ri-search-line"></i>
            <input type="text" placeholder="Search..." value={query} onChange={(e) => setQuery(e.target.value)}/>
          </div>

          <div className={styles.user} onClick={toggleDropdown}> 
            <i className="ri-user-fill"></i>
            {isDropdownOpen && (
              <div className={styles.dropdown}>
                <Link onClick={handleLogout}>Logout</Link>
              </div>
            )}
          </div>
        </section>

        {isNavbarOpen && (
          <nav className={styles.mobile__nav}>
            <i onClick={toggleNavbar} className="ri-close-large-line"></i>
            <Link to="/" className={styles.nav__link}><i className="ri-dashboard-2-fill"></i> Dashboard</Link>
            {role === "ADMIN" && <Link to="/admin-users" className={styles.nav__link}><i className="ri-user-settings-fill"></i> Admin Dashboard</Link>}
          </nav>
        )}

        <section className={styles.lower}>
          <div className={styles.links}>
            <Link className={styles.a} to="/admin-users">Users</Link>
            <Link className={styles.a} to="/admin-modules">Modules</Link>
          </div>
          <button onClick={() => setAddUserModalOpen(true)}><i className="ri-add-circle-line"></i>Add Admin</button>
        </section>

        {isModalOpen && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <h2>Add Module</h2>
              <form onSubmit={handleSubmit}>
                <select value={grlvl} onChange={(e) => setGrlvl(e.target.value)} required>
                  <option value="11">11</option>
                  <option value="12">12</option>
                </select>
                <select required value={strand} onChange={(e) => setStrand(e.target.value)}>
                  <option value="STEM">STEM</option>
                  <option value="ABM">ABM</option>
                  <option value="GAS">GAS</option>
                </select>
                <select required value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="Core">Core</option>
                  <option value="Applied">Applied</option>
                  <option value="Specialized">Specialized</option>
                </select>
                <input type="text" placeholder="Subject" required value={subject} onChange={(e) => setSubject(e.target.value)} />
                <input type="text" placeholder="Title" required value={title} onChange={(e) => setTitle(e.target.value)} />
                <label><input type="radio" name="uploadType" checked={!isLinkUpload} onChange={() => setIsLinkUpload(false)} />Upload a File</label>
                <label><input type="radio" name="uploadType" checked={isLinkUpload} onChange={() => setIsLinkUpload(true)}/>Upload a Link </label>
              {!isLinkUpload && (<input type="file" name="file" onChange={(e) => setFile(e.target.files[0])} required />)}
              {isLinkUpload && (<input type="url" placeholder="Enter URL" value={url} onChange={(e) => setUrl(e.target.value)} required/>)}
                <button type="submit">Submit</button>
                <button type="button" onClick={toggleModal}>Cancel</button>
              </form>
            </div>
          </div>
        )}

        {editModalOpen && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <h2>Edit User</h2>
              {errors.lrn && <p style={{ color: 'red' }}>{errors.lrn}</p>}
              {errors.password && <p style={{ color: 'red' }}>{errors.password}</p>}
              <form onSubmit={handleEditSubmit}>
                <input type="text" placeholder="name" value={editUser.name} onChange={(e) => setEditUser({ ...editUser, name: e.target.value })} required />
                <input type="text" placeholder="LRN" value={editUser.lrn} onChange={(e) => setEditUser({ ...editUser, lrn: e.target.value })} required />
                <input type="email" placeholder="Email" value={editUser.email} onChange={(e) => setEditUser({ ...editUser, email: e.target.value })} required />
                <select value={editUser.grlvl} onChange={(e) => setEditUser({ ...editUser, grlvl: e.target.value })} required >
                  <option value="11">11</option>
                  <option value="12">12</option>
                </select>
                <select required value={editUser.strand} onChange={(e) => setEditUser({ ...editUser, strand: e.target.value })}>
                  <option value="STEM">STEM</option>
                  <option value="ABM">ABM</option>
                  <option value="GAS">GAS</option>
                </select>
                <select required value={editUser.user_role} onChange={(e) => setEditUser({ ...editUser, user_role: e.target.value })}>
                  <option value="ADMIN">ADMIN</option>
                  <option value="STUDENT">STUDENT</option>
                  <option value="IRREG">IRREG</option>
                </select>
                <input type="password" placeholder="Password" value={editUser.password} onChange={(e) => setEditUser({ ...editUser, password: e.target.value })} required />
                <div>
                  <button type="submit">Save</button>
                  <button type="button" onClick={() => setEditModalOpen(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {deleteModalOpen && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <h2>Confirm Deletion</h2>
              <p>Are you sure you want to delete this user?</p>
              <div>
                <button onClick={confirmDelete}>Yes</button>
                <button onClick={cancelDelete}>No</button>
              </div>
            </div>
          </div>
        )}

        {addUserModalOpen && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <h2>Add Admin</h2>
              {errors.password && <p style={{ color: 'red' }}>{errors.password}</p>}
              <form onSubmit={handleAddUserSubmit}>
                <input type="text" placeholder="Full Name" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} required />
                <input type="email" placeholder="Email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} required />
                <input type="password" placeholder="Password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} required />
                <select value={newUser.grlvl} onChange={(e) => setNewUser({ ...newUser, grlvl: e.target.value })} required >
                  <option value="11">11</option>
                  <option value="12">12</option>
                </select>
                <select value={newUser.strand} onChange={(e) => setNewUser({ ...newUser, strand: e.target.value })} required >
                  <option value="STEM">STEM</option>
                  <option value="ABM">ABM</option>
                  <option value="GAS">GAS</option>
                </select>
                <div>
                  <button type="submit">Add Admin</button>
                  <button type="button" onClick={() => setAddUserModalOpen(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className={styles.table__container}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.hidden}>Name</th>
                <th>LRN</th>
                <th className={styles.hidden}>Email</th>
                <th className={styles.hidden}>Strand</th>
                <th className={`${styles.hidden} ${styles.role}`}>Role</th>
                <th className={`${styles.role}`}>Created at</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map((user, index) => (
                <tr key={index}>
                  <td className={styles.hidden}>{user.name}</td> 
                  <td>{user.lrn}</td>
                  <td className={styles.hidden}>{user.email}</td>
                  <td className={styles.hidden}>{`${user.grlvl} - ${user.strand}`}</td>
                  <td className={`${styles.hidden} ${styles.role}`}>{user.user_role}</td>
                  <td className={styles.role}>{formatDate(user.created_at)}</td>
                  <td>
                    <div onClick={() => toggleUserDropdown(index)}>
                      <img src="/images/threedot.svg" alt="Three Dots" className={styles.three__dots} width={15} height={20} />
                    </div>
                    {activeUserIndex === index && (
                      <div className={styles.dropdown}>
                        <div className={styles.dropdown__item} onClick={() => handleEdit(user)}>Edit</div>
                        <div className={styles.dropdown__item} onClick={() => handleDelete(user)}>Delete</div>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className={styles.pagination}>
            <p>Showing <span>{indexOfFirstUser + 1} - {Math.min(indexOfLastUser, users.length)}</span> of <span>{users.length} Users</span></p>
            <div>
              <button onClick={handlePrevious} disabled={currentPage === 1}><i className="ri-arrow-left-s-fill"></i>Prev</button>
              <span>Page {currentPage} of {Math.ceil(users.length / usersPerPage)}</span>
              <button onClick={handleNext} disabled={currentPage === Math.ceil(users.length / usersPerPage)}>Next<i className="ri-arrow-right-s-fill"></i></button>
            </div>
          </div>
        </div>
        
      </div>
    </main>
  )
}

export default AdminUsers