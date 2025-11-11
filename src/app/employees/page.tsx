
"use client";

import { useState } from "react";
import { SidebarLayout } from "@/components/sidebar-layout";
import { useBusiness } from "@/hooks/use-business";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlusCircle, Edit, Trash2, Users, Building } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Employee } from "@/lib/types";
import { EmployeeFormDialog } from "@/components/employees/employee-form-dialog";
import { DeleteEmployeeAlert } from "@/components/employees/delete-employee-alert";
import Link from "next/link";


export default function EmployeesPage() {
  const { 
    business, 
    branches, 
    employees, 
    addEmployee, 
    updateEmployee, 
    deleteEmployee, 
    isLoading 
  } = useBusiness();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(
    null
  );

  const handleOpenForm = (employee: Employee | null = null) => {
    setEditingEmployee(employee);
    setIsFormOpen(true);
  };

  const handleSaveEmployee = (data: Omit<Employee, "id" | "createdAt">) => {
    if (editingEmployee) {
      updateEmployee(editingEmployee.id, data);
    } else {
      addEmployee(data);
    }
    setIsFormOpen(false);
    setEditingEmployee(null);
  };

  const handleDeleteEmployee = (employee: Employee) => {
    setDeletingEmployee(employee);
    setIsDeleteAlertOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deletingEmployee) {
      deleteEmployee(deletingEmployee.id);
    }
    setIsDeleteAlertOpen(false);
    setDeletingEmployee(null);
  };

  const getBranchName = (branchId: string) => {
    return branches.find((b) => b.id === branchId)?.name || "N/A";
  };

  if (!business) {
     return (
       <SidebarLayout>
         <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
            <Card>
              <CardHeader className="flex flex-col items-center justify-center text-center p-8">
                <div className="p-4 bg-primary/10 rounded-full mb-4">
                  <Building className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-2xl">No Business Selected</CardTitle>
                <CardDescription>
                  Please select a business to manage its employees.
                </CardDescription>
                <Link href="/dashboard" className="mt-4">
                    <Button>Go to Dashboard</Button>
                </Link>
              </CardHeader>
            </Card>
         </div>
       </SidebarLayout>
     );
  }

  return (
    <SidebarLayout>
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">
            Manage Employees
          </h1>
          <Button onClick={() => handleOpenForm()}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Employee
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Employee List for {business.name}</CardTitle>
            <CardDescription>
              Add, edit, or remove employees and assign them to branches.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Loading employees...</p>
            ) : employees && employees.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Branch</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="w-[100px] text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employees.map((employee) => (
                      <TableRow key={employee.id}>
                        <TableCell className="font-medium">
                          {employee.name}
                        </TableCell>
                        <TableCell>{employee.email}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {getBranchName(employee.branchId)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                           <Badge variant={employee.role === 'Admin' ? 'default' : 'outline'}>{employee.role}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenForm(employee)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDeleteEmployee(employee)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-muted-foreground/30 py-16 text-center">
                <Users className="h-12 w-12 text-muted-foreground/80" />
                <h3 className="text-xl font-semibold">No Employees Yet</h3>
                <p className="text-muted-foreground">
                  Click "Add Employee" to invite your first team member.
                </p>
                <Button onClick={() => handleOpenForm()} className="mt-2">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Employee
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <EmployeeFormDialog
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSave={handleSaveEmployee}
        employee={editingEmployee}
        branches={branches}
      />

      <DeleteEmployeeAlert
        isOpen={isDeleteAlertOpen}
        onOpenChange={setIsDeleteAlertOpen}
        onConfirm={handleConfirmDelete}
        employeeName={deletingEmployee?.name || ""}
      />
    </SidebarLayout>
  );
}
