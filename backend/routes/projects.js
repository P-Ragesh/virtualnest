const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// Get all projects (admin/hr) or only assigned (employee)
router.get('/', async (req, res) => {
  try {
    let projects;
    if (req.user.role === 'admin' || req.user.role === 'hr') {
      // Admin/Hr gets all
      projects = await prisma.project.findMany({
        include: {
          employees: { include: { employee: true } },
          tasks: true
        }
      });
    } else {
      // Employee gets only their assigned
      const employee = await prisma.employee.findUnique({
        where: { email: req.user.email }
      });
      if (!employee) {
        return res.status(404).json({ error: 'Employee not found' });
      }
      projects = await prisma.project.findMany({
        where: { employees: { some: { employeeId: employee.id } } },
        include: { employees: { include: { employee: true } }, tasks: true }
      });
    }
    res.json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new project (admin/hr)
router.post('/', async (req, res) => {
  try {
    const { title, description, startDate, endDate, priority, status, employees } = req.body;

    const projectData = {
      title,
      description,
      priority: priority || 'medium',
      status: status || 'active'
    };
    if (startDate) projectData.startDate = new Date(startDate);
    if (endDate) projectData.endDate = new Date(endDate);

    // Create project
    const project = await prisma.project.create({
      data: {
        ...projectData,
        employees: employees ? {
          create: employees.map((empId) => ({
            employeeId: parseInt(empId)
          }))
        } : {}
      },
      include: { employees: { include: { employee: true } }, tasks: true }
    });
    res.status(201).json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single project
router.get('/:id', async (req, res) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { employees: { include: { employee: true } }, tasks: true }
    });
    if (!project) res.status(404).json({ error: 'Project not found' });
    else res.json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a project (admin/hr)
router.put('/:id', async (req, res) => {
  try {
    const { title, description, startDate, endDate, priority, status, employees } = req.body;

    const data = {};
    if (title) data.title = title;
    if (description !== undefined) data.description = description;
    if (startDate) data.startDate = new Date(startDate);
    if (endDate) data.endDate = new Date(endDate);
    if (priority) data.priority = priority;
    if (status) data.status = status;

    if (employees) {
      // Replace Project Employees
      data.employees = {
        deleteMany: {},
        create: employees.map((empId) => ({
          employeeId: parseInt(empId)
        }))
      };
    }

    const project = await prisma.project.update({
      where: { id: parseInt(req.params.id) },
      data,
      include: { employees: { include: { employee: true } }, tasks: true }
    });
    res.json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a project (admin/hr)
router.delete('/:id', async (req, res) => {
  try {
    await prisma.project.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark project as completed for current employee
router.put('/:id/complete', async (req, res) => {
  try {
    const employee = await prisma.employee.findUnique({
      where: { email: req.user.email }
    });
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    const updatedProjectEmployee = await prisma.projectEmployee.update({
      where: {
        projectId_employeeId: {
          projectId: parseInt(req.params.id),
          employeeId: employee.id
        }
      },
      data: { status: 'completed', completedAt: new Date() }
    });
    res.json(updatedProjectEmployee);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
