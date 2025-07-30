const express = require('express');
const router = express.Router();
const EmployeeController = require('../controllers/employeeController');

// Get all employees
router.get('/', EmployeeController.getAllEmployees);

// Add new employee
router.post('/', EmployeeController.createEmployee);

// Get employee by ID
router.get('/:id', EmployeeController.getEmployeeById);

// Update employee
router.put('/:id', EmployeeController.updateEmployee);

// Delete employee
router.delete('/:id', EmployeeController.deleteEmployee);

module.exports = router;
