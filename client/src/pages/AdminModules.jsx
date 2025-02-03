import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import styles from '../assets/styles/adminModules.module.scss'
import axios from 'axios';

const AdminModules = () => {
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
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeUserIndex, setActiveUserIndex] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [moduleToEdit, setModuleToEdit] = useState(null);
  const [moduleToDelete, setModuleToDelete] = useState(null);
  const [errors, setErrors] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const modulesPerPage = 8;
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

  const handleLogout = () => {
    localStorage.clear();
    setLRNUser(null);
    window.location.reload();
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

  const validateModuleData = (module) => {
    const error = {};
  
    if (!module.title || module.title.length > 100) {
      error.title = 'Title is required and should be less than 100 characters.';
    }
  
    if (!module.subject || module.subject.length > 100) {
      error.subject = 'Subject is required and should be less than 100 characters.';
    }

    if (module.file) {
      const allowedExtensions = ['.pdf', '.docx', '.txt', '.pptx', '.jpg', '.jpeg', '.png', '.xlsx', '.xls'];
      const fileExtension = module.file.name.split('.').pop();
      if (!allowedExtensions.includes(`.${fileExtension}`)) {
        error.file = 'Invalid file type.';
      }
    } 

    return error;
  };

  const validateData = () => {
    const error = validateModuleData({ title, subject, file });
    setErrors(error);
    return Object.keys(error).length === 0;
  };

  const validateEditData = () => {
    const error = validateModuleData(moduleToEdit);
    setErrors(error);
    return Object.keys(error).length === 0;
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
    } 
    else {
      formData.append('file', file);
    }
  
    if (validateData()) {
      try {
        const response = await axios.post('http://localhost:3000/admin-modules', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        alert('Module successfully uploaded!');
        const addedModule = response.data.newModule;
        setModules([...modules, addedModule]);
      } 
      catch (err) {
        console.error(err);
        alert(err.response?.data?.message || 'Upload failed!');
      } 
      finally {
        setLoading(false);
      }
    } 
    else {
      console.log("Error with input validation:", errors);
      setLoading(false);
    }
  
    setGrlvl('11');
    setStrand('STEM');
    setType('Core');
    setTitle('');
    setSubject('');
    setFile(null);
    setUrl('');
    toggleModal();
  };
  
  useEffect(() => {
    const fetchModules = async () => {
      try {
        const response = await fetch('http://localhost:3000/admin-modules');
        const data = await response.json();
        setModules(data);
        setLoading(false);
      } 
      catch (error) {
        console.error('Failed to fetch modules', error);
        setLoading(false); 
      }
    };
    fetchModules();
  }, []);

  if (loading) {
    return <p>Loading modules...</p>;
  }

  const filterModules = modules.filter((module) =>{
    const lowQ = query.toLowerCase();
    const grlvl = module.grlvl ? module.grlvl.toString().toLowerCase() : '';
    const strand = module.strand ? module.strand.toString().toLowerCase() : '';
    const type = module.type ? module.type.toString().toLowerCase() : '';
    const title = module.title ? module.title.toString().toLowerCase() : '';
    const subject = module.subject ? module.subject.toString().toLowerCase() : '';
    const date = module.upload_date ? module.upload_date.toString().toLowerCase() : '';
    const uploader = module.uploader ? module.uploader.toString().toLowerCase() : '';
    return(
      grlvl.includes(lowQ) || strand.includes(lowQ) || type.includes(lowQ) || title.includes(lowQ) || subject.includes(lowQ) || date.includes(lowQ) || uploader.includes(lowQ)
    );
  });

  const indexOfLastModule = currentPage * modulesPerPage;
  const indexOfFirstModule = indexOfLastModule - modulesPerPage;
  const currentModules = filterModules.slice(indexOfFirstModule, indexOfLastModule);

  const handleNext = () => {
    const totalPages = Math.ceil(filterModules.length / modulesPerPage);
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  const handleDownload = async (id) => {
    try {
      const response = await axios.get(`http://localhost:3000/admin-modules/download/${id}`, {
        responseType: 'blob', 
      });

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
      } else {
        alert('No file to download');
      }
    } catch (err) {
      console.error('Download failed:', err);
      alert('Failed to download file');
    }
  };

  const handleEdit = (module) => {
    setModuleToEdit(module);
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const id = moduleToEdit.MID;
    const formData = new FormData();
  
    formData.append('grlvl', moduleToEdit.grlvl);
    formData.append('strand', moduleToEdit.strand);
    formData.append('type', moduleToEdit.type);
    formData.append('subject', moduleToEdit.subject);
    formData.append('title', moduleToEdit.title);
  
    if (isLinkUpload) {
      formData.append('file_name', moduleToEdit.url);
      formData.append('file_data', null);
    } else {
      formData.append('file', moduleToEdit.file);
    }
  
    if (validateEditData()) {
      try {
        const response = await axios.put(`http://localhost:3000/admin-modules/edit/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' }});
        alert('Module successfully updated!');
        setModules(
          modules.map((module) =>
            module.MID === id ? { ...module, ...moduleToEdit } : module
          )
        );
      } catch (err) {
        console.error(err);
        alert(err.response?.data?.message || 'Update failed!');
      }
    } else {
      console.log("Error with input validation:", errors);
    }
  
    setEditModalOpen(false);
  };

  const handleDelete = (module) => {
    setModuleToDelete(module);
    setDeleteModalOpen(true);
  };
  const confirmDelete = async () => {
    try {
      const id = moduleToDelete.MID;
      const response = await axios.delete(`http://localhost:3000/admin-modules/delete/${id}`);
      setDeleteModalOpen(false);
      setModules(modules.filter(module => module.MID !== id));
    } catch (error){
      console.log(error);
      alert(error.response?.data?.messsage || 'Delete failed!');
    }
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
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
          <h1>Admin Dashboard <i className="ri-arrow-right-wide-line"></i>Modules</h1>
          <button className={styles.hamburger} onClick={toggleNavbar}>
            <i className="ri-menu-2-line"></i>
          </button>

          <div className={styles.search__wrapper}>
            <i className="ri-search-line"></i>
            <input type="text" placeholder="Search..." value={query} onChange={(e) => setQuery(e.target.value)}/>
          </div>

          <div className={styles.user} onClick={toggleDropdown}> 
            <i className="ri-user-line"></i>
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
          <button onClick={toggleModal}><i className="ri-add-circle-line"></i>Add Modules</button>
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
              <label>
                <input type="radio" name="uploadType" checked={!isLinkUpload} onChange={() => setIsLinkUpload(false)} />Upload a File
              </label>
              <label>
                <input type="radio" name="uploadType" checked={isLinkUpload} onChange={() => setIsLinkUpload(true)}/>Upload a Link 
              </label>
              {!isLinkUpload && (
                <input className={styles.file__upload} type="file" name="file" onChange={(e) => setFile(e.target.files[0])} required />
              )}
              {isLinkUpload && (
                <input type="url" placeholder="Enter URL" value={url} onChange={(e) => setUrl(e.target.value)} required/>
              )}
              <button type="submit">Submit</button>
              <button type="button" onClick={toggleModal}>Cancel</button>
            </form>
            </div>
          </div>
        )}

        {errors.file && <p style={{ color: 'red' }}>{errors.file}</p>}

        {editModalOpen && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <h2>Edit Module</h2>
              <form onSubmit={handleEditSubmit}>
                <select value={moduleToEdit.grlvl || ''} onChange={(e) => setModuleToEdit({ ...moduleToEdit, grlvl: e.target.value })} required>
                  <option value="11">11</option>
                  <option value="12">12</option>
                </select>
                <select value={moduleToEdit.strand || ''} onChange={(e) => setModuleToEdit({ ...moduleToEdit, strand: e.target.value })} required>
                  <option value="STEM">STEM</option>
                  <option value="ABM">ABM</option>
                  <option value="GAS">GAS</option>
                </select>
                <select value={moduleToEdit.type || ''} onChange={(e) => setModuleToEdit({ ...moduleToEdit, type: e.target.value })} required>
                  <option value="Core">Core</option>
                  <option value="Applied">Applied</option>
                  <option value="Specialized">Specialized</option>
                </select>
                <input type="text" placeholder="Subject" required value={moduleToEdit.subject || ''} onChange={(e) => setModuleToEdit({ ...moduleToEdit, subject: e.target.value })}/>
                <input type="text" placeholder="Title" required value={moduleToEdit.title || ''} onChange={(e) => setModuleToEdit({ ...moduleToEdit, title: e.target.value })}/>
                <label><input type="radio" name="uploadType" checked={!isLinkUpload} onChange={() => setIsLinkUpload(false)}/>Upload a File</label>
                <label><input type="radio" name="uploadType" checked={isLinkUpload}onChange={() => setIsLinkUpload(true)}/>Upload a Link</label>
                {!isLinkUpload && (
                  <input className={styles.file__upload} type="file" name="file" onChange={(e) => setFile(e.target.files[0])} />
                )}
                {isLinkUpload && (
                  <input type="url" placeholder="Enter URL" value={moduleToEdit.file_name || ''} onChange={(e) => setModuleToEdit({ ...moduleToEdit, url: e.target.value })}/>
                )}
                <button type="submit">Submit</button>
                <button type="button" onClick={() => setEditModalOpen(false)}>Cancel</button>
              </form>

            </div>
          </div>
        )}

        {deleteModalOpen && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <h2>Confirm Deletion</h2>
              <p>Are you sure you want to delete this module?</p>
              <div>
                <button onClick={confirmDelete}>Yes</button>
                <button onClick={cancelDelete}>No</button>
              </div>
            </div>
          </div>
        )}

        <div className={styles.table__container}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.hidden}>Strand</th>
                <th className={styles.hidden}>Type</th>
                <th className={styles.hidden}>Subject</th>
                <th className={styles.hidden}>Title</th>
                <th>File</th>
                <th className={`${styles.hidden} ${styles.role}`}>Uploader</th>
                <th className={styles.hidden}>Created At</th>
              </tr>
            </thead>  
            <tbody>
              {currentModules.map((module, index) => (
                <tr key={index}>
                  <td className={styles.hidden}>{`${module.grlvl} - ${module.strand}`}</td>
                  <td className={styles.hidden}>{module.type}</td>
                  <td className={styles.hidden}>{module.subject}</td>
                  <td className={styles.hidden}>{module.title}</td>
                  <td>{module.file_name && (module.file_name.startsWith("http://") || module.file_name.startsWith("https://")) ? (<a className={styles.file__link} href={module.file_name} target="_blank" rel="noopener noreferrer">{module.file_name}</a>) : (<p className={styles.file__link} onClick={() => handleDownload(module.MID)}>{module.file_name}</p>)}</td>
                  <td className={`${styles.hidden} ${styles.role}`}>{module.uploader}</td>
                  <td className={styles.hidden}>{formatDate(module.upload_date)}</td>
                  <td>
                    <div onClick={() => toggleUserDropdown(index)}><img src="/images/threedot.svg" alt="Three Dots" className={styles.three__dots} width={15} height={20} /></div>
                      {activeUserIndex === index && (
                        <div className={styles.dropdown}>
                          <div className={styles.dropdown__item} onClick={() => handleEdit(module)}>Edit</div>
                          <div className={styles.dropdown__item} onClick={() => handleDelete(module)}>Delete</div>
                        </div>
                      )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className={styles.pagination}>
            <p>Showing <span>{indexOfFirstModule + 1} - {Math.min(indexOfLastModule, modules.length)}</span> of <span>{modules.length}</span> Modules</p>
            <div>
              <button onClick={handlePrevious} disabled={currentPage === 1}><i className="ri-arrow-left-s-fill"></i>Prev</button>
              <span>Page {currentPage} of {Math.ceil(modules.length / modulesPerPage)}</span>
              <button onClick={handleNext} disabled={currentPage === Math.ceil(modules.length / modulesPerPage)}>Next<i className="ri-arrow-right-s-fill"></i></button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default AdminModules