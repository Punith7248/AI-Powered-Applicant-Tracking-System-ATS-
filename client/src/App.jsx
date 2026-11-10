import React, { useState } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Typography, Button, Paper, TextField, MenuItem,
  Card, CardContent, Chip, Alert, Stack, Grid, Dialog, DialogTitle,
  DialogContent, DialogActions, LinearProgress
} from "@mui/material";
import api from "./api";

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

function AuthPage({ mode, saveUser }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name:"", email:"", password:"", role:"applicant" });
  const [error, setError] = useState("");
  const mutation = useMutation({
    mutationFn: async () => (await api.post(`/auth/${mode}`, form)).data,
    onSuccess: data => { localStorage.setItem("ats_token", data.token); saveUser(data.user); navigate(data.user.role === "recruiter" ? "/dashboard" : "/jobs"); },
    onError: e => setError(e.response?.data?.message || "Unable to continue")
  });
  const change = key => e => setForm({ ...form, [key]: e.target.value });
  return <div className="page" style={{maxWidth:520}}>
    <Paper sx={{p:4}}>
      <Typography variant="h5" gutterBottom>{mode === "login" ? "Welcome back" : "Create your account"}</Typography>
      <Typography color="text.secondary" sx={{mb:3}}>Access your TalentFlow recruitment workspace.</Typography>
      {error && <Alert severity="error" sx={{mb:2}}>{error}</Alert>}
      <Stack spacing={2}>
        {mode === "register" && <TextField label="Full name" value={form.name} onChange={change("name")} required />}
        <TextField label="Email" type="email" value={form.email} onChange={change("email")} required />
        <TextField label="Password (minimum 8 characters)" type="password" value={form.password} onChange={change("password")} required />
        {mode === "register" && <TextField select label="I am joining as" value={form.role} onChange={change("role")}><MenuItem value="applicant">Applicant</MenuItem><MenuItem value="recruiter">Recruiter</MenuItem></TextField>}
        <Button variant="contained" size="large" disabled={mutation.isPending} onClick={() => mutation.mutate()}>{mode === "login" ? "Login" : "Create account"}</Button>
      </Stack>
      <Typography sx={{mt:2}} color="text.secondary" variant="body2">{mode === "login" ? "New here? " : "Already registered? "}<Link to={mode === "login" ? "/register" : "/login"} style={{color:"#3157d5"}}>{mode === "login" ? "Create an account" : "Login"}</Link></Typography>
    </Paper>
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

function JobsPage({ user }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [file, setFile] = useState(null);
  const [notice, setNotice] = useState("");
  const qc = useQueryClient();
  const jobs = useQuery({ queryKey:["jobs",search], queryFn: async () => (await api.get("/jobs", {params:{search}})).data });
  const apply = useMutation({
    mutationFn: async () => { const fd = new FormData(); fd.append("jobId", selected._id); fd.append("resume", file); return (await api.post("/applications", fd)).data; },
    onSuccess: () => { setNotice("Application submitted successfully."); setSelected(null); setFile(null); qc.invalidateQueries({queryKey:["myApps"]}); },
    onError: e => setNotice(e.response?.data?.message || "Application failed")
  });
  return <div className="page">
    <div className="row"><div><Typography variant="h4">Explore opportunities</Typography><Typography color="text.secondary">Find a role that matches your skills.</Typography></div><TextField size="small" placeholder="Search jobs or skills" value={search} onChange={e=>setSearch(e.target.value)} /></div>
    {notice && <Alert sx={{my:2}} severity={notice.includes("success")?"success":"info"} onClose={()=>setNotice("")}>{notice}</Alert>}
    {jobs.isLoading ? <LinearProgress sx={{mt:3}}/> : <div className="grid" style={{marginTop:24}}>
      {jobs.data?.map(job=><Card key={job._id}><CardContent>
        <Chip size="small" label={job.type || "Full-time"} color="primary" variant="outlined"/>
        <Typography variant="h6" sx={{mt:2}}>{job.title}</Typography><Typography color="text.secondary">{job.company} · {job.location}</Typography>
        <Typography sx={{my:2}} color="text.secondary">{job.description.slice(0,150)}{job.description.length>150?"…":""}</Typography>
        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">{job.skills?.slice(0,5).map(s=><Chip key={s} size="small" label={s}/>)}</Stack>
        <Button sx={{mt:2}} variant="contained" disabled={!user || user.role!=="applicant"} onClick={()=>setSelected(job)}>{!user?"Login to apply":user.role!=="applicant"?"Applicant account required":"Apply now"}</Button>
      </CardContent></Card>)}
      {!jobs.data?.length && <Typography color="text.secondary">No active jobs found.</Typography>}
    </div>}
    <Dialog open={!!selected} onClose={()=>setSelected(null)} fullWidth maxWidth="sm">
      <DialogTitle>Apply for {selected?.title}</DialogTitle>
      <DialogContent><Typography color="text.secondary" sx={{mb:2}}>Upload your resume in PDF or DOCX format (maximum 5 MB).</Typography><Button component="label" variant="outlined">Choose resume<input hidden type="file" accept=".pdf,.docx,application/pdf" onChange={e=>setFile(e.target.files?.[0] || null)}/></Button><Typography sx={{mt:1}} variant="body2">{file?.name || "No file selected"}</Typography></DialogContent>
      <DialogActions><Button onClick={()=>setSelected(null)}>Cancel</Button><Button variant="contained" disabled={!file || apply.isPending} onClick={()=>apply.mutate()}>Submit application</Button></DialogActions>
    </Dialog>
  </div>;
}

export default function App() {
  const [user, saveUser] = useUser();
  return <><Nav user={user} logout={() => saveUser(null)} /><Routes>
    <Route path="/" element={<Home />} />
    <Route path="/jobs" element={<JobsPage user={user} />} />
    <Route path="/login" element={<AuthPage mode="login" saveUser={saveUser} />} />
    <Route path="/register" element={<AuthPage mode="register" saveUser={saveUser} />} />
    <Route path="*" element={<div className="page"><Typography>Page not found.</Typography></div>} />
  </Routes></>;
}
