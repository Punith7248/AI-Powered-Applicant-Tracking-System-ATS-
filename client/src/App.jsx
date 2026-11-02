import React, { useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import { Typography, Button, Paper, Chip, Stack, Grid } from "@mui/material";

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

function Home() {
  return <div className="page">
    <section className="hero">
      <Chip label="AI-POWERED RECRUITMENT" sx={{bgcolor:"#ffffff20",color:"white",mb:2}} />
      <Typography variant="h3" sx={{fontWeight:900,maxWidth:720}}>Find the right talent. Faster.</Typography>
      <p>One workspace for job publishing, resume screening, candidate insights and the entire hiring pipeline.</p>
      <Stack direction="row" spacing={2} sx={{mt:3}}><Button component={Link} to="/jobs" variant="contained" color="inherit" sx={{color:"#172554"}}>Explore jobs</Button><Button component={Link} to="/register" variant="outlined" sx={{color:"white",borderColor:"#ffffff99"}}>Create account</Button></Stack>
    </section>
    <Grid container spacing={2}>
      {[
        ["01","Publish roles","Create and manage openings from a recruiter workspace."],
        ["02","Understand resumes","Extract resume text and identify relevant job skills."],
        ["03","Move hiring forward","Rank applications and update candidates through a clear pipeline."]
      ].map(x=><Grid item xs={12} md={4} key={x[0]}><Paper sx={{p:3,height:"100%"}}><Typography color="primary" fontWeight={800}>{x[0]}</Typography><Typography variant="h6" sx={{my:1}}>{x[1]}</Typography><Typography color="text.secondary">{x[2]}</Typography></Paper></Grid>)}
    </Grid>
  </div>;
}

export default function App() {
  const [user, saveUser] = useUser();
  return <><Nav user={user} logout={() => saveUser(null)} /><Routes>
    <Route path="/" element={<Home />} />
    <Route path="*" element={<div className="page"><Typography>Page not found.</Typography></div>} />
  </Routes></>;
}
