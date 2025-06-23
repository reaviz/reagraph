import React, { useState, useCallback, useMemo } from 'react';
import { GraphCanvas, lightTheme, darkTheme } from '../../src';

export default {
  title: 'Demos/Drill-Down Navigation',
  component: GraphCanvas
};

// Generate organizational hierarchy data
const generateOrganizationData = () => {
  const company = {
    id: 'company',
    label: 'TechCorp Inc.',
    type: 'company',
    data: {
      employees: 5000,
      revenue: '2.5B',
      departments: ['Engineering', 'Sales', 'Marketing', 'Support', 'Operations']
    }
  };

  const departments = [
    {
      id: 'eng',
      label: 'Engineering',
      type: 'department',
      data: { employees: 2000, teams: 20, budget: '800M' }
    },
    {
      id: 'sales',
      label: 'Sales',
      type: 'department',
      data: { employees: 1000, teams: 10, budget: '400M' }
    },
    {
      id: 'marketing',
      label: 'Marketing',
      type: 'department',
      data: { employees: 500, teams: 5, budget: '200M' }
    },
    {
      id: 'support',
      label: 'Support',
      type: 'department',
      data: { employees: 800, teams: 8, budget: '300M' }
    },
    {
      id: 'ops',
      label: 'Operations',
      type: 'department',
      data: { employees: 700, teams: 7, budget: '350M' }
    }
  ];

  const teams = {
    eng: [
      { id: 'eng-frontend', label: 'Frontend', employees: 300 },
      { id: 'eng-backend', label: 'Backend', employees: 400 },
      { id: 'eng-mobile', label: 'Mobile', employees: 200 },
      { id: 'eng-devops', label: 'DevOps', employees: 150 },
      { id: 'eng-qa', label: 'QA', employees: 250 },
      { id: 'eng-security', label: 'Security', employees: 100 },
      { id: 'eng-data', label: 'Data', employees: 300 },
      { id: 'eng-ml', label: 'Machine Learning', employees: 300 }
    ],
    sales: [
      { id: 'sales-enterprise', label: 'Enterprise', employees: 400 },
      { id: 'sales-smb', label: 'SMB', employees: 300 },
      { id: 'sales-partners', label: 'Partners', employees: 200 },
      { id: 'sales-inside', label: 'Inside Sales', employees: 100 }
    ],
    marketing: [
      { id: 'marketing-brand', label: 'Brand', employees: 150 },
      { id: 'marketing-digital', label: 'Digital', employees: 200 },
      { id: 'marketing-content', label: 'Content', employees: 100 },
      { id: 'marketing-events', label: 'Events', employees: 50 }
    ],
    support: [
      { id: 'support-t1', label: 'Tier 1', employees: 400 },
      { id: 'support-t2', label: 'Tier 2', employees: 250 },
      { id: 'support-t3', label: 'Tier 3', employees: 100 },
      { id: 'support-success', label: 'Customer Success', employees: 50 }
    ],
    ops: [
      { id: 'ops-it', label: 'IT', employees: 200 },
      { id: 'ops-facilities', label: 'Facilities', employees: 150 },
      { id: 'ops-hr', label: 'HR', employees: 200 },
      { id: 'ops-finance', label: 'Finance', employees: 150 }
    ]
  };

  const individuals = {};
  Object.keys(teams).forEach(dept => {
    teams[dept].forEach(team => {
      const teamIndividuals = [];
      const individualCount = Math.min(Math.floor(team.employees / 10), 20); // Limit to 20 per team
      
      for (let i = 0; i < individualCount; i++) {
        const roles = ['Manager', 'Senior', 'Mid', 'Junior'];
        const role = roles[Math.floor(Math.random() * roles.length)];
        teamIndividuals.push({
          id: `${team.id}-person-${i}`,
          label: `${role} ${i + 1}`,
          type: 'person',
          data: {
            role,
            experience: Math.floor(Math.random() * 10) + 1,
            skills: Math.floor(Math.random() * 5) + 3
          }
        });
      }
      individuals[team.id] = teamIndividuals;
    });
  });

  return { company, departments, teams, individuals };
};

export const DrillDownOrganization = () => {
  const orgData = useMemo(() => generateOrganizationData(), []);
  const [currentLevel, setCurrentLevel] = useState('company');
  const [currentParent, setCurrentParent] = useState(null);
  const [breadcrumb, setBreadcrumb] = useState([{ id: 'company', label: 'TechCorp Inc.' }]);

  // Get nodes and edges for current level
  const { nodes, edges } = useMemo(() => {
    const nodes = [];
    const edges = [];

    if (currentLevel === 'company') {
      // Company level - show company and departments
      nodes.push({
        ...orgData.company,
        fill: '#1a1a1a',
        size: 30,
        data: { ...orgData.company.data, clickable: false }
      });

      orgData.departments.forEach(dept => {
        nodes.push({
          ...dept,
          fill: '#4ecdc4',
          size: Math.log(dept.data.employees) * 5,
          data: { ...dept.data, clickable: true }
        });
        edges.push({
          id: `edge-company-${dept.id}`,
          source: 'company',
          target: dept.id
        });
      });
    } else if (currentLevel === 'department' && currentParent) {
      // Department level - show department and teams
      const dept = orgData.departments.find(d => d.id === currentParent);
      nodes.push({
        ...dept,
        fill: '#4ecdc4',
        size: 25,
        data: { ...dept.data, clickable: false }
      });

      orgData.teams[currentParent]?.forEach(team => {
        nodes.push({
          id: team.id,
          label: team.label,
          type: 'team',
          fill: '#45b7d1',
          size: Math.log(team.employees) * 4,
          data: { employees: team.employees, clickable: true }
        });
        edges.push({
          id: `edge-${currentParent}-${team.id}`,
          source: currentParent,
          target: team.id
        });
      });
    } else if (currentLevel === 'team' && currentParent) {
      // Team level - show team and individuals
      const [deptId] = currentParent.split('-');
      const team = orgData.teams[deptId]?.find(t => t.id === currentParent);
      
      if (team) {
        nodes.push({
          id: team.id,
          label: team.label,
          type: 'team',
          fill: '#45b7d1',
          size: 20,
          data: { employees: team.employees, clickable: false }
        });

        orgData.individuals[currentParent]?.forEach(person => {
          nodes.push({
            ...person,
            fill: person.data.role === 'Manager' ? '#ff6b6b' : '#96ceb4',
            size: 8 + person.data.skills,
            data: { ...person.data, clickable: false }
          });
          edges.push({
            id: `edge-${currentParent}-${person.id}`,
            source: currentParent,
            target: person.id
          });
        });
      }
    }

    return { nodes, edges };
  }, [currentLevel, currentParent, orgData]);

  const handleNodeClick = useCallback((node) => {
    if (!node.data?.clickable) return;

    if (node.type === 'department') {
      setCurrentLevel('department');
      setCurrentParent(node.id);
      setBreadcrumb(prev => [...prev, { id: node.id, label: node.label }]);
    } else if (node.type === 'team') {
      setCurrentLevel('team');
      setCurrentParent(node.id);
      setBreadcrumb(prev => [...prev, { id: node.id, label: node.label }]);
    }
  }, []);

  const handleBreadcrumbClick = useCallback((index) => {
    const item = breadcrumb[index];
    setBreadcrumb(prev => prev.slice(0, index + 1));

    if (index === 0) {
      setCurrentLevel('company');
      setCurrentParent(null);
    } else if (item.id.includes('-')) {
      // It's a team
      setCurrentLevel('team');
      setCurrentParent(item.id);
    } else {
      // It's a department
      setCurrentLevel('department');
      setCurrentParent(item.id);
    }
  }, [breadcrumb]);

  return (
    <div>
      <h3>Drill-Down Organization Chart</h3>
      <p>
        Click on departments to drill down into teams, then click teams to see individuals.
        Use breadcrumb navigation to go back up the hierarchy.
      </p>

      <div style={{ 
        background: '#f0f0f0', 
        padding: '10px',
        marginBottom: '10px',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        gap: '5px'
      }}>
        <strong>Navigation:</strong>
        {breadcrumb.map((item, index) => (
          <React.Fragment key={item.id}>
            {index > 0 && <span> → </span>}
            <button
              onClick={() => handleBreadcrumbClick(index)}
              style={{
                background: 'none',
                border: 'none',
                color: index === breadcrumb.length - 1 ? '#000' : '#0066cc',
                cursor: index === breadcrumb.length - 1 ? 'default' : 'pointer',
                textDecoration: index === breadcrumb.length - 1 ? 'none' : 'underline',
                padding: '2px 4px',
                fontSize: '14px'
              }}
            >
              {item.label}
            </button>
          </React.Fragment>
        ))}
      </div>

      <div style={{ 
        background: '#e8f5e8', 
        padding: '10px',
        marginBottom: '10px',
        borderRadius: '4px'
      }}>
        <strong>Current View:</strong> {nodes.length} nodes, {edges.length} edges
        {currentLevel !== 'team' && (
          <span> (Click nodes to drill down)</span>
        )}
      </div>

      <div style={{ height: '600px' }}>
        <GraphCanvas
          nodes={nodes}
          edges={edges}
          theme={lightTheme}
          layoutType={currentLevel === 'company' ? 'radialOut2d' : 'forceDirected2d'}
          layoutOverrides={{
            nodeStrength: -1500,
            linkDistance: 150
          }}
          onNodeClick={handleNodeClick}
          animated
          draggable
        />
      </div>
    </div>
  );
};

export const DrillDownWithStats = () => {
  const orgData = useMemo(() => generateOrganizationData(), []);
  const [currentLevel, setCurrentLevel] = useState('company');
  const [currentParent, setCurrentParent] = useState(null);
  const [breadcrumb, setBreadcrumb] = useState([{ id: 'company', label: 'TechCorp Inc.' }]);
  const [selectedNode, setSelectedNode] = useState(null);

  // Calculate stats for current view
  const stats = useMemo(() => {
    if (currentLevel === 'company') {
      return {
        totalEmployees: orgData.company.data.employees,
        totalDepartments: orgData.departments.length,
        avgDeptSize: Math.round(orgData.company.data.employees / orgData.departments.length),
        totalBudget: '2.05B'
      };
    } else if (currentLevel === 'department' && currentParent) {
      const dept = orgData.departments.find(d => d.id === currentParent);
      const teams = orgData.teams[currentParent] || [];
      return {
        departmentEmployees: dept?.data.employees || 0,
        totalTeams: teams.length,
        avgTeamSize: Math.round((dept?.data.employees || 0) / teams.length),
        departmentBudget: dept?.data.budget || '0'
      };
    } else if (currentLevel === 'team' && currentParent) {
      const individuals = orgData.individuals[currentParent] || [];
      const managers = individuals.filter(p => p.data.role === 'Manager').length;
      const seniors = individuals.filter(p => p.data.role === 'Senior').length;
      return {
        teamMembers: individuals.length,
        managers,
        seniors,
        avgExperience: Math.round(
          individuals.reduce((sum, p) => sum + p.data.experience, 0) / individuals.length
        )
      };
    }
    return {};
  }, [currentLevel, currentParent, orgData]);

  const { nodes, edges } = useMemo(() => {
    const nodes = [];
    const edges = [];

    if (currentLevel === 'company') {
      nodes.push({
        ...orgData.company,
        fill: '#1a1a1a',
        size: 40,
        data: { ...orgData.company.data, clickable: false }
      });

      orgData.departments.forEach(dept => {
        nodes.push({
          ...dept,
          fill: {
            'Engineering': '#ff6b6b',
            'Sales': '#4ecdc4',
            'Marketing': '#45b7d1',
            'Support': '#96ceb4',
            'Operations': '#feca57'
          }[dept.label] || '#999',
          size: 20 + Math.log(dept.data.employees) * 3,
          data: { ...dept.data, clickable: true }
        });
        edges.push({
          id: `edge-company-${dept.id}`,
          source: 'company',
          target: dept.id,
          label: `${dept.data.employees} emp`
        });
      });
    } else if (currentLevel === 'department' && currentParent) {
      const dept = orgData.departments.find(d => d.id === currentParent);
      const deptColor = {
        'eng': '#ff6b6b',
        'sales': '#4ecdc4',
        'marketing': '#45b7d1',
        'support': '#96ceb4',
        'ops': '#feca57'
      }[currentParent] || '#999';

      nodes.push({
        ...dept,
        fill: deptColor,
        size: 30,
        data: { ...dept.data, clickable: false }
      });

      orgData.teams[currentParent]?.forEach((team, i) => {
        nodes.push({
          id: team.id,
          label: team.label,
          type: 'team',
          fill: `${deptColor}cc`,
          size: 10 + Math.log(team.employees) * 3,
          data: { employees: team.employees, clickable: true }
        });
        edges.push({
          id: `edge-${currentParent}-${team.id}`,
          source: currentParent,
          target: team.id,
          label: `${team.employees} emp`
        });
      });
    } else if (currentLevel === 'team' && currentParent) {
      const [deptId] = currentParent.split('-');
      const team = orgData.teams[deptId]?.find(t => t.id === currentParent);
      const deptColor = {
        'eng': '#ff6b6b',
        'sales': '#4ecdc4',
        'marketing': '#45b7d1',
        'support': '#96ceb4',
        'ops': '#feca57'
      }[deptId] || '#999';
      
      if (team) {
        nodes.push({
          id: team.id,
          label: team.label,
          type: 'team',
          fill: deptColor,
          size: 25,
          data: { employees: team.employees, clickable: false }
        });

        orgData.individuals[currentParent]?.forEach(person => {
          const roleColors = {
            'Manager': '#e74c3c',
            'Senior': '#f39c12',
            'Mid': '#3498db',
            'Junior': '#2ecc71'
          };
          
          nodes.push({
            ...person,
            fill: roleColors[person.data.role] || '#95a5a6',
            size: 6 + person.data.experience * 0.5,
            data: { ...person.data, clickable: false }
          });
          edges.push({
            id: `edge-${currentParent}-${person.id}`,
            source: currentParent,
            target: person.id,
            label: person.data.role[0]
          });
        });
      }
    }

    return { nodes, edges };
  }, [currentLevel, currentParent, orgData]);

  const handleNodeClick = useCallback((node) => {
    setSelectedNode(node);
    
    if (!node.data?.clickable) return;

    if (node.type === 'department') {
      setCurrentLevel('department');
      setCurrentParent(node.id);
      setBreadcrumb(prev => [...prev, { id: node.id, label: node.label }]);
    } else if (node.type === 'team') {
      setCurrentLevel('team');
      setCurrentParent(node.id);
      setBreadcrumb(prev => [...prev, { id: node.id, label: node.label }]);
    }
  }, []);

  const handleBreadcrumbClick = useCallback((index) => {
    const item = breadcrumb[index];
    setBreadcrumb(prev => prev.slice(0, index + 1));
    setSelectedNode(null);

    if (index === 0) {
      setCurrentLevel('company');
      setCurrentParent(null);
    } else if (item.id.includes('-')) {
      setCurrentLevel('team');
      setCurrentParent(item.id);
    } else {
      setCurrentLevel('department');
      setCurrentParent(item.id);
    }
  }, [breadcrumb]);

  return (
    <div>
      <h3>Drill-Down with Statistics Dashboard</h3>
      <p>
        Navigate through organizational hierarchy with real-time statistics.
        Node sizes represent employee count, colors indicate departments/roles.
      </p>

      <div style={{ 
        background: '#f0f0f0', 
        padding: '10px',
        marginBottom: '10px',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        gap: '5px'
      }}>
        <strong>📍</strong>
        {breadcrumb.map((item, index) => (
          <React.Fragment key={item.id}>
            {index > 0 && <span> → </span>}
            <button
              onClick={() => handleBreadcrumbClick(index)}
              style={{
                background: 'none',
                border: 'none',
                color: index === breadcrumb.length - 1 ? '#000' : '#0066cc',
                cursor: index === breadcrumb.length - 1 ? 'default' : 'pointer',
                textDecoration: index === breadcrumb.length - 1 ? 'none' : 'underline',
                padding: '2px 4px',
                fontSize: '14px',
                fontWeight: index === breadcrumb.length - 1 ? 'bold' : 'normal'
              }}
            >
              {item.label}
            </button>
          </React.Fragment>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ height: '600px' }}>
            <GraphCanvas
              nodes={nodes}
              edges={edges}
              theme={darkTheme}
              layoutType={
                currentLevel === 'company' ? 'radialOut2d' : 
                currentLevel === 'department' ? 'circular2d' : 
                'forceDirected2d'
              }
              layoutOverrides={{
                nodeStrength: -2000,
                linkDistance: currentLevel === 'team' ? 80 : 120
              }}
              onNodeClick={handleNodeClick}
              animated
              draggable
              labelType="all"
            />
          </div>
        </div>

        <div style={{ width: '300px' }}>
          <div style={{ 
            background: '#2c3e50',
            color: 'white',
            padding: '15px',
            borderRadius: '4px',
            marginBottom: '10px'
          }}>
            <h4 style={{ margin: '0 0 10px 0' }}>Level Statistics</h4>
            {currentLevel === 'company' && (
              <>
                <p>📊 Total Employees: {stats.totalEmployees?.toLocaleString()}</p>
                <p>🏢 Departments: {stats.totalDepartments}</p>
                <p>👥 Avg Dept Size: {stats.avgDeptSize}</p>
                <p>💰 Total Budget: {stats.totalBudget}</p>
              </>
            )}
            {currentLevel === 'department' && (
              <>
                <p>👥 Department Size: {stats.departmentEmployees}</p>
                <p>👨‍👩‍👧‍👦 Teams: {stats.totalTeams}</p>
                <p>📊 Avg Team Size: {stats.avgTeamSize}</p>
                <p>💰 Budget: {stats.departmentBudget}</p>
              </>
            )}
            {currentLevel === 'team' && (
              <>
                <p>👥 Team Members: {stats.teamMembers}</p>
                <p>👔 Managers: {stats.managers}</p>
                <p>⭐ Seniors: {stats.seniors}</p>
                <p>📊 Avg Experience: {stats.avgExperience} years</p>
              </>
            )}
          </div>

          {selectedNode && (
            <div style={{ 
              background: '#34495e',
              color: 'white',
              padding: '15px',
              borderRadius: '4px'
            }}>
              <h4 style={{ margin: '0 0 10px 0' }}>Selected Node</h4>
              <p><strong>Label:</strong> {selectedNode.label}</p>
              <p><strong>Type:</strong> {selectedNode.type || 'N/A'}</p>
              {selectedNode.data?.employees && (
                <p><strong>Employees:</strong> {selectedNode.data.employees}</p>
              )}
              {selectedNode.data?.budget && (
                <p><strong>Budget:</strong> {selectedNode.data.budget}</p>
              )}
              {selectedNode.data?.role && (
                <p><strong>Role:</strong> {selectedNode.data.role}</p>
              )}
              {selectedNode.data?.experience && (
                <p><strong>Experience:</strong> {selectedNode.data.experience} years</p>
              )}
              {selectedNode.data?.skills && (
                <p><strong>Skills:</strong> {selectedNode.data.skills}/5</p>
              )}
            </div>
          )}

          <div style={{ 
            background: '#ecf0f1',
            padding: '15px',
            borderRadius: '4px',
            marginTop: '10px'
          }}>
            <h4 style={{ margin: '0 0 10px 0' }}>Legend</h4>
            {currentLevel === 'company' && (
              <>
                <p>🔴 Engineering</p>
                <p>🔵 Sales</p>
                <p>🟦 Marketing</p>
                <p>🟢 Support</p>
                <p>🟡 Operations</p>
              </>
            )}
            {currentLevel === 'team' && (
              <>
                <p>🔴 Manager</p>
                <p>🟠 Senior</p>
                <p>🔵 Mid-level</p>
                <p>🟢 Junior</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};