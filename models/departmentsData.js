const departments = [
  { 
    departmentId: 1, 
    universityId: 1, 
    majorName: 'Computer Science',      
    degreeType: 'B.Sc', 
    faculty: 'Natural Sciences',   
    createDate: '2024-01-01T00:00:00.000Z', 
    updateDate: '2024-01-01T00:00:00.000Z',
    description: 'Focuses on foundations of computation, algorithms, and software development within a rigorous scientific framework.'
  },
  { 
    departmentId: 2, 
    universityId: 2, 
    majorName: 'Computer Science',      
    degreeType: 'B.Sc', 
    faculty: 'Exact Sciences',     
    createDate: '2024-01-01T00:00:00.000Z', 
    updateDate: '2024-01-01T00:00:00.000Z',
    description: 'Combines deep theoretical mathematics and advanced computing principles to drive technology innovation.'
  },
    { 
    departmentId: 3, 
    universityId: 1, 
    majorName: 'Information and Software Systems Engineering',   
    degreeType: 'B.Sc', 
    faculty: 'Sciences',           
    createDate: '2024-01-01T00:00:00.000Z', 
    updateDate: '2024-01-01T00:00:00.000Z',
    description: 'Integrates software engineering methodologies with data management principles to design, build, and optimize scalable enterprise Software and AI infrastructures.'
    },
    { 
    departmentId: 4, 
    universityId: 4, 
    majorName: 'Software Engineering',  
    degreeType: 'B.Sc', 
    faculty: 'Computer Science',   
    createDate: '2024-01-01T00:00:00.000Z', 
    updateDate: '2024-01-01T00:00:00.000Z',
    description: 'Emphasizes systematic, disciplined engineering approaches to large-scale software design, life cycle, and architecture.'
  },
  { 
    departmentId: 5, 
    universityId: 1, 
    majorName: 'Industrial Engineering',
    degreeType: 'B.Sc', 
    faculty: 'Engineering',        
    createDate: '2024-01-01T00:00:00.000Z', 
    updateDate: '2024-01-01T00:00:00.000Z',
    description: 'Optimizes complex processes, systems, and organizations by integrating data science, logistics, and human operations.'
  },
  { 
    departmentId: 6, 
    universityId: 2, 
    majorName: 'Law',                   
    degreeType: 'LL.B', 
    faculty: 'Law',                
    createDate: '2024-01-01T00:00:00.000Z', 
    updateDate: '2024-01-01T00:00:00.000Z',
    description: 'Provides a rigorous legal education focused on jurisprudence, critical advocacy, and contemporary global legal frameworks.'
  },
  { 
    departmentId: 7, 
    universityId: 3, 
    majorName: 'Psychology',            
    degreeType: 'B.A',  
    faculty: 'Social Sciences',    
    createDate: '2024-01-01T00:00:00.000Z', 
    updateDate: '2024-01-01T00:00:00.000Z',
    description: 'Explores human behavior, cognition, and emotional processing through empirical research methods and scientific study.'
  },
  { 
    departmentId: 8, 
    universityId: 5, 
    majorName: 'Business Administration',
    degreeType: 'B.A',  
    faculty: 'Management',         
    createDate: '2024-01-01T00:00:00.000Z', 
    updateDate: '2024-01-01T00:00:00.000Z',
    description: 'Develops core competencies in strategic leadership, modern marketing analytics, finance, and entrepreneurial management.'
  },
  { 
    departmentId: 9, 
    universityId: 6, 
    majorName: 'Communication Studies', 
    degreeType: 'B.A',  
    faculty: 'Social Sciences',    
    createDate: '2024-01-01T00:00:00.000Z', 
    updateDate: '2024-01-01T00:00:00.000Z',
    description: 'Examines the dynamics of digital media, public relations, culture, and information dissemination in modern society.'
  }
];

let nextId = 10;
function getNextId() { return nextId++; }

module.exports = { departments, getNextId };