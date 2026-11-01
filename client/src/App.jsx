import React, { useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import { Typography, Button } from "@mui/material";

function useUser() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("ats_user") || "null"); } catch { return null; }
  });
  const save = value => {
    if (value) { localStorage.setItem("ats_user", JSON.stringify(value)); setUser(value); }
    else { localStorage.removeItem("ats_user"); localStorage.removeItem("ats_token"); setUser(null); }
  };
  return [user, save];
}

function Nav({ user, logout }) {
  return <div className="nav">
    <Link to="/" className="brand">TalentFlow<span style={{color:"#3157d5"}}>.</span></Link>
    <div className="navlinks">
      <Button component={Link} to="/jobs">Find jobs</Button>
      {user?.role === "recruiter" && <Button component={Link} to="/dashboard">Recruiter dashboard</Button>}
      {user?.role === "applicant" && <Button component={Link} to="/applications">My applications</Button>}
      {user ? <><Typography variant="body2" className="muted">{user.name}</Typography><Button color="inherit" onClick={logout}>Logout</Button></> :
        <><Button component={Link} to="/login">Login</Button><Button variant="contained" component={Link} to="/register">Get started</Button></>}
    </div>
  </div>;
}

export default function App() {
  const [user, saveUser] = useUser();
  return <><Nav user={user} logout={() => saveUser(null)} /><Routes>
    <Route path="/" element={<div className="page"><Typography variant="h4">Welcome to TalentFlow</Typography></div>} />
    <Route path="*" element={<div className="page"><Typography>Page not found.</Typography></div>} />
  </Routes></>;
}
