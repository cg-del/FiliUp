import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Paper, Stack, TextField, Typography } from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

export default function ClassLessons() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [classInfo, setClassInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [form, setForm] = useState({ className: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [regenLoading, setRegenLoading] = useState(false);
  const [addStudentLoading, setAddStudentLoading] = useState(false);
  const [addStudentMessage, setAddStudentMessage] = useState('');
  const [addStudentDialogOpen, setAddStudentDialogOpen] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');
  const [studentResults, setStudentResults] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('stories');
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentsError, setStudentsError] = useState('');

  // Get access token from localStorage
  const accessToken = localStorage.getItem('accessToken');

  // Fetch class info
  useEffect(() => {
    setLoading(true);
    setError('');
    axios.get(`http://localhost:8080/api/classes/${classId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })
      .then(res => {
        setClassInfo(res.data);
        setForm({ className: res.data.className, description: res.data.description });
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load class information.');
        setLoading(false);
      });
  }, [classId, accessToken]);

  // Fetch students when Class Record tab is selected
  useEffect(() => {
    if (activeTab === 'classRecord') {
      setStudentsLoading(true);
      setStudentsError('');
      axios.get(`http://localhost:8080/api/classes/${classId}/students`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
        .then(res => {
          setStudents(res.data);
          setStudentsLoading(false);
        })
        .catch(() => {
          setStudentsError('Failed to load students.');
          setStudentsLoading(false);
        });
    }
  }, [activeTab, classId, accessToken]);

  // Edit handlers
  const handleEditOpen = () => setEditDialogOpen(true);
  const handleEditClose = () => setEditDialogOpen(false);
  const handleFormChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleEditSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await axios.put(
        `http://localhost:8080/api/classes/${classId}`,
        {
          className: form.className,
          description: form.description,
          isActive: classInfo.isActive
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );
      setClassInfo(res.data);
      setEditDialogOpen(false);
    } catch {
      alert('Failed to update class.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete handlers
  const handleDeleteOpen = () => setDeleteDialogOpen(true);
  const handleDeleteClose = () => setDeleteDialogOpen(false);

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      await axios.delete(
        `http://localhost:8080/api/classes/${classId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );
      setDeleteDialogOpen(false);
      navigate('/teacher');
    } catch {
      alert('Failed to delete class.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegenerateCode = async () => {
    setRegenLoading(true);
    try {
      const res = await axios.post(
        `http://localhost:8080/api/classes/${classId}/regenerate-code`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );
      setClassInfo(res.data);
    } catch {
      alert('Failed to regenerate class code.');
    } finally {
      setRegenLoading(false);
    }
  };

  // Add Student Modal Handlers
  const handleAddStudentDialogOpen = () => {
    setAddStudentDialogOpen(true);
    setAddStudentMessage('');
    setStudentSearch('');
    setStudentResults([]);
    setSelectedStudent(null);
  };

  const handleAddStudentDialogClose = () => setAddStudentDialogOpen(false);

  const handleAddStudent = async () => {
    if (!selectedStudent) return;
    setAddStudentLoading(true);
    setAddStudentMessage('');
    try {
      const res = await axios.post(
        `http://localhost:8080/api/classes/${classId}/students/${selectedStudent.userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );
      setAddStudentMessage('Student added successfully!');
      setClassInfo(res.data);
      setStudentSearch('');
      setStudentResults([]);
      setSelectedStudent(null);
    } catch {
      setAddStudentMessage('Failed to add student. Please check the ID.');
    } finally {
      setAddStudentLoading(false);
    }
  };

  const handleStudentSearch = async (query) => {
    setSearchLoading(true);
    setStudentResults([]);
    setSelectedStudent(null);
    try {
      const res = await axios.get(
        `http://localhost:8080/api/user/search?name=${encodeURIComponent(query)}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );
      setStudentResults(res.data);
    } catch {
      setStudentResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', p: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Button component={Link} to="/teacher" startIcon={<ArrowBackIcon />} variant="text">
          Bumalik sa Mga Klase
        </Button>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          variant={activeTab === 'stories' ? 'contained' : 'outlined'}
          onClick={() => setActiveTab('stories')}
          sx={{ mr: 2 }}
        >
          Stories
        </Button>
        <Button
          variant={activeTab === 'classRecord' ? 'contained' : 'outlined'}
          onClick={() => setActiveTab('classRecord')}
        >
          Class Record
        </Button>
      </Box>
      {activeTab === 'stories' ? (
        <Paper sx={{ p: 4, mb: 3 }}>
          {loading ? (
            <Stack alignItems="center">
              <CircularProgress />
            </Stack>
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : classInfo ? (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" fontWeight="bold">
                  {classInfo.className}
                </Typography>
                <Box>
                  <Button
                    startIcon={<EditIcon />}
                    onClick={handleEditOpen}
                    sx={{ mr: 1 }}
                    variant="outlined"
                  >
                    I-edit
                  </Button>
                  <Button
                    startIcon={<DeleteIcon />}
                    onClick={handleDeleteOpen}
                    color="error"
                    sx={{ mr: 1 }}
                    variant="outlined"
                  >
                    I-delete
                  </Button>
                  <Button
                    onClick={handleAddStudentDialogOpen}
                    variant="outlined"
                  >
                    Add Student
                  </Button>
                </Box>
              </Box>
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                {classInfo.description}
              </Typography>
              <Typography variant="body1" sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                <strong>Class Code:</strong> {classInfo.classCode}
                <Button
                  size="small"
                  startIcon={<AutorenewIcon />}
                  onClick={handleRegenerateCode}
                  disabled={regenLoading}
                  sx={{ ml: 2 }}
                  variant="outlined"
                >
                  {regenLoading ? 'Regenerating...' : 'Regenerate'}
                </Button>
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                <strong>Created At:</strong> {new Date(classInfo.createdAt).toLocaleString()}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                <strong>Status:</strong> {classInfo.isActive ? 'Active' : 'Inactive'}
              </Typography>
            </>
          ) : null}
          <Typography variant="h5" gutterBottom>Stories (CRUD coming soon)</Typography>
        </Paper>
      ) : (
        <Paper sx={{ p: 4, mb: 3 }}>
          <Typography variant="h5" gutterBottom>Class Record</Typography>
          {studentsLoading ? (
            <Stack alignItems="center"><CircularProgress /></Stack>
          ) : studentsError ? (
            <Typography color="error">{studentsError}</Typography>
          ) : students.length > 0 ? (
            <Box>
              {students.map(student => (
                <Box key={student.userId} sx={{ p: 1, borderBottom: '1px solid #eee' }}>
                  <Typography>
                    {student.userName} ({student.userEmail})
                  </Typography>
                </Box>
              ))}
            </Box>
          ) : (
            <Typography>No students enrolled in this class.</Typography>
          )}
        </Paper>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={handleEditClose}>
        <DialogTitle>I-edit ang Klase</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="className"
            label="Pangalan ng Klase"
            type="text"
            fullWidth
            value={form.className}
            onChange={handleFormChange}
            sx={{ mb: 2 }}
            required
          />
          <TextField
            margin="dense"
            name="description"
            label="Deskripsyon"
            type="text"
            fullWidth
            value={form.description}
            onChange={handleFormChange}
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose} disabled={isSubmitting}>
            Kanselahin
          </Button>
          <Button onClick={handleEditSubmit} variant="contained" disabled={isSubmitting || !form.className.trim()}>
            {isSubmitting ? 'Saving...' : 'I-save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteClose}>
        <DialogTitle>I-delete ang Klase</DialogTitle>
        <DialogContent>
          <Typography>Sigurado ka bang gusto mong i-delete ang klaseng ito?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteClose} disabled={isSubmitting}>
            Kanselahin
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? 'Deleting...' : 'I-delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Student Dialog */}
      <Dialog open={addStudentDialogOpen} onClose={handleAddStudentDialogClose}>
        <DialogTitle>Add Student to Class</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Search Student Name"
            type="text"
            fullWidth
            value={studentSearch}
            onChange={e => {
              setStudentSearch(e.target.value);
              if (e.target.value.length >= 2) {
                handleStudentSearch(e.target.value);
              } else {
                setStudentResults([]);
              }
            }}
            disabled={addStudentLoading}
          />
          {searchLoading && <Typography>Searching...</Typography>}
          {studentResults.length > 0 && (
            <Box sx={{ maxHeight: 200, overflowY: 'auto', mt: 1 }}>
              {studentResults.map(student => (
                <Box
                  key={student.userId}
                  sx={{
                    p: 1,
                    cursor: 'pointer',
                    bgcolor: selectedStudent?.userId === student.userId ? 'action.selected' : 'background.paper',
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                  onClick={() => setSelectedStudent(student)}
                >
                  <Typography>
                    {student.userName} ({student.userEmail})
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
          {addStudentMessage && (
            <Typography sx={{ mt: 1 }} color={addStudentMessage.includes('success') ? 'success.main' : 'error'}>
              {addStudentMessage}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddStudentDialogClose} disabled={addStudentLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleAddStudent}
            variant="contained"
            disabled={addStudentLoading || !selectedStudent}
          >
            {addStudentLoading ? 'Adding...' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 