const departments = [
  { departmentId: 1, universityId: 1, majorName: 'Computer Science',      degreeType: 'B.Sc', faculty: 'Natural Sciences',  createDate: '2024-01-01T00:00:00.000Z', updateDate: '2024-01-01T00:00:00.000Z' },
  { departmentId: 2, universityId: 2, majorName: 'Computer Science',      degreeType: 'B.Sc', faculty: 'Exact Sciences',    createDate: '2024-01-01T00:00:00.000Z', updateDate: '2024-01-01T00:00:00.000Z' },
  { departmentId: 3, universityId: 3, majorName: 'Information Systems',   degreeType: 'B.Sc', faculty: 'Sciences',          createDate: '2024-01-01T00:00:00.000Z', updateDate: '2024-01-01T00:00:00.000Z' },
  { departmentId: 4, universityId: 4, majorName: 'Software Engineering',  degreeType: 'B.Sc', faculty: 'Computer Science',  createDate: '2024-01-01T00:00:00.000Z', updateDate: '2024-01-01T00:00:00.000Z' },
  { departmentId: 5, universityId: 1, majorName: 'Industrial Engineering',degreeType: 'B.Sc', faculty: 'Engineering',       createDate: '2024-01-01T00:00:00.000Z', updateDate: '2024-01-01T00:00:00.000Z' },
  { departmentId: 6, universityId: 2, majorName: 'Law',                   degreeType: 'LL.B', faculty: 'Law',               createDate: '2024-01-01T00:00:00.000Z', updateDate: '2024-01-01T00:00:00.000Z' },
  { departmentId: 7, universityId: 3, majorName: 'Psychology',            degreeType: 'B.A',  faculty: 'Social Sciences',   createDate: '2024-01-01T00:00:00.000Z', updateDate: '2024-01-01T00:00:00.000Z' },
  { departmentId: 8, universityId: 5, majorName: 'Business Administration',degreeType: 'B.A', faculty: 'Management',        createDate: '2024-01-01T00:00:00.000Z', updateDate: '2024-01-01T00:00:00.000Z' },
  { departmentId: 9, universityId: 6, majorName: 'Communication Studies', degreeType: 'B.A',  faculty: 'Social Sciences',   createDate: '2024-01-01T00:00:00.000Z', updateDate: '2024-01-01T00:00:00.000Z' }
];

let nextId = 10;
function getNextId() { return nextId++; }

module.exports = { departments, getNextId };
